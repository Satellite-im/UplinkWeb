<script lang="ts">
    import Select from "$lib/elements/Select.svelte"
    import Switch from "$lib/elements/Switch.svelte"
    import { SettingSection } from "$lib/layouts"
    import { VoiceRTCInstance } from "$lib/media/Voice"
    import { SettingsStore } from "$lib/state"
    import { Store } from "$lib/state/Store"
    import { createEventDispatcher, onMount } from "svelte"
    import { _ } from "svelte-i18n"

    let inputDevices: MediaDeviceInfo[] = []
    let videoInputDevices: MediaDeviceInfo[] = []
    let selectedVideoInput: string = "default"
    Store.state.devices.video.subscribe(d => {
        selectedVideoInput = d
    })

    let dispatch = createEventDispatcher()

    onMount(async () => {
        let devices = await navigator.mediaDevices.enumerateDevices()
        inputDevices = devices.filter(device => device.kind === "audioinput")
        videoInputDevices = devices.filter(device => device.kind === "videoinput")
    })

    function onChange() {
        dispatch("change")
    }

    $: settings = SettingsStore.state
    $: echoCancellation = $settings.calling.echoCancellation || true
    $: automaticGainControl = $settings.calling.automaticGainControl || true
    $: noiseSuppression = $settings.calling.noiseSuppression || true
    $: channels = $settings.calling.channels || 2
    $: bitrate = $settings.calling.bitrate || 64000
    $: sampleSize = $settings.calling.sampleSize || 16
    $: videoInputOptions = inputDevices.length > 0 ? videoInputDevices.map(d => ({ text: d.label, value: d.deviceId })) : [{ text: "Default", value: "Default" }]
</script>

<div class="call-settings">
    <SettingSection hook="section-video-device" name={$_("settings.audio.videoDevice")} description={$_("settings.audio.videoDeviceDescription")}>
        <Select
            hook="selector-video-device"
            selected={selectedVideoInput}
            options={videoInputOptions}
            alt
            on:change={v => {
                Store.setVideoInputDevice(v.detail)
                onChange()
            }} />
    </SettingSection>
    <SettingSection hook="section-echo-cancellation" name="Echo Cancellation" description="Cancel out feedback from your microphone.">
        <Switch
            hook="swtich-echo-cancellation"
            on={echoCancellation}
            on:toggle={e => {
                SettingsStore.setEchoCancellation(e.detail)
                onChange()
            }} />
    </SettingSection>
    <SettingSection hook="section-auto-gain-control" name="Auto Gain Control" description="Automatically adjust microphone gain.">
        <Switch
            hook="switch-auto-gain-control"
            on={automaticGainControl}
            on:toggle={e => {
                SettingsStore.setAutomaticGainControl(e.detail)
                onChange()
            }} />
    </SettingSection>
    <SettingSection hook="section-noise-supression" name="Noise Suppression" description="Automatically try to remove background noise.">
        <Switch
            hook="switch-noise-suppression"
            on={noiseSuppression}
            on:toggle={e => {
                SettingsStore.setNoiseSuppression(e.detail)
                onChange()
            }} />
    </SettingSection>
    <SettingSection hook="section-audio-channels" name="Channels" description="Sets the number of audio channels to be used.">
        <Select
            hook="selector-audio-channels"
            options={[
                { text: "Mono", value: "1" },
                { text: "Stereo", value: "2" },
                { text: "5.1 Surround", value: "6" },
                { text: "7.1 Surround", value: "8" },
            ]}
            selected={channels.toString()}
            on:change={e => {
                SettingsStore.setChannels(parseInt(e.detail))
                onChange()
            }}
            alt />
    </SettingSection>
    <SettingSection hook="section-audio-bitrate" name="Bitrate" description="Bitrate at which your stream is broadcast.">
        <Select
            hook="selector-audio-bitrate"
            options={[
                { text: "8 Kbps", value: "8000" },
                { text: "16 Kbps", value: "16000" },
                { text: "22 kHz", value: "22000" },
                { text: "44 kHz", value: "44000" },
                { text: "32 kHz", value: "32000" },
                { text: "48 kHz", value: "48000" },
                { text: "64 Kbps", value: "64000" },
                { text: "96 KHz", value: "96000" },
                { text: "128 Kbps", value: "128000" },
            ]}
            selected={bitrate.toString()}
            on:change={e => {
                SettingsStore.setBitrate(parseInt(e.detail))
                onChange()
            }}
            alt />
    </SettingSection>
    <SettingSection hook="section-sample-size" name="Sample Size" description="Bitrate at which your stream is broadcast.">
        <Select
            hook="selector-sample-size"
            options={[
                { text: "16", value: "16" },
                { text: "32", value: "32" },
                { text: "64", value: "64" },
                { text: "128", value: "128" },
            ]}
            selected={sampleSize.toString()}
            on:change={e => {
                SettingsStore.setSampleSize(parseInt(e.detail))
                onChange()
            }}
            alt />
    </SettingSection>
</div>

<style lang="scss">
    .call-settings {
        min-width: 400px;
        width: 750px;
        max-height: 400px;
        min-height: var(--min-component-width);
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap-less);
        background-color: var(--opaque-color);
        backdrop-filter: blur(var(--blur-radius));
        padding: var(--padding);
        border-radius: var(--border-radius);
        position: absolute;
        z-index: 3;
        bottom: 100%;
        margin-bottom: calc((var(--input-height) / 2) * -1);
        margin-left: calc((var(--input-height) / 2));
        overflow-y: scroll;
        border: var(--border-width) solid var(--border-color);
    }
</style>
