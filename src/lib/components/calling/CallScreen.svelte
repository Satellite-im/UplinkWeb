<script lang="ts">
    import { Icon } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import Controls from "$lib/layouts/Controls.svelte"
    import Topbar from "$lib/layouts/Topbar.svelte"
    import Participant from "./Participant.svelte"
    import Text from "$lib/elements/Text.svelte"
    import CallSettings from "./CallSettings.svelte"
    import { get, writable, type Writable } from "svelte/store"
    import { Store } from "$lib/state/Store"
    import { _ } from "svelte-i18n"
    import type { Chat } from "$lib/types"
    import { UIStore } from "$lib/state/ui"
    import VolumeMixer from "./VolumeMixer.svelte"
    import { onDestroy, onMount } from "svelte"
    import { VoiceRTCInstance, type VoiceRTCUser } from "$lib/media/Voice"
    import { log } from "$lib/utils/Logger"
    import { debounce } from "$lib/utils/Functions"

    export let expanded: boolean = false
    function toggleExanded() {
        expanded = !expanded
    }

    let showVolumeMixer = false
    let showCallSettings = false

    let muted: boolean = VoiceRTCInstance.callOptions.audio.enabled
    let cameraEnabled: boolean = get(Store.state.devices.cameraEnabled)

    export let deafened: boolean = get(Store.state.devices.deafened)
    export let chat: Chat

    function toggleFullscreen() {
        const elem = document.getElementById("call-screen")

        if (!document.fullscreenElement) {
            if (elem?.requestFullscreen) {
                elem.requestFullscreen()
                isFullScreen = true
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                isFullScreen = false
            }
        }
        userCallOptions = userCallOptions
    }

    let permissionsGranted = false
    let isFullScreen = false

    $: chats = UIStore.state.chats
    $: userCache = Store.getUsersLookup($chats.map(c => c.users).flat())
    $: userCallOptions = VoiceRTCInstance.callOptions
    $: remoteStreams = Store.state.activeCallMeta

    let subscribeOne = Store.state.devices.muted.subscribe(state => {
        muted = state
        userCallOptions = VoiceRTCInstance.callOptions
    })

    let subscribeTwo = Store.state.devices.cameraEnabled.subscribe(state => {
        cameraEnabled = state
        userCallOptions = VoiceRTCInstance.callOptions
    })

    let subscribeThree = Store.state.devices.deafened.subscribe(state => {
        deafened = state
        userCallOptions = VoiceRTCInstance.callOptions
    })

    let subscribeFour = Store.state.activeCall.subscribe(state => {
        userCallOptions = VoiceRTCInstance.callOptions
    })

    const checkPermissions = async () => {
        try {
            const cameraPermission = await navigator.permissions.query({ name: "camera" as PermissionName })
            const microphonePermission = await navigator.permissions.query({ name: "microphone" as PermissionName })

            if (cameraPermission.state === "granted" && microphonePermission.state === "granted") {
                permissionsGranted = true
            } else {
                permissionsGranted = false
            }

            cameraPermission.onchange = () => {
                if (cameraPermission.state === "granted" && microphonePermission.state === "granted") {
                    permissionsGranted = true
                } else {
                    permissionsGranted = false
                }
            }

            microphonePermission.onchange = () => {
                if (cameraPermission.state === "granted" && microphonePermission.state === "granted") {
                    permissionsGranted = true
                } else {
                    permissionsGranted = false
                }
            }
        } catch (err) {
            log.error(`Error checking permissions: ${err}`)
        }
    }

    const requestPermissions = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            permissionsGranted = true
        } catch (err) {
            log.error(`Error requesting permissions: ${err}`)
            permissionsGranted = false
        }
    }

    let localVideoCurrentSrc: HTMLVideoElement

    function handleClickOutside(event: MouseEvent) {
        const callSettingsElement = document.getElementById("call-settings")
        const showVolumeElement = document.getElementById("volume-mixer")

        if (callSettingsElement && !callSettingsElement.contains(event.target as Node)) {
            showCallSettings = false
            event.stopPropagation()
        }

        if (showVolumeElement && !showVolumeElement.contains(event.target as Node)) {
            showVolumeMixer = false
            event.stopPropagation()
        }
    }

    function attachStream(node: HTMLMediaElement, user: string) {
        if (!$remoteStreams[user]) return
        let stream = $remoteStreams[user].stream
        node.srcObject = stream
        node.play()
        return {
            update(_: MediaStream) {
                debounce(() => {
                    node.srcObject = stream
                    node.play()
                }, 3)
            },
        }
    }

    onMount(async () => {
        document.addEventListener("mousedown", handleClickOutside)
        await checkPermissions()
        await VoiceRTCInstance.setVideoElements(localVideoCurrentSrc)

        if (!permissionsGranted) {
            requestPermissions()
        }

        /// HACK: To make sure the video elements are loaded before we start the call
        if (VoiceRTCInstance.localVideoCurrentSrc && VoiceRTCInstance.remoteVideoCreator) {
            if (VoiceRTCInstance.makingCall && VoiceRTCInstance.peerMesh.readyForCalling()) {
                await VoiceRTCInstance.makeCall()
            }
            if (VoiceRTCInstance.acceptedIncomingCall) {
                await VoiceRTCInstance.acceptCall(true)
                Store.setActiveCall(Store.getCallingChat(VoiceRTCInstance.channel!)!)
            }
        }

        if (VoiceRTCInstance.localVideoCurrentSrc) {
            await VoiceRTCInstance.getLocalStream(true)
        }
    })

    onDestroy(() => {
        document.removeEventListener("mousedown", handleClickOutside)
        subscribeOne()
        subscribeTwo()
        subscribeThree()
        subscribeFour()
    })
</script>

<div id="call-screen" data-cy="call-screen" class={expanded ? "expanded" : ""}>
    {#if chat}
        <Topbar simple>
            <svelte:fragment slot="content">
                <Text hook="text-users-in-call" muted size={Size.Smaller}>
                    ({Object.keys($remoteStreams).length + 1}) users in the call
                </Text>
            </svelte:fragment>
        </Topbar>
        <div id="participants">
            <video
                data-cy="local-user-video"
                id="local-user-video"
                bind:this={localVideoCurrentSrc}
                width={userCallOptions.video.enabled ? (isFullScreen ? "calc(50% - var(--gap) * 2)" : 200) : 0}
                height={userCallOptions.video.enabled ? (isFullScreen ? "50%" : 200) : 0}
                muted
                autoplay>
                <track kind="captions" src="" />
            </video>

            {#each chat.users as user}
                {#if user === get(Store.state.user).key && !userCallOptions.video.enabled}
                    <Participant participant={$userCache[user]} hasVideo={$userCache[user].media.is_streaming_video} isMuted={muted} isDeafened={userCallOptions.audio.deafened} isTalking={$userCache[user].media.is_playing_audio} />
                {:else if $userCache[user] && $userCache[user].key !== get(Store.state.user).key && $remoteStreams[user] && $remoteStreams[user].user.joined}
                    {#if !$remoteStreams[user].stream || !$remoteStreams[user].user.videoEnabled}
                        <Participant
                            participant={$userCache[user]}
                            hasVideo={$userCache[user].media.is_streaming_video}
                            isMuted={$remoteStreams[user] && !$remoteStreams[user].user.audioEnabled}
                            isDeafened={$remoteStreams[user] && $remoteStreams[user].user.isDeafened}
                            isTalking={$userCache[user].media.is_playing_audio} />
                    {/if}
                    {#if $remoteStreams[user] && $remoteStreams[user].stream}
                        <video
                            data-cy="remote-user-video"
                            id="remote-user-video"
                            width={$remoteStreams[user].user.videoEnabled ? (isFullScreen ? "calc(50% - var(--gap) * 2)" : 400) : 0}
                            height={$remoteStreams[user].user.videoEnabled ? (isFullScreen ? "50%" : 400) : 0}
                            autoplay
                            use:attachStream={user}>
                            <track kind="captions" src="" />
                        </video>
                    {/if}
                {/if}
            {/each}
        </div>
    {/if}
    <div class="toolbar">
        <Controls>
            <div class="relative">
                {#if showCallSettings}
                    <div id="call-settings">
                        <CallSettings
                            on:change={_ => {
                                VoiceRTCInstance.getLocalStream(true)
                            }} />
                    </div>
                {/if}
                <Button
                    hook="button-call-settings"
                    tooltip="Settings"
                    icon
                    appearance={showCallSettings ? Appearance.Primary : Appearance.Alt}
                    outline={!showCallSettings}
                    on:click={_ => {
                        showCallSettings = !showCallSettings
                    }}>
                    <Icon icon={Shape.Cog} />
                </Button>
            </div>
            <div class="relative">
                {#if showVolumeMixer}
                    <div id="volume-mixer">
                        <VolumeMixer participants={chat.users} />
                    </div>
                {/if}
                <Button
                    hook="button-call-volume-mixer"
                    tooltip="Volume Mixer"
                    icon
                    appearance={showVolumeMixer ? Appearance.Primary : Appearance.Alt}
                    outline={!showVolumeMixer}
                    on:click={_ => {
                        showVolumeMixer = !showVolumeMixer
                    }}>
                    <Icon icon={Shape.SpeakerWave} />
                </Button>
            </div>
        </Controls>
        <Controls>
            <Button
                hook="button-call-mute"
                icon
                appearance={muted ? Appearance.Error : Appearance.Alt}
                tooltip={muted ? $_("call.unmute") : $_("call.mute")}
                on:click={_ => {
                    Store.updateMuted(!muted)
                }}>
                <Icon icon={muted ? Shape.MicrophoneSlash : Shape.Microphone} />
            </Button>
            <Button
                hook="button-call-deafen"
                icon
                appearance={deafened ? Appearance.Error : Appearance.Alt}
                tooltip={$_("call.deafen")}
                on:click={_ => {
                    Store.updateDeafened(!deafened)
                    // VoiceRTCInstance.turnOnOffDeafened()
                }}>
                <Icon icon={deafened ? Shape.HeadphoneSlash : Shape.Headphones} />
            </Button>
            <Button hook="button-call-stream" appearance={Appearance.Alt} icon tooltip={$_("call.stream")}>
                <Icon icon={Shape.Stream} />
            </Button>
            <Button
                hook="button-call-video"
                appearance={cameraEnabled ? Appearance.Alt : Appearance.Error}
                icon
                tooltip={cameraEnabled ? $_("call.disable_video") : $_("call.enable_video")}
                on:click={_ => {
                    Store.updateCameraEnabled(!cameraEnabled)
                }}>
                <Icon icon={cameraEnabled ? Shape.VideoCamera : Shape.VideoCameraSlash} />
            </Button>
            <Button
                hook="button-call-end"
                appearance={Appearance.Error}
                icon
                tooltip={$_("call.end")}
                on:click={_ => {
                    Store.endCall()
                    VoiceRTCInstance.leaveCall()
                }}>
                <Icon icon={Shape.PhoneXMark} />
            </Button>
        </Controls>
        <Controls>
            <Button hook="button-call-collapse-expand" appearance={Appearance.Alt} icon outline tooltip={expanded ? $_("call.collapse") : $_("call.expand")} on:click={toggleExanded}>
                {#if expanded}
                    <Icon icon={Shape.ChevronsUp} />
                {:else}
                    <Icon icon={Shape.ChevronsDown} />
                {/if}
            </Button>
            <Button hook="button-call-fullscreen" appearance={Appearance.Alt} icon outline tooltip={$_("call.fullscreen")} on:click={toggleFullscreen}>
                <Icon icon={Shape.ArrowsOut} />
            </Button>
        </Controls>
    </div>
</div>

<style lang="scss">
    #call-screen {
        background-color: var(--black);
        display: flex;
        width: 100%;
        min-height: var(--min-call-screen-height);
        padding: var(--padding);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        transition: all var(--animation-speed);

        &.expanded {
            flex: 100%;
        }

        .toolbar {
            width: 100%;
            display: inline-flex;
            justify-content: space-between;
        }

        .relative {
            position: relative;
        }

        #participants {
            flex: 1;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: var(--gap);
            padding: var(--padding);
            align-items: center;
            justify-content: center;
        }

        video {
            object-fit: contain;
            border-radius: 12px;
            background-color: var(--black);
        }
    }
</style>
