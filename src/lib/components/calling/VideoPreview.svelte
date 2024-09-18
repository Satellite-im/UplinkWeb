<script lang="ts">
    import { VoiceRTCInstance } from "$lib/media/Voice"
    import { Store } from "$lib/state/Store"
    import { onMount } from "svelte"
    import { page } from "$app/stores"
    import { Route } from "$lib/enums"
    import { get } from "svelte/store"
    import Participant from "./Participant.svelte"
    import { UIStore } from "$lib/state/ui"
    import { log } from "$lib/utils/Logger"

    export let show: boolean = false
    let previewVideo: HTMLDivElement
    let remoteVideoElement: HTMLVideoElement

    Store.state.activeChat.subscribe(async activeChat => {
        if (activeChat.id !== VoiceRTCInstance.channel && get(Store.state.activeCall)) {
            show = true
            if (VoiceRTCInstance.remoteVideoElement) {
                remoteVideoElement.srcObject = VoiceRTCInstance.activeCall?.remoteStream!
                remoteVideoElement.play()
            }
        }
    })

    $: chat = get(Store.state.activeCall)?.chat

    Store.state.activeCall.subscribe(async activeCall => {
        log.debug(`VideoPreview: Page: ${$page.route.id}. activeCall: ${activeCall}`)
        if ($page.route.id !== Route.Chat && activeCall != null) {
            show = true
            remoteVideoElement.srcObject = VoiceRTCInstance.activeCall?.remoteStream!
            remoteVideoElement.play()
        } else if (!activeCall && remoteVideoElement) {
            show = false
            remoteVideoElement.pause()
            remoteVideoElement.srcObject = null
        } else if ($page.route.id === Route.Chat && get(Store.state.activeChat).id === VoiceRTCInstance.channel) {
            show = false
            remoteVideoElement.pause()
            remoteVideoElement.srcObject = null
        }
        otherUserSettingsInCall = VoiceRTCInstance.remoteVoiceUser
        chat = activeCall?.chat
    })

    $: otherUserSettingsInCall = VoiceRTCInstance.remoteVoiceUser
    $: ownUser = get(Store.state.user)
    $: chats = UIStore.state.chats
    $: userCache = Store.getUsersLookup($chats.map(c => c.users).flat())

    onMount(() => {
        const video = previewVideo

        video.addEventListener("mousedown", onMouseDown)

        function onMouseDown(event: any) {
            event.preventDefault()
            const offsetX = event.clientX - video.getBoundingClientRect().left
            const offsetY = event.clientY - video.getBoundingClientRect().top

            document.addEventListener("mousemove", onMouseMove)
            document.addEventListener("mouseup", onMouseUp)

            video.addEventListener("dblclick", () => {
                // TODO: Go to call
            })

            function onMouseMove(event: any) {
                let newLeft = event.clientX - offsetX
                let newTop = event.clientY - offsetY

                // Ensure the video stays within the bounds of the screen
                newLeft = Math.max(0, Math.min(window.innerWidth - video.offsetWidth, newLeft))
                newTop = Math.max(0, Math.min(window.innerHeight - video.offsetHeight, newTop))

                video.style.left = `${newLeft}px`
                video.style.top = `${newTop}px`
            }

            function onMouseUp() {
                document.removeEventListener("mousemove", onMouseMove)
                document.removeEventListener("mouseup", onMouseUp)

                // Snap to position (example: snap to corners)
                const middleX = window.innerWidth / 2
                const middleY = window.innerHeight / 2

                if (parseInt(video.style.left) < middleX / 2) {
                    video.style.left = "0px"
                } else if (parseInt(video.style.left) > middleX * 1.5) {
                    video.style.left = `${window.innerWidth - video.offsetWidth}px`
                }

                if (parseInt(video.style.top) < middleY / 2) {
                    video.style.top = "0px"
                } else if (parseInt(video.style.top) > middleY * 1.5) {
                    video.style.top = `${window.innerHeight - video.offsetHeight}px`
                }

                video.classList.add("snap-animation")
                setTimeout(() => {
                    video.classList.remove("snap-animation")
                }, 300)
            }
        }
    })
</script>

<div id="video-preview" class={show ? "video-preview" : "hidden"}>
    <div id="preview-video" bind:this={previewVideo}>
        <video id="remote-user-float-video" bind:this={remoteVideoElement} width={otherUserSettingsInCall?.videoEnabled ? 400 : 0} height={otherUserSettingsInCall?.videoEnabled ? 400 : 0} autoplay>
            <track kind="captions" src="" />
        </video>
        {#if !otherUserSettingsInCall?.videoEnabled && chat !== undefined}
            {#each chat.users as user}
                {#if user !== ownUser.key}
                    <Participant
                        participant={$userCache[user]}
                        hasVideo={$userCache[user].media.is_streaming_video}
                        isMuted={$userCache[user].media.is_muted}
                        isDeafened={$userCache[user].media.is_deafened}
                        isTalking={$userCache[user].media.is_playing_audio} />
                {/if}
            {/each}
        {/if}
    </div>
</div>

<style lang="scss">
    .hidden {
        visibility: hidden;
        opacity: 0;
        position: absolute;
        z-index: -10;
        width: 0;
        height: 0;
        overflow: hidden;
        pointer-events: none;
    }
    #video-preview {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;

        #preview-video {
            width: 400px;
            height: 225px;
            background: var(--background-alt);
            border-radius: var(--border-radius);
            border: var(--border-width) solid var(--border-color);
            position: absolute;
            top: 0;
            right: 0;
            cursor: grab;
            pointer-events: all;
            transition: transform 0.3s ease;
            margin: var(--padding);
            display: inline-flex;
            justify-content: center;
            overflow: hidden;
            align-items: center;
        }
    }
</style>
