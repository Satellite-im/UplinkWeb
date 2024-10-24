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
    import VolumeMixer from "./VolumeMixer.svelte"
    import { createEventDispatcher, onDestroy, onMount } from "svelte"
    import { callInProgress, callTimeout, TIME_TO_SHOW_CONNECTING, TIME_TO_SHOW_END_CALL_FEEDBACK, timeCallStarted, usersAcceptedTheCall, usersDeniedTheCall, VoiceRTCInstance } from "$lib/media/Voice"
    import { log } from "$lib/utils/Logger"
    import { playSound, SoundHandler, Sounds } from "../utils/SoundHandler"

    export let expanded: boolean = false
    function toggleExanded() {
        expanded = !expanded
    }

    let showVolumeMixer = false
    let showCallSettings = false

    let muted: boolean = !VoiceRTCInstance.callOptions.audio.enabled
    let cameraEnabled: boolean = get(Store.state.devices.cameraEnabled)

    export let deafened: boolean = get(Store.state.devices.deafened)
    export let chat: Chat

    let dispatch = createEventDispatcher()

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

    let isFullScreen = false

    $: userCache = Store.getUsersLookup(chat.users)
    $: userCallOptions = VoiceRTCInstance.callOptions
    $: remoteStreams = Store.state.activeCallMeta
    $: ownUserName = get(Store.state.user).name

    let subscribeOne = Store.state.devices.muted.subscribe(state => {
        muted = state
        userCallOptions = VoiceRTCInstance.callOptions
        userCallOptions.audio.enabled = !muted
    })

    let subscribeTwo = Store.state.devices.cameraEnabled.subscribe(state => {
        cameraEnabled = state
        userCallOptions = VoiceRTCInstance.callOptions
        userCallOptions.video.enabled = cameraEnabled
    })

    let subscribeThree = Store.state.devices.deafened.subscribe(state => {
        deafened = state
        userCallOptions = VoiceRTCInstance.callOptions
    })

    let subscribeFour = Store.state.activeCall.subscribe(state => {
        userCallOptions = VoiceRTCInstance.callOptions
    })

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
        const stream = $remoteStreams[user]?.stream

        if (stream) {
            node.srcObject = stream
            stream.onremovetrack = () => {
                log.dev("Stream removed: ", user)
            }
        }

        return {
            update(newUser: string) {
                const newStream = $remoteStreams[newUser]?.stream
                if (newStream && node.srcObject !== newStream) {
                    node.srcObject = newStream
                }
            },
            destroy() {
                node.srcObject = null
            },
        }
    }

    $: if ($usersDeniedTheCall.length === chat.users.length - 1) {
        setTimeout(() => {
            Store.endCall()
            VoiceRTCInstance.leaveCall()
            dispatch("endCall")
        }, TIME_TO_SHOW_END_CALL_FEEDBACK)
    }

    let showAnimation = true
    let noResponseVisible = false
    let message = $_("settings.calling.connecting")
    let timeout: NodeJS.Timeout | undefined
    let hideNoResponseUsersTimeout: NodeJS.Timeout | undefined
    let callSound: SoundHandler | undefined = undefined

    function hideNoResponseUsersAfterAPeriodOfTime() {
        hideNoResponseUsersTimeout = setTimeout(() => {
            noResponseVisible = false
        }, 10000)
    }

    $: if ($usersAcceptedTheCall.length > 0) {
        callSound?.stop()
        callSound = undefined
    }

    onMount(async () => {
        usersDeniedTheCall.set([])
        callTimeout.set(false)
        usersAcceptedTheCall.set([])
        document.addEventListener("mousedown", handleClickOutside)
        await VoiceRTCInstance.setVideoElements(localVideoCurrentSrc)
        /// HACK: To make sure the video elements are loaded before we start the call
        if (VoiceRTCInstance.localVideoCurrentSrc && VoiceRTCInstance.remoteVideoCreator) {
            if (VoiceRTCInstance.toCall && VoiceRTCInstance.toCall.find(did => did !== "") !== undefined && $callInProgress === null) {
                callSound = await playSound(Sounds.OutgoingCall)
                await VoiceRTCInstance.makeCall()
                timeout = setTimeout(() => {
                    callSound?.stop()
                    callSound = undefined
                    showAnimation = false
                    message = $_("settings.calling.noResponse")
                    noResponseVisible = true
                    hideNoResponseUsersAfterAPeriodOfTime()
                }, TIME_TO_SHOW_CONNECTING)
            }
        }
        if ($timeCallStarted) {
            let timeCallStartedInterval = setInterval(() => {
                let now = new Date()
                let timeDifference = now.getTime() - $timeCallStarted.getTime()
                if (timeDifference > TIME_TO_SHOW_CONNECTING) {
                    showAnimation = false
                    noResponseVisible = true
                    message = $_("settings.calling.noResponse")
                    clearInterval(timeCallStartedInterval)
                    hideNoResponseUsersAfterAPeriodOfTime()
                }
            }, 1000)
        }

        if (VoiceRTCInstance.localVideoCurrentSrc) {
            await VoiceRTCInstance.getLocalStream(true)
        }
        if (get(Store.state.activeCall) === null) {
            Store.setActiveCall(chat)
        }
    })

    onDestroy(() => {
        callTimeout.set(false)
        document.removeEventListener("mousedown", handleClickOutside)
        subscribeOne()
        subscribeTwo()
        subscribeThree()
        subscribeFour()
        if (timeout) {
            clearTimeout(timeout)
        }
        if (hideNoResponseUsersTimeout) {
            clearTimeout(hideNoResponseUsersTimeout)
        }
        callSound?.stop()
        callSound = undefined
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

        {#if !$callTimeout && ($usersDeniedTheCall.length === 0 || $usersDeniedTheCall.length !== chat.users.length - 1)}
            <div id="participants">
                <div class="video-container {$userCache[get(Store.state.user).key].media.is_playing_audio ? 'talking' : ''}">
                    <video
                        data-cy="local-user-video"
                        id="local-user-video"
                        bind:this={localVideoCurrentSrc}
                        style="display: {userCallOptions.video.enabled ? 'block' : 'none'}"
                        width={isFullScreen ? "calc(50% - var(--gap) * 2)" : 200}
                        height={isFullScreen ? "50%" : 200}
                        muted
                        autoplay>
                        <track kind="captions" src="" />
                    </video>
                    <div class="user-name">{ownUserName}</div>
                    {#if !userCallOptions.audio.enabled}
                        <div class="mute-status">
                            <Icon icon={Shape.MicrophoneSlash}></Icon>
                        </div>
                    {/if}
                </div>

                {#each chat.users.sort((a, b) => {
                    const aVideoEnabled = $remoteStreams[a]?.user?.videoEnabled ? 1 : 0
                    const bVideoEnabled = $remoteStreams[b]?.user?.videoEnabled ? 1 : 0
                    return bVideoEnabled - aVideoEnabled
                }) as user (user)}
                    {#if user === get(Store.state.user).key && !userCallOptions.video.enabled}
                        <Participant participant={$userCache[user]} hasVideo={$userCache[user].media.is_streaming_video} isMuted={muted} isDeafened={userCallOptions.audio.deafened} isTalking={$userCache[user].media.is_playing_audio} />
                    {:else if $userCache[user] && $userCache[user].key !== get(Store.state.user).key && !$remoteStreams[user]}
                        {#if showAnimation && !$usersAcceptedTheCall.includes(user)}
                            <div class="calling-animation">
                                <div class="shaking-participant">
                                    <Participant participant={$userCache[user]} hasVideo={false} isMuted={true} isDeafened={true} isTalking={false} />
                                    <p>{message}</p>
                                </div>
                            </div>
                        {:else if $usersAcceptedTheCall.includes(user)}
                            <div class="no-response">
                                <Participant participant={$userCache[user]} hasVideo={false} isMuted={true} isDeafened={true} isTalking={false} />
                                <p>{$_("settings.calling.acceptedCall")}</p>
                            </div>
                        {:else if noResponseVisible}
                            <div class="no-response">
                                <Participant participant={$userCache[user]} hasVideo={false} isMuted={true} isDeafened={true} isTalking={false} />
                                <p>{message}</p>
                            </div>
                        {/if}
                    {:else if $userCache[user] && $userCache[user].key !== get(Store.state.user).key && $remoteStreams[user]}
                        <div class="video-container {$userCache[user].media.is_playing_audio ? 'talking' : ''}">
                            <video
                                data-cy="remote-user-video"
                                id="remote-user-video-{user}"
                                width={$remoteStreams[user].user.videoEnabled ? (isFullScreen ? "calc(50% - var(--gap) * 2)" : 400) : 0}
                                height={$remoteStreams[user].user.videoEnabled ? (isFullScreen ? "50%" : 400) : 0}
                                autoplay
                                muted={false}
                                use:attachStream={user}
                                style="display: {$remoteStreams[user].user.videoEnabled ? 'block' : 'none'}">
                                <track kind="captions" src="" />
                            </video>
                            <div class="user-name">{$userCache[user].name}</div>
                            {#if !$remoteStreams[user].user.audioEnabled}
                                <div class="mute-status">
                                    <Icon icon={Shape.MicrophoneSlash}></Icon>
                                </div>
                            {/if}
                        </div>

                        {#if !$remoteStreams[user].stream || !$remoteStreams[user].user.videoEnabled}
                            <Participant
                                participant={$userCache[user]}
                                hasVideo={$userCache[user].media.is_streaming_video}
                                isMuted={$remoteStreams[user] && !$remoteStreams[user].user.audioEnabled}
                                isDeafened={$remoteStreams[user] && $remoteStreams[user].user.isDeafened}
                                isTalking={$userCache[user].media.is_playing_audio} />
                        {/if}
                    {/if}
                {/each}
            </div>
        {:else if $usersDeniedTheCall.length === chat.users.length - 1 && chat.users.length > 1}
            <div class="loading-when-no-answer">
                <div class="spinner"></div>
                <p>{$_("settings.calling.everybodyDeniedTheCall")}</p>
            </div>
        {:else}
            <div class="loading-when-no-answer">
                <div class="spinner"></div>
                <p>{$_("settings.calling.noAnswer")}</p>
            </div>
        {/if}
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
                        <VolumeMixer
                            participants={chat.users}
                            on:close={_ => {
                                showVolumeMixer = false
                            }} />
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
                soundSource={undefined}
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
                soundSource={undefined}
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
                soundSource={undefined}
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
                    dispatch("endCall")
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

        .calling-animation {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            text-align: center;
            animation: shake 0.4s ease-in-out infinite;
        }

        .shaking-participant {
            animation: shake 0.4s ease-in-out infinite;
        }

        @keyframes shake {
            0%,
            100% {
                transform: translateX(0);
            }
            25% {
                transform: translateX(-0.75px);
            }
            50% {
                transform: translateX(0.75px);
            }
            75% {
                transform: translateX(-0.75px);
            }
        }

        .calling-animation p {
            margin-top: 10px;
            font-size: 1.2rem;
            color: #666;
            font-weight: bold;
        }

        .no-response {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            text-align: center;
        }

        .no-response p {
            margin-top: 10px;
            font-size: 1.2rem;
            color: #666;
            font-weight: bold;
        }

        .video-container {
            position: relative;
            display: inline-block;
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid var(--color-muted);
            &.talking {
                border: 2px solid var(--success-color);
            }
        }

        video {
            object-fit: cover;
            border-radius: 12px;
        }

        .user-name {
            position: absolute;
            bottom: 8px;
            left: 12px;
            background-color: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 14px;
        }

        .mute-status {
            position: absolute;
            display: flex;
            bottom: 8px;
            right: 12px;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 14px;
        }
        .spinner {
            width: 48px;
            height: 48px;
            border: 8px solid #f3f3f3;
            border-top: 8px solid #3498db;
            border-radius: 50%;
            animation: spin 2s linear infinite;
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        .loading-when-no-answer {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            text-align: center;
            margin: 32px;
        }

        .loading-when-no-answer p {
            margin-top: 16px;
        }
    }
</style>
