<script lang="ts">
    import { Icon } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import Controls from "$lib/layouts/Controls.svelte"
    import Topbar from "$lib/layouts/Topbar.svelte"
    import Participant from "./Participant.svelte"
    import Text from "$lib/elements/Text.svelte"
    import CallSettings from "./CallSettings.svelte"
    import { get } from "svelte/store"
    import { Store } from "$lib/state/Store"
    import { _ } from "svelte-i18n"
    import type { Chat } from "$lib/types"
    import { UIStore } from "$lib/state/ui"
    import VolumeMixer from "./VolumeMixer.svelte"
    import { onDestroy, onMount } from "svelte"
    import { VoiceRTCInstance, VoiceRTCMessageType } from "$lib/media/Voice"
    import { log } from "$lib/utils/Logger"

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
        otherUserSettingsInCall.videoEnabled = otherUserSettingsInCall.videoEnabled
        otherUserSettingsInCall = otherUserSettingsInCall
        userCallOptions = userCallOptions
    }

    let permissionsGranted = false
    let isFullScreen = false

    $: chats = UIStore.state.chats
    $: userCache = Store.getUsersLookup($chats.map(c => c.users).flat())
    $: otherUserSettingsInCall = VoiceRTCInstance.remoteVoiceUser
    $: userCallOptions = VoiceRTCInstance.callOptions

    let subscribeOne = Store.state.devices.muted.subscribe(state => {
        muted = state
    })

    let subscribeTwo = Store.state.devices.cameraEnabled.subscribe(state => {
        cameraEnabled = state
    })

    let subscribeThree = Store.state.devices.deafened.subscribe(state => {
        deafened = state
        console.log("Deafened value: ", deafened)
    })

    let subscribeFour = Store.state.activeCall.subscribe(state => {
        otherUserSettingsInCall = VoiceRTCInstance.remoteVoiceUser
        userCallOptions = VoiceRTCInstance.callOptions
    })

    function updateMuted() {
        Store.updateMuted(!muted)
        VoiceRTCInstance.turnOnOffMicrophone()
    }

    function updateCameraEnabled() {
        Store.updateCameraEnabled(!cameraEnabled)
        VoiceRTCInstance.turnOnOffCamera()
    }

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

    let remoteVideoElement: HTMLVideoElement
    let localVideoCurrentSrc: HTMLVideoElement

    onMount(async () => {
        await checkPermissions()
        await VoiceRTCInstance.setVideoElements(remoteVideoElement, localVideoCurrentSrc)

        if (!permissionsGranted) {
            requestPermissions()
        }

        /// HACK: To make sure the video elements are loaded before we start the call
        if (VoiceRTCInstance.localVideoCurrentSrc && VoiceRTCInstance.remoteVideoElement) {
            if (VoiceRTCInstance.makingCall && VoiceRTCInstance.remoteVoiceUser.did === "") {
                await VoiceRTCInstance.makeVideoCall()
            }
            if (VoiceRTCInstance.acceptedIncomingCall) {
                await VoiceRTCInstance.acceptCall()
                Store.setActiveCall(Store.getCallingChat(VoiceRTCInstance.channel)!)
            }
        }
        Store.updateMuted(!VoiceRTCInstance.callOptions.audio.enabled)
        Store.updateCameraEnabled(VoiceRTCInstance.callOptions.video.enabled)
        if (VoiceRTCInstance.remoteVideoElement) {
            remoteVideoElement.srcObject = VoiceRTCInstance.activeCall?.remoteStream!
            remoteVideoElement.play()
        }
        if (VoiceRTCInstance.localVideoCurrentSrc) {
            await VoiceRTCInstance.updateLocalStream()
        }
    })

    onDestroy(() => {
        subscribeOne()
        subscribeTwo()
        subscribeThree()
        subscribeFour()
    })
</script>

<div id="call-screen" class={expanded ? "expanded" : ""}>
    {#if chat}
        <Topbar simple>
            <svelte:fragment slot="content">
                <Text muted size={Size.Smaller}>
                    ({chat.users.length}) users in the call
                </Text>
            </svelte:fragment>
        </Topbar>
        <div id="participants">
            <video
                id="remote-user-video"
                bind:this={remoteVideoElement}
                width={otherUserSettingsInCall?.videoEnabled ? (isFullScreen ? "calc(50% - var(--gap) * 2)" : 400) : 0}
                height={otherUserSettingsInCall?.videoEnabled ? (isFullScreen ? "50%" : 400) : 0}
                autoplay>
                <track kind="captions" src="" />
            </video>
            <br />
            <video
                id="local-user-video"
                bind:this={localVideoCurrentSrc}
                width={userCallOptions.video.enabled ? (isFullScreen ? "calc(50% - var(--gap) * 2)" : 400) : 0}
                height={userCallOptions.video.enabled ? (isFullScreen ? "50%" : 400) : 0}
                muted
                autoplay>
                <track kind="captions" src="" />
            </video>
            {#each chat.users as user}
                {#if $userCache[user].key === get(Store.state.user).key && !userCallOptions.video.enabled}
                    <Participant
                        participant={$userCache[user]}
                        hasVideo={$userCache[user].media.is_streaming_video}
                        isMuted={$userCache[user].media.is_muted}
                        isDeafened={$userCache[user].media.is_deafened}
                        isTalking={$userCache[user].media.is_playing_audio} />
                {/if}
                {#if $userCache[user].key !== get(Store.state.user).key && !otherUserSettingsInCall?.videoEnabled}
                    <Participant
                        participant={$userCache[user]}
                        hasVideo={$userCache[user].media.is_streaming_video}
                        isMuted={$userCache[user].media.is_muted}
                        isDeafened={$userCache[user].media.is_deafened}
                        isTalking={$userCache[user].media.is_playing_audio} />
                {/if}
            {/each}
        </div>
    {/if}
    <div class="toolbar">
        <Controls>
            <div class="relative">
                {#if showCallSettings}
                    <CallSettings
                        on:change={_ => {
                            VoiceRTCInstance.updateLocalStream(true)
                        }} />
                {/if}
                <Button
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
                    <VolumeMixer participants={chat.users} />
                {/if}
                <Button
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
                icon
                appearance={muted ? Appearance.Error : Appearance.Alt}
                tooltip={muted ? $_("call.unmute") : $_("call.mute")}
                on:click={_ => {
                    updateMuted()
                }}>
                <Icon icon={muted ? Shape.MicrophoneSlash : Shape.Microphone} />
            </Button>
            <Button
                icon
                appearance={deafened ? Appearance.Error : Appearance.Alt}
                tooltip={$_("call.deafen")}
                on:click={_ => {
                    Store.updateDeafened(!deafened)
                    VoiceRTCInstance.turnOnOffDeafened()
                }}>
                <Icon icon={deafened ? Shape.HeadphoneSlash : Shape.Headphones} />
            </Button>
            <Button appearance={Appearance.Alt} icon tooltip={$_("call.stream")}>
                <Icon icon={Shape.Stream} />
            </Button>
            <Button
                appearance={cameraEnabled ? Appearance.Alt : Appearance.Error}
                icon
                tooltip={cameraEnabled ? $_("call.disable_video") : $_("call.enable_video")}
                on:click={_ => {
                    updateCameraEnabled()
                }}>
                <Icon icon={cameraEnabled ? Shape.VideoCamera : Shape.VideoCameraSlash} />
            </Button>
            <Button
                appearance={Appearance.Error}
                icon
                tooltip={$_("call.end")}
                on:click={_ => {
                    Store.endCall()
                    VoiceRTCInstance.endCall()
                }}>
                <Icon icon={Shape.PhoneXMark} />
            </Button>
        </Controls>
        <Controls>
            <Button appearance={Appearance.Alt} icon outline tooltip={expanded ? $_("call.collapse") : $_("call.expand")} on:click={toggleExanded}>
                {#if expanded}
                    <Icon icon={Shape.ChevronsUp} />
                {:else}
                    <Icon icon={Shape.ChevronsDown} />
                {/if}
            </Button>
            <Button appearance={Appearance.Alt} icon outline tooltip={$_("call.fullscreen")} on:click={toggleFullscreen}>
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
