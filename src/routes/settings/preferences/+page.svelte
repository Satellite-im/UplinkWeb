<script lang="ts">
    import { Appearance, Font, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import { ColorSwatch } from "$lib/components"
    import { SettingSection } from "$lib/layouts"
    import { Button, Icon, Input, Select } from "$lib/elements"
    import ColorPicker from 'svelte-awesome-color-picker'
    import { Store } from "$lib/state/Store"
    import PopupButton from "$lib/components/ui/PopupButton.svelte"

    initLocale()

    let hex = "#f6f0dc"
    let font: Font = Font.Poppins
    let cssOverride = ""
    let fontSize = 1.0

    Store.state.ui.color.subscribe((c) => {
        hex = c
    })
    Store.state.ui.font.subscribe((f) => {
        font = f
    })
    Store.state.ui.fontSize.subscribe((s) => {
        fontSize = s
    })
    Store.state.ui.cssOverride.subscribe((css) => {
        cssOverride = css
    })

    const availableFonts = [
        { text: Font.Poppins, value: Font.Poppins },
        { text: Font.SpaceMono, value: Font.SpaceMono },
        { text: Font.ChakraPetch, value: Font.ChakraPetch },
        { text: Font.Comfortaa, value: Font.Comfortaa },
        { text: Font.Dosis, value: Font.Dosis },
        { text: Font.IBMPlexMono, value: Font.IBMPlexMono },
        { text: Font.PixelifySans, value: Font.PixelifySans },
        { text: Font.IndieFlower, value: Font.IndieFlower },
        { text: Font.JosefinSans, value: Font.JosefinSans },
        { text: Font.Noto, value: Font.Noto },
        { text: Font.SourceCodePro, value: Font.SourceCodePro },
        { text: Font.SpaceGrotesk, value: Font.SpaceGrotesk },
        { text: Font.MajorMono, value: Font.MajorMono },
        { text: Font.Merriweather, value: Font.Merriweather },
    ]

    $: if (hex !== undefined) {
        Store.setThemeColor(hex)
    }
</script>

<div id="page">
    <SettingSection name="App Language" description="Change language.">
        <Select options={[
            { text: "English (USA)", value: "english" }
        ]} />
    </SettingSection>
    <SettingSection name="Font" description="Change the font of the app.">
        <Select selected={font} options={availableFonts} on:change={(v) => {
            Store.setFont(v.detail)
        }}/>
        <Button 
            icon 
            appearance={Appearance.Alt}
            tooltip="Open Folder">
            <Icon icon={Shape.FolderOpen} />
        </Button>
    </SettingSection>
    <SettingSection name="Font Scaling" description="Scale the font size up or down to your liking.">
        <Button icon appearance={Appearance.Alt} on:click={(_) => Store.decreaseFontSize()}>
            <Icon icon={Shape.Minus} />
        </Button>
        <div class="font-size">
            <Input value={fontSize.toFixed(2).toString()} centered />
        </div>
        <Button icon appearance={Appearance.Alt} on:click={(_) => Store.increaseFontSize()}>
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
        <PopupButton name="Pick">
            <ColorPicker
                textInputModes={['hex']}
                isDialog={false}
                isAlpha={false}
                bind:hex
            />
            <div slot="icon" class="control">
                <Icon icon={Shape.Eyedropper} />
            </div>
        </PopupButton>
        <ColorSwatch name="Neo Orbit" color="#4d4dff"/>
        <ColorSwatch name="Creamy Peach" color="#ff008d"/>
        <ColorSwatch name="Neon Sunflower" color="#be8c0d" />
        <ColorSwatch name="TV Character Purple" color="#6a00ff" />
        <ColorSwatch name="Traffic Cone" color="#ff3c00" />
        <ColorSwatch name="Firehouse" color="#b30c0c" />
        <ColorSwatch name="Purple Mountain Majesty" color="#786fa6" />
        <ColorSwatch name="Rogue Pink" color="#e80e4c" />
        <ColorSwatch name="Squeaky" color="#075ff9" />
        <ColorSwatch name="Apple Valley" color="#0a8560" />
        <ColorSwatch name="Pencil Lead" color="#3c424d" />
    </SettingSection>
    <SettingSection name="Custom CSS" description="Add additional custom CSS to the applicaiton." fullWidth>
        <textarea bind:value={cssOverride} on:change={(_) => {
            Store.setCssOverride(cssOverride)
        }}></textarea>
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

        :global(.button-like) {
            display: none;
        }

        :global(.input-container) {
            height: var(--input-height);
        }

        :global(input) {
            border-radius: var(--border-radius-minimal);
            background-color: var(--color);
            color: var(--color-alt);
        }
        

        textarea {
            height: var(--min-scrollable-height);
            padding: var(--padding-less);
            border: var(--border-width) solid var(--border-color);
            border-radius: var(--border-radius);
            background-color: var(--alt-color);
            color: var(--color);
            outline: none;
            width: 100%;
        }
    }
</style>