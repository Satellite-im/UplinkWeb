<script lang="ts">
    import { Button, Icon, Text, Spacer } from "$lib/elements"
    import { Appearance, Route, Shape, Size } from "$lib/enums"
    import { Controls } from "$lib/layouts"
    import { defaultUser, type Chat, type User } from "$lib/types"
    import { onMount } from "svelte"
    import ProfilePicture from "../profile/ProfilePicture.svelte"
    import { playSound, SoundHandler, Sounds } from "../utils/SoundHandler"
    import { Store } from "$lib/state/Store"
    import { VoiceRTCInstance } from "$lib/media/Voice"
    import { goto } from "$app/navigation"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"

    let callSound: SoundHandler
    onMount(() => {
        setInterval(async () => {
            if (VoiceRTCInstance.isReceivingCall) {
                // callSound = playSound(Sounds.IncomingCall)
                pending = true
                pendingChatCall = VoiceRTCInstance.channel
                let callingChat = Store.getCallingChat(VoiceRTCInstance.channel)
                if (callingChat) {
                    chat = callingChat
                    user = (await MultipassStoreInstance.identity_from_did(callingChat.users[1])) ?? defaultUser
                }
            } else {
                pending = false
            }
        }, 1000)
    })
    let chat: Chat | undefined = undefined
    let user: User = defaultUser

    $: pending = VoiceRTCInstance.isReceivingCall
    $: pendingChatCall = ""
</script>

{#if pending}
    <div id="incoming-call">
        <div class="body">
            <div class="content">
                <ProfilePicture id={user.key} hook="friend-profile-picture" size={Size.Large} image={user.profile.photo.image} status={user.profile.status} />
                <Text>{user.name}</Text>
                <Text muted>{user.profile.status_message}</Text>
                <Spacer />
                <Controls>
                    <Button
                        appearance={Appearance.Success}
                        text="Answer"
                        on:click={async _ => {
                            VoiceRTCInstance.isReceivingCall = false
                            let activeChat = Store.setActiveChatByID(VoiceRTCInstance.channel)
                            if (activeChat) {
                                Store.setActiveCall(activeChat)
                            }
                            goto(Route.Chat)
                            pending = false
                            Store.acceptCall()
                            callSound.stop()
                            await VoiceRTCInstance.acceptCall()
                        }}>
                        <Icon icon={Shape.PhoneCall} />
                    </Button>
                    <Button
                        appearance={Appearance.Error}
                        text="End"
                        on:click={_ => {
                            VoiceRTCInstance.isReceivingCall = false
                            pending = false
                            Store.denyCall()
                            callSound.stop()
                            VoiceRTCInstance.endCall()
                        }}>
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
