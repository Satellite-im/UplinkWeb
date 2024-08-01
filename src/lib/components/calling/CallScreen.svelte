<script lang="ts">
    import { Icon } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import Controls from "$lib/layouts/Controls.svelte"
    import Topbar from "$lib/layouts/Topbar.svelte"
    import { mock_users } from "$lib/mock/users"
    import Participant from "./Participant.svelte"
    import Text from "$lib/elements/Text.svelte"
    import PopupButton from "../ui/PopupButton.svelte"
    import CallSettings from "./CallSettings.svelte"
    import { get } from "svelte/store"
    import { Store } from "$lib/state/Store"
    import { _ } from "svelte-i18n"
    import type { Chat } from "$lib/types"
    import { UIStore } from "$lib/state/ui"
    import VolumeMixer from "./VolumeMixer.svelte"
    import { afterUpdate, createEventDispatcher, onDestroy, onMount } from "svelte"
    import { VoiceRTCInstance } from "$lib/media/Voice"

    export let expanded: boolean = false
    function toggleExanded() {
        expanded = !expanded
    }

    let showSettings = false
    let showVolumeMixer = false
    let showCallSettings = false

    export let muted: boolean = get(Store.state.devices.muted)
    export let deafened: boolean = get(Store.state.devices.deafened)
    export let chat: Chat

    let permissionsGranted = false

    $: chats = UIStore.state.chats
    $: userCache = Store.getUsersLookup($chats.map(c => c.users).flat())

    Store.state.devices.muted.subscribe(state => {
        muted = state
    })

    Store.state.devices.deafened.subscribe(state => {
        deafened = state
    })

    const dispatch = createEventDispatcher()

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
            console.error("Error checking permissions: ", err)
        }
    }

    const requestPermissions = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            permissionsGranted = true
        } catch (err) {
            console.error("Error requesting permissions: ", err)
            permissionsGranted = false
        }
    }

    let remoteVideoElement: HTMLVideoElement
    let localVideoCurrentSrc: HTMLVideoElement
    let callStarted = false

    onMount(async () => {
        console.log("CallScreen mounted")
        await checkPermissions()
        VoiceRTCInstance.setVideoElements(remoteVideoElement, localVideoCurrentSrc)

        if (!permissionsGranted) {
            requestPermissions()
        }

        if (VoiceRTCInstance.localVideoCurrentSrc && VoiceRTCInstance.remoteVideoElement) {
            if (VoiceRTCInstance.makingCall) {
                VoiceRTCInstance.makeVideoCall()
            }
            if (VoiceRTCInstance.acceptedIncomingCall) {
                VoiceRTCInstance.acceptCall()
                callStarted = true
            }
        }
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
            <video id="remote-user-video" bind:this={remoteVideoElement} width="400" height="400" autoplay>
                <track kind="captions" src="" />
            </video>
            <br />
            <video bind:this={localVideoCurrentSrc} width="400" height="400" autoplay>
                <track kind="captions" src="" />
            </video>
            {#if !callStarted}
                {#each chat.users as user}
                    <Participant
                        participant={$userCache[user]}
                        hasVideo={$userCache[user].media.is_streaming_video}
                        isMuted={$userCache[user].media.is_muted}
                        isDeafened={$userCache[user].media.is_deafened}
                        isTalking={$userCache[user].media.is_playing_audio} />
                {/each}
            {/if}
        </div>
    {/if}
    <div class="toolbar">
        <Controls>
            <div class="relative">
                {#if showCallSettings}
                    <CallSettings />
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
                tooltip={$_("call.mute")}
                on:click={_ => {
                    Store.updateMuted(!muted)
                    VoiceRTCInstance.turnOnOffMicrophone()
                }}>
                <Icon icon={muted ? Shape.MicrophoneSlash : Shape.Microphone} />
            </Button>
            <Button
                icon
                appearance={deafened ? Appearance.Error : Appearance.Alt}
                tooltip={$_("call.deafen")}
                on:click={_ => {
                    Store.updateDeafened(!deafened)
                }}>
                <Icon icon={deafened ? Shape.HeadphoneSlash : Shape.Headphones} />
            </Button>
            <Button appearance={Appearance.Alt} icon tooltip="Stream">
                <Icon icon={Shape.Stream} />
            </Button>
            <Button
                appearance={Appearance.Alt}
                icon
                tooltip="Enable Video"
                on:click={_ => {
                    VoiceRTCInstance.turnOnOffCamera()
                }}>
                <Icon icon={Shape.VideoCamera} />
            </Button>
            <Button
                appearance={Appearance.Error}
                icon
                tooltip="End"
                on:click={_ => {
                    dispatch("onendcall")
                    VoiceRTCInstance.endCall()
                }}>
                <Icon icon={Shape.PhoneXMark} />
            </Button>
        </Controls>
        <Controls>
            <Button appearance={Appearance.Alt} icon outline tooltip={expanded ? "Less Space" : "More Space"} on:click={toggleExanded}>
                {#if expanded}
                    <Icon icon={Shape.ChevronsUp} />
                {:else}
                    <Icon icon={Shape.ChevronsDown} />
                {/if}
            </Button>
            <Button appearance={Appearance.Alt} icon outline tooltip="Fullscreen">
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
    }
</style>
