<script>
    import Select from "$lib/elements/Select.svelte"
    import Switch from "$lib/elements/Switch.svelte"
    import { SettingSection } from "$lib/layouts"
    import { SettingsStore } from "$lib/state"

    $: settings = SettingsStore.state
    $: echoCancellation = $settings.calling.echoCancellation || true
    $: automaticGainControl = $settings.calling.automaticGainControl || true
    $: noiseSuppression = $settings.calling.noiseSuppression || true
    $: channels = $settings.calling.channels || 2
    $: bitrate = $settings.calling.bitrate || 64000
    $: sampleSize = $settings.calling.sampleSize || 16
</script>

<div class="call-settings">
    <SettingSection name="Echo Cancellation" description="Cancel out feedback from your microphone.">
        <Switch
            on={echoCancellation}
            on:toggle={e => {
                SettingsStore.setEchoCancellation(e.detail)
            }} />
    </SettingSection>
    <SettingSection name="Auto Gain Control" description="Automatically adjust microphone gain.">
        <Switch
            on={automaticGainControl}
            on:toggle={e => {
                SettingsStore.setAutomaticGainControl(e.detail)
            }} />
    </SettingSection>
    <SettingSection name="Noise Suppression" description="Automatically try to remove background noise.">
        <Switch
            on={noiseSuppression}
            on:toggle={e => {
                SettingsStore.setNoiseSuppression(e.detail)
            }} />
    </SettingSection>
    <SettingSection name="Channels" description="Sets the number of audio channels to be used.">
        <Select
            options={[
                { text: "Mono", value: "1" },
                { text: "Stereo", value: "2" },
                { text: "5.1 Surround", value: "6" },
                { text: "7.1 Surround", value: "8" },
            ]}
            selected={channels.toString()}
            on:change={e => {
                SettingsStore.setChannels(parseInt(e.detail))
            }}
            alt />
    </SettingSection>
    <SettingSection name="Bitrate" description="Bitrate at which your stream is broadcast.">
        <Select
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
            }}
            alt />
    </SettingSection>
    <SettingSection name="Sample Size" description="Bitrate at which your stream is broadcast.">
        <Select
            options={[
                { text: "16", value: "16" },
                { text: "32", value: "32" },
                { text: "64", value: "64" },
                { text: "128", value: "128" },
            ]}
            selected={sampleSize.toString()}
            on:change={e => {
                SettingsStore.setSampleSize(parseInt(e.detail))
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
        background-color: var(--background-alt);
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
