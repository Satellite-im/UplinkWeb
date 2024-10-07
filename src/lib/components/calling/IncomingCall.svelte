<script lang="ts">
    import { Button, Icon, Text, Spacer } from "$lib/elements"
    import { Appearance, Route, Shape, Size } from "$lib/enums"
    import { Controls } from "$lib/layouts"
    import { defaultUser } from "$lib/types"
    import ProfilePicture from "../profile/ProfilePicture.svelte"
    import { playSound, SoundHandler, Sounds } from "../utils/SoundHandler"
    import { Store } from "$lib/state/Store"
    import { VoiceRTCInstance } from "$lib/media/Voice"
    import { goto } from "$app/navigation"
    import { writable } from "svelte/store"

    let callSound: SoundHandler | undefined = undefined
    let pending = false
    let user = writable(defaultUser)

    Store.state.pendingCall.subscribe(async _ => {
        if (VoiceRTCInstance.incomingCallFrom && !VoiceRTCInstance.toCall) {
            if (callSound === null || callSound === undefined) {
                callSound = playSound(Sounds.IncomingCall)
                callSound.play()
            }
            pending = true
            user = Store.getUser(VoiceRTCInstance.incomingCallFrom[1].metadata.userInfo.did)
        } else {
            pending = false
            callSound?.stop()
            callSound = undefined
        }
    })

    async function answerCall() {
        goto(Route.Chat)
        await VoiceRTCInstance.acceptCall(true)
        Store.setActiveChat(Store.getCallingChat(VoiceRTCInstance.channel!)!)
        pending = false
        callSound?.stop()
        callSound = undefined
    }

    function endCall() {
        pending = false
        callSound?.stop()
        callSound = undefined
        VoiceRTCInstance.leaveCall(false)
    }
</script>

{#if pending}
    <div id="incoming-call">
        <div class="body">
            <div class="content">
                <ProfilePicture id={$user.key} hook="friend-profile-picture" size={Size.Large} image={$user.profile.photo.image} status={$user.profile.status} />
                <Text>{$user.name}</Text>
                <Text muted>{$user.profile.status_message}</Text>
                <Spacer />
                <Controls>
                    <Button appearance={Appearance.Success} text="Answer" on:click={answerCall}>
                        <Icon icon={Shape.PhoneCall} />
                    </Button>
                    <Button appearance={Appearance.Error} text="End" on:click={endCall}>
                        <Icon icon={Shape.PhoneXMark} />
                    </Button>
                </Controls>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    #incoming-call {
        position: absolute;
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        width: 100%;
        flex: 1;

        .body {
            position: absolute;
            z-index: 1000;
            backdrop-filter: blur(var(--blur-radius));
            background-color: var(--opaque-color);
            width: 100vw;
            height: 100vh;
            display: inline-flex;
            justify-content: center;
            align-items: center;

            .content {
                animation: pulse-success 1s infinite;
                box-shadow: 0 0 0 2em transparent;
                background-color: var(--background-alt);
                gap: var(--gap);
                height: fit-content;
                padding: calc(var(--padding) * 2) var(--padding) var(--padding) var(--padding);
                border-radius: var(--border-radius-more);
                display: inline-flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                border: var(--border-width) solid var(--success-color);
            }
        }
    }
</style>
