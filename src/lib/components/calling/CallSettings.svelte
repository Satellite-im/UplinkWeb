<script>
    import Select from "$lib/elements/Select.svelte"
    import Switch from "$lib/elements/Switch.svelte"
    import { SettingSection } from "$lib/layouts"
</script>

<div class="call-settings">
    <SettingSection name="Echo Cancellation" description="Cancel out feedback from your microphone.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Auto Gain Control" description="Automatically adjust microphone gain.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Noise Suppression" description="Automatically try to remove background noise.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Channels" description="Sets the number of audio channels to be used.">
        <Select
            options={[
                { text: "Mono", value: "1" },
                { text: "Stereo", value: "2" },
                { text: "5.1 Surround", value: "6" },
                { text: "7.1 Surround", value: "8" },
            ]}
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
