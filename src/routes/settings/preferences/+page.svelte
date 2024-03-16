<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import Input from "$lib/elements/Input.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import Select from "$lib/elements/Select.svelte"
    import SettingSection from "$lib/layouts/SettingSection.svelte"
    import ColorSwatch from "$lib/components/ColorSwatch.svelte"

    initLocale()
</script>

<div id="page">
    <SettingSection name="App Language" description="Change language.">
        <Select options={[
            { text: "English (USA)", value: "english" }
        ]} />
    </SettingSection>
    <SettingSection name="Font" description="Change the font of the app.">
        <Select options={[
            { text: "Poppins", value: "poppins" }
        ]} />
        <Button 
            icon 
            appearance={Appearance.Alt}
            tooltip="Open Folder">
            <Icon icon={Shape.FolderOpen} />
        </Button>
    </SettingSection>
    <SettingSection name="Font Scaling" description="Scale the font size up or down to your liking.">
        <Button icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Minus} />
        </Button>
        <div class="font-size">
            <Input value="1.0" centered />
        </div>
        <Button icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Plus} />
        </Button>
    </SettingSection>
    <SettingSection name="Theme" description="Change the theme of the app.">
        <Button icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Moon} />
        </Button>
        <Select options={[
            { text: "Default", value: "default" }
        ]} />
        <Button icon appearance={Appearance.Alt}>
            <Icon icon={Shape.FolderOpen} />
        </Button>
    </SettingSection>
    <SettingSection name="Primary Color" description="Change the primary color of the app.">
        <ColorSwatch name="Creamy Peach" color="#f3a683" />
        <ColorSwatch name="Rosy Highlight" color="#f7d794" />
        <ColorSwatch name="Soft Blue" color="#778beb" />
        <ColorSwatch name="Brewed Mustard" color="#e77f67" />
        <ColorSwatch name="Old Geranium" color="#cf6a87" />
        <ColorSwatch name="Purple Mountain Majesty" color="#786fa6" />
        <ColorSwatch name="Rogue Pink" color="#f8a5c2" />
        <ColorSwatch name="Squeaky" color="#63cdda" />
        <ColorSwatch name="Apple Valley" color="#ea8685" />
        <ColorSwatch name="Pencil Lead" color="#596275" />
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

        .font-size {
            width: 5rem;
        }
        
    }
</style>