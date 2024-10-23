<script lang="ts">
    import { Button, Icon, Text, Spacer } from "$lib/elements"
    import { Appearance, ChatType, Route, Shape, Size } from "$lib/enums"
    import { Controls } from "$lib/layouts"
    import { defaultChat, defaultUser } from "$lib/types"
    import ProfilePicture from "../profile/ProfilePicture.svelte"
    import { playSound, SoundHandler, Sounds } from "../utils/SoundHandler"
    import { Store } from "$lib/state/Store"
    import { callInProgress, connectionOpened, VoiceRTCInstance } from "$lib/media/Voice"
    import { goto } from "$app/navigation"
    import { writable } from "svelte/store"
    import { onDestroy, onMount } from "svelte"
    import { _ } from "svelte-i18n"
    import { UIStore } from "$lib/state/ui/index.js"
    import ProfilePictureMany from "../profile/ProfilePictureMany.svelte"

    let callSound: SoundHandler | undefined = undefined
    let pending = false
    let user = writable(defaultUser)
    let timeOutToCancel: NodeJS.Timeout | undefined = undefined
    $: cancelledCall = false

    onMount(() => {
        cancelledCall = false
        clearTimeout(timeOutToCancel)
    })

    onDestroy(() => {
        cancelledCall = false
        clearTimeout(timeOutToCancel)
    })
    const callChat = writable(defaultChat)
    $: users = Store.getUsers($callChat.users)

    Store.state.pendingCall.subscribe(async _ => {
        if (VoiceRTCInstance.incomingCallFrom && !VoiceRTCInstance.toCall && $connectionOpened) {
            if (callSound === null || callSound === undefined) {
                callSound = await playSound(Sounds.IncomingCall)
            }
            pending = true
            let chat = UIStore.getChat(VoiceRTCInstance.incomingCallFrom[1].metadata.channel)
            if (chat) {
                callChat.set(chat)
                users = Store.getUsers($callChat.users)
            }

            user = Store.getUser(VoiceRTCInstance.incomingCallFrom[1].metadata.did)
        } else if (!$connectionOpened) {
            cancelledCall = true
            callSound?.stop()
            callSound = undefined
            timeOutToCancel = setTimeout(() => {
                cancelledCall = false
                pending = false
            }, 4000)
        } else {
            pending = false
            callSound?.stop()
            callSound = undefined
        }
    })

    async function answerCall(onlyAudio: boolean = true) {
        goto(Route.Chat)
        await VoiceRTCInstance.acceptCall(onlyAudio)
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

{#if pending && (VoiceRTCInstance.incomingCallFrom === null || (VoiceRTCInstance.incomingCallFrom && $callInProgress !== VoiceRTCInstance.incomingCallFrom[1]?.metadata.channel))}
    <div id="incoming-call">
        <div class="body">
            <div class="content" style={cancelledCall ? "border: var(--border-width) solid var(--warning-color);" : "border: var(--border-width) solid var(--success-color);"}>
                {#if cancelledCall}
                    <ProfilePicture id={$user.key} hook="friend-profile-picture" size={Size.Large} image={$user.profile.photo.image} status={$user.profile.status} />
                    <Text>{$user.name}</Text>
                    <Text muted size={Size.Large}>{$_("settings.calling.hasCancelled")}</Text>
                    <Text muted size={Size.Large}>{$_("settings.calling.disconnecting")}</Text>
                    <Spacer less={true} />
                {:else}
                    {#if $callChat.kind === ChatType.DirectMessage}
                        <ProfilePicture id={$user.key} hook="friend-profile-picture" size={Size.Large} image={$user.profile.photo.image} status={$user.profile.status} />
                        <Text>{$user.name}</Text>
                        {#if $user.profile.status_message !== ""}
                            <Text muted>{$user.profile.status_message}</Text>
                        {/if}
                    {:else}
                        <ProfilePicture id={$user.key} hook="friend-profile-picture" size={Size.Medium} image={$user.profile.photo.image} status={$user.profile.status} />
                        <div class="text-container">
                            <Text>
                                {@html $_("settings.calling.userInviteToAGroupCall", {
                                    values: {
                                        user: `<span class="bold-text" style="font-weight: bold">${$user.name}</span>`,
                                        group: `<span class="bold-text" style="font-weight: bold">${$callChat.name}</span>`,
                                    },
                                })}
                            </Text>
                        </div>
                        <ProfilePictureMany users={$users} />
                    {/if}
                    <Spacer less={true} />
                    <Controls>
                        <Button appearance={Appearance.Success} text={$_("settings.calling.voice")} on:click={_ => answerCall(true)}>
                            <Icon icon={Shape.PhoneCall} />
                        </Button>
                        <Button appearance={Appearance.Success} text={$_("settings.calling.video")} on:click={_ => answerCall(false)}>
                            <Icon icon={Shape.VideoCamera} />
                        </Button>
                    </Controls>
                    <Button appearance={Appearance.Error} text={$_("settings.calling.decline")} on:click={endCall}>
                        <Icon icon={Shape.PhoneXMark} />
                    </Button>
                {/if}
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

                .text-container {
                    max-width: 80%;
                    padding-left: 25px;
                }
            }
        }
    }
</style>
