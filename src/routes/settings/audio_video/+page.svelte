<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import SettingSection from "$lib/layouts/SettingSection.svelte"
    import Switch from "$lib/elements/Switch.svelte"
    import Select from "$lib/elements/Select.svelte"
    import Meter from "$lib/components/Meter.svelte"
    import Button from "$lib/elements/Button.svelte";
    import { Appearance } from "$lib/enums";

    initLocale()

</script>

<div id="page">
    <SettingSection name="Input Device" description="Select your input device, this is usually your microphone.">
        <Select options={[
            { text: "Default", value: "default" }
        ]} />
    </SettingSection>
    <div class="flex-row">
        <Button text="Test" small appearance={Appearance.Alt} />
        <Meter percent={78} />
    </div>
    <SettingSection name="Output Device" description="Select your output device, this is usually your headphones or speakers.">
        <Select options={[
            { text: "Default", value: "default" }
        ]} />
    </SettingSection>
    <div class="flex-row">
        <Button text="Test" small appearance={Appearance.Alt} />
        <Meter percent={25} />
    </div>
    <SettingSection name="Echo Cancellation" description="Helps minimize feedback from your headphones/speakers into your microphone.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Interface Sounds" description="Play sounds when interacting with UI elements.">
        <Switch  />
    </SettingSection>
    <SettingSection name="Control Sounds" description="When enabled you will hear a sound when turning controls on or off, such as muting and unmuting.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Message Sounds" description="Play a notification sound when a new message is recieved.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Call Timer" description="Show the duration of an active call in the UI.">
        <Switch on />
    </SettingSection>
</div>

<style lang="scss">
    #page {
        flex: 1;
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        padding-right: var(--padding);
        
    }
</style>