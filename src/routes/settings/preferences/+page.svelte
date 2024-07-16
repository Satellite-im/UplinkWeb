<script lang="ts">
    import { Appearance, EmojiFont, Font, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { ColorSwatch } from "$lib/components"
    import { SettingSection } from "$lib/layouts"
    import { Button, Icon, Input, Select, Switch } from "$lib/elements"
    import ColorPicker from "svelte-awesome-color-picker"
    import PopupButton from "$lib/components/ui/PopupButton.svelte"
    import { get } from "svelte/store"
    import { UIStore } from "$lib/state/ui"
    import { SettingsStore, type ISettingsState } from "$lib/state"

    initLocale()

    let hex = get(UIStore.state.color)
    let font: Font = get(UIStore.state.font)
    let emojiFont: EmojiFont = get(UIStore.state.emojiFont)
    let cssOverride = get(UIStore.state.cssOverride)
    let fontSize = get(UIStore.state.fontSize)

    UIStore.state.color.subscribe(c => {
        hex = c
    })
    UIStore.state.font.subscribe(f => {
        font = f
    })
    UIStore.state.fontSize.subscribe(s => {
        fontSize = s
    })
    UIStore.state.cssOverride.subscribe(css => {
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
        { text: Font.PoiretOne, value: Font.PoiretOne },
        { text: Font.OpenDyslexic, value: Font.OpenDyslexic },
    ]

    const availableEmojiFonts = [
        { text: EmojiFont.NotoEmoji.split(".")[0], value: EmojiFont.NotoEmoji },
        { text: EmojiFont.OpenMoji.split(".")[0], value: EmojiFont.OpenMoji },
        { text: EmojiFont.Blobmoji.split(".")[0], value: EmojiFont.Blobmoji },
        { text: EmojiFont.Twemoji.split(".")[0], value: EmojiFont.Twemoji },
        { text: EmojiFont.Fluent.split(".")[0], value: EmojiFont.Fluent },
    ]

    let possibleEmojis: string[] = ["🛰️", "🪐", "🤣", "😀", "🖖"]
    let randomEmoji: string = possibleEmojis[Math.floor(Math.random() * possibleEmojis.length)]

    let settings: ISettingsState = get(SettingsStore.state)
    SettingsStore.state.subscribe((s: ISettingsState) => {
        settings = s
    })

    $: if (hex !== undefined) {
        UIStore.setThemeColor(hex)
    }
</script>

<div id="page">
    <SettingSection hook="section-app-language" name={$_("settings.preferences.appLanguage")} description={$_("settings.preferences.appLanguageDescription")}>
        <Select hook="selector-app-language" alt options={[{ text: "English (USA)", value: "english" }]} />
    </SettingSection>
    <SettingSection hook="section-font" name={$_("settings.preferences.font")} description={$_("settings.preferences.fontDescription")}>
        <Select
            hook="selector-current-font-{font.toLowerCase()}"
            selected={font}
            options={availableFonts}
            alt
            on:change={v => {
                UIStore.setFont(v.detail)
            }} />
        <Button hook="button-font-open-folder" icon appearance={Appearance.Alt} tooltip={$_("generic.openFolder")}>
            <Icon icon={Shape.FolderOpen} />
        </Button>
    </SettingSection>
    <SettingSection hook="section-emoji-font" name={$_("settings.preferences.emojiFont")} description={$_("settings.preferences.emojiFontDescription")}>
        <span class="emoji">{randomEmoji}</span>
        <Select
            hook="selector-current-emoji-font-{emojiFont.toLowerCase()}"
            selected={emojiFont}
            options={availableEmojiFonts}
            alt
            on:change={v => {
                UIStore.setEmojiFont(v.detail)
            }} />
        <Button hook="button-emoji-font-open-folder" icon appearance={Appearance.Alt} tooltip={$_("generic.openFolder")}>
            <Icon icon={Shape.FolderOpen} />
        </Button>
    </SettingSection>
    <SettingSection hook="section-font-scaling" name={$_("settings.preferences.fontScaling")} description={$_("settings.preferences.fontScalingDescription")}>
        <Button hook="button-font-scaling-decrease" icon appearance={Appearance.Alt} on:click={_ => UIStore.decreaseFontSize()}>
            <Icon icon={Shape.Minus} />
        </Button>
        <div class="font-size">
            <Input hook="input-font-scaling" disabled={true} alt value={fontSize.toFixed(2).toString()} centered />
        </div>
        <Button hook="button-font-scaling-increase" icon appearance={Appearance.Alt} on:click={_ => UIStore.increaseFontSize()}>
            <Icon icon={Shape.Plus} />
        </Button>
    </SettingSection>
    <SettingSection hook="section-theme" name={$_("settings.preferences.theme")} description={$_("settings.preferences.themeDescription")}>
        <Button hook="button-theme-moon" icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Moon} />
        </Button>
        <Select hook="selector-theme" alt options={[{ text: "Default", value: "default" }]} />
        <Button hook="button-theme-open-folder" icon appearance={Appearance.Alt}>
            <Icon icon={Shape.FolderOpen} />
        </Button>
    </SettingSection>
    <SettingSection hook="section-primary-color" name={$_("settings.preferences.primaryColor")} description={$_("settings.preferences.primaryColorDescription")} wrapContent>
        <PopupButton hook="primary-color-popup-button" name={$_("settings.preferences.pick")}>
            <ColorPicker textInputModes={["hex"]} isDialog={false} isAlpha={false} bind:hex={hex} />
            <div slot="icon" class="control">
                <Icon icon={Shape.Eyedropper} />
            </div>
        </PopupButton>
        <ColorSwatch name="Neo Orbit" color="#4d4dff" />
        <ColorSwatch name="Creamy Peach" color="#ff008d" />
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
    <SettingSection hook="section-convert-to-emoji" name={$_("settings.messages.showStatusWidgets")} description={$_("settings.messages.showStatusWidgetsDescription")}>
        <Switch
            hook="checkbox-show-widgets"
            on={settings ? settings.widgets.show : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, widgets: { ...settings.widgets, show: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-custom-css" name={$_("settings.preferences.customCss")} description={$_("settings.preferences.customCssDescription")} fullWidth>
        <textarea
            data-cy="text-area-custom-css"
            bind:value={cssOverride}
            on:change={_ => {
                UIStore.setCssOverride(cssOverride)
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
        padding: var(--padding);

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
            background-color: var(--alt-color);
            color: var(--color);
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
