<script lang="ts">
    import { Appearance, EmojiFont, Font, Identicon, Shape, Theme } from "$lib/enums"
    import { _ } from "svelte-i18n"
    import { ColorSwatch } from "$lib/components"
    import { SettingSection } from "$lib/layouts"
    import { Button, Icon, Input, Select, Switch } from "$lib/elements"
    import ColorPicker from "svelte-awesome-color-picker"
    import PopupButton from "$lib/components/ui/PopupButton.svelte"
    import { get } from "svelte/store"
    import { UIStore } from "$lib/state/ui"
    import { SettingsStore, type ISettingsState } from "$lib/state"
    import ProfilePicture from "$lib/components/profile/ProfilePicture.svelte"
    import { onDestroy, onMount } from "svelte"
    import { writable } from "svelte/store"
    import { OperationState, type FileInfo } from "$lib/types"
    import { Store } from "$lib/state/Store"
    import { ConstellationStoreInstance } from "$lib/wasm/ConstellationStore"
    import type { Item } from "warp-wasm"
    import { ToastMessage } from "$lib/state/ui/toast"
    import { availableEmoji, availableFonts, availableIdenticons, availableThemes } from "$lib/state/settings/default"

    interface FontOption {
        text: string
        value: string
    }

    let hex = get(UIStore.state.color)
    $: font = get(UIStore.state.font)
    $: emojiFont = get(UIStore.state.emojiFont)
    $: theme = get(UIStore.state.theme)
    $: identiconStyle = get(SettingsStore.state).messaging.identiconStyle

    let cssOverride = get(UIStore.state.cssOverride)
    let fontSize = get(UIStore.state.fontSize)
    let emojiUpload: HTMLInputElement
    let themeUpload: HTMLInputElement
    let fontUpload: HTMLInputElement
    let identiconUpload: HTMLInputElement

    UIStore.state.color.subscribe(c => {
        hex = c
    })
    UIStore.state.font.subscribe(f => {
        font = f
    })
    UIStore.state.theme.subscribe(f => {
        theme = f
    })
    UIStore.state.emojiFont.subscribe(f => {
        emojiFont = f
    })
    UIStore.state.fontSize.subscribe(s => {
        fontSize = s
    })
    UIStore.state.cssOverride.subscribe(css => {
        cssOverride = css
    })

    SettingsStore.state.subscribe(settings => {
        identiconStyle = settings.messaging.identiconStyle
    })

    let newDirCreated
    let possibleEmojis: string[] = ["🛰️", "🪐", "🤣", "😀", "🖖"]
    let randomEmoji: string = possibleEmojis[Math.floor(Math.random() * possibleEmojis.length)]

    let settings: ISettingsState = get(SettingsStore.state)
    SettingsStore.state.subscribe((s: ISettingsState) => {
        settings = s
    })

    $: currentFiles = get(Store.state.files)
    Store.state.files.subscribe(files => {
        currentFiles = files
    })
    const availableFontsStore = writable<FontOption[]>([])
    const availableEmojiStore = writable<FontOption[]>([])
    const availableIdenticonsStore = writable<FontOption[]>([])
    const availableThemesStore = writable<FontOption[]>([])
    $: if (hex !== undefined) {
        UIStore.setThemeColor(hex)
    }
    async function getCurrentDirectoryFiles() {
        let files = await ConstellationStoreInstance.getCurrentDirectoryFiles()
        files.onSuccess(items => {
            let newFilesInfo = itemsToFileInfo(items)
            let filesSet = new Set(newFilesInfo)
            Store.state.files.set(Array.from(filesSet))
            currentFiles = Array.from(filesSet)
        })
    }
    async function updateAvailableItems() {
        const fonts = getUserUploadedItems("fonts")
        const emoji = getUserUploadedItems("emoji")
        const identicons = getUserUploadedItems("identicon")
        const themes = getUserUploadedItems("theme")

        availableFontsStore.set([...availableFonts, ...fonts])
        availableEmojiStore.set([...availableEmoji, ...emoji])
        availableIdenticonsStore.set([...availableIdenticons, ...identicons])
        availableThemesStore.set([...availableThemes, ...themes])
    }
    function splitFileName(fileName: string): { name: string; extension: string } {
        const lastDotIndex = fileName.lastIndexOf(".")
        if (lastDotIndex === -1) {
            return { name: fileName, extension: "" }
        }
        const name = fileName.substring(0, lastDotIndex)
        const extension = fileName.substring(lastDotIndex + 1)
        return { name, extension }
    }

    async function saveFile(e: Event, folderHandle: string) {
        const target = e.target as HTMLInputElement
        if (target && target.files) {
            for (let i = 0; i < target.files.length; i++) {
                const file = target.files[i]
                const stream = file.stream()
                const fileNameParts = file.name.split(".")
                const baseName = fileNameParts.slice(0, -1).join(".")
                const fileExtension = fileNameParts.slice(-1)[0]
                let newFileName = file.name
                let fileIndex = 1
                newFileName = `${baseName} (${fileIndex}).${fileExtension}`
                await ConstellationStoreInstance.openDirectory("customization")
                await ConstellationStoreInstance.openDirectory(folderHandle)
                let result = await ConstellationStoreInstance.uploadFilesFromStream(newFileName, stream, file.size)
                result.onSuccess(r => {
                    ConstellationStoreInstance.dropIntoFolder(newFileName, folderHandle)
                    ConstellationStoreInstance.goToRootPath()
                    getCurrentDirectoryFiles().then(updateAvailableItems)
                })
                result.onFailure(err => {
                    Store.addToastNotification(new ToastMessage("", err, 3, Shape.XMark, Appearance.Error))
                })
            }
        }
        target.value = ""
    }

    function itemsToFileInfo(items: Item[]): FileInfo[] {
        let filesInfo: FileInfo[] = []
        items.forEach(item => {
            let newItem: FileInfo = {
                id: item!.id(),
                type: item.is_file() ? "file" : "folder",
                icon: item.is_file() ? Shape.Document : Shape.Folder,
                name: item.is_file() ? splitFileName(item.name()).name : item!.name(),
                size: item!.size(),
                remotePath: item!.path(),
                imageThumbnail: "",
                isRenaming: OperationState.Initial,
                extension: item.is_file() ? splitFileName(item.name()).extension : "",
                source: "",
                items: item.is_file() ? undefined : itemsToFileInfo(item.directory()!.get_items()),
            }
            filesInfo = [...filesInfo, newItem]
        })
        return filesInfo
    }

    function getUserUploadedItems(type: string): { text: string; value: string }[] {
        const userUploaded: { text: string; value: string }[] = []

        currentFiles.forEach(e => {
            if (e.name === "customization") {
                e.items?.forEach(a => {
                    if (a.name === type) {
                        a.items?.forEach(item => {
                            userUploaded.push({
                                text: item.name.split(".")[0],
                                value: item.remotePath,
                            })
                        })
                    }
                })
            }
        })
        getCurrentDirectoryFiles()

        return userUploaded
    }

    async function loadOrCreateFolders() {
        await ConstellationStoreInstance.goToRootPath()
        newDirCreated = await ConstellationStoreInstance.createDirectory("customization")

        let checkForCustomFolder: boolean = false
        newDirCreated.onSuccess(items => {
            checkForCustomFolder = true
        })
        newDirCreated.onFailure(item => getCurrentDirectoryFiles())
        if (checkForCustomFolder) {
            await ConstellationStoreInstance.createDirectory("emoji")
            await ConstellationStoreInstance.createDirectory("fonts")
            await ConstellationStoreInstance.createDirectory("theme")
            await ConstellationStoreInstance.createDirectory("identicon")
            await ConstellationStoreInstance.dropIntoFolder("emoji", "customization")
            await ConstellationStoreInstance.dropIntoFolder("fonts", "customization")
            await ConstellationStoreInstance.dropIntoFolder("theme", "customization")
            await ConstellationStoreInstance.dropIntoFolder("identicon", "customization")
        }
        getCurrentDirectoryFiles()
    }
    const unsubscribeFromFiles = Store.state.files.subscribe((f: any) => {
        currentFiles = f
    })
    onMount(async () => {
        await loadOrCreateFolders()
        await getCurrentDirectoryFiles().then(updateAvailableItems)
    })
    onDestroy(async () => unsubscribeFromFiles())
</script>

<div id="page">
    <SettingSection hook="section-app-language" name={$_("settings.preferences.appLanguage")} description={$_("settings.preferences.appLanguageDescription")}>
        <Select hook="selector-app-language" alt options={[{ text: "English (USA)", value: "english" }]} />
    </SettingSection>
    <SettingSection hook="section-font" name={$_("settings.preferences.font")} description={$_("settings.preferences.fontDescription")}>
        <Select
            hook="selector-current-font-{font.toLowerCase()}"
            selected={font}
            options={$availableFontsStore}
            alt
            on:change={v => {
                UIStore.setFont(v.detail)
            }} />
        <Button
            hook="button-font-open-folder"
            on:click={async event => {
                fontUpload?.click()
            }}
            icon
            appearance={Appearance.Alt}
            tooltip={$_("generic.openFolder")}>
            <Icon icon={Shape.FolderOpen} />
        </Button>
        <input data-cy="input=upload-files" style="display:none" multiple type="file" on:change={e => saveFile(e, "fonts")} bind:this={fontUpload} />
    </SettingSection>
    <SettingSection hook="section-emoji-font" name={$_("settings.preferences.emojiFont")} description={$_("settings.preferences.emojiFontDescription")}>
        <span data-cy="emoji-font-random-emoji" class="emoji">{randomEmoji}</span>
        <Select
            hook="selector-current-emoji-font-{emojiFont.toLowerCase()}"
            selected={emojiFont}
            options={$availableEmojiStore}
            alt
            on:change={v => {
                UIStore.setEmojiFont(v.detail)
            }} />
        <Button
            hook="button-emoji-font-open-folder"
            on:click={async event => {
                // let emojiUpload = event.dataTransfer?.files
                emojiUpload?.click()
            }}
            icon
            appearance={Appearance.Alt}
            tooltip={$_("generic.openFolder")}>
            <Icon icon={Shape.FolderOpen} />
        </Button>
        <input data-cy="input=upload-files" style="display:none" multiple type="file" on:change={e => saveFile(e, "emoji")} bind:this={emojiUpload} />
    </SettingSection>
    <SettingSection hook="section-identicon" name={$_("settings.preferences.identiconStyle")} description={$_("settings.preferences.identiconStyleDescription")}>
        <ProfilePicture hook="identicon-profile-picture" id={"0x0000000000000000000000000000000000000000"} />
        <Select
            hook="selector-current-identicon-{identiconStyle.toLowerCase()}"
            selected={identiconStyle}
            options={$availableIdenticonsStore}
            alt
            on:change={v => {
                SettingsStore.update({ ...settings, messaging: { ...settings.messaging, identiconStyle: v.detail } })
            }} />
        <Button
            hook="button-identicon-open-folder"
            on:click={async event => {
                identiconUpload?.click()
            }}
            icon
            appearance={Appearance.Alt}
            tooltip={$_("generic.openFolder")}>
            <Icon icon={Shape.FolderOpen} />
        </Button>
        <input data-cy="input=upload-files" style="display:none" multiple type="file" on:change={e => saveFile(e, "identicon")} bind:this={identiconUpload} />
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
        <Select
            hook="selector-theme"
            alt
            selected={theme}
            options={$availableThemesStore}
            on:change={v => {
                console.log(v)
                UIStore.setTheme(v.detail)
            }} />
        <Button
            hook="button-theme-open-folder"
            icon
            appearance={Appearance.Alt}
            on:click={async event => {
                themeUpload?.click()
            }}>
            <Icon icon={Shape.FolderOpen} />
        </Button>
        <input data-cy="input=upload-files" style="display:none" multiple type="file" on:change={e => saveFile(e, "theme")} bind:this={themeUpload} />
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
    <SettingSection hook="section-widget-panel" name={$_("settings.messages.showStatusWidgets")} description={$_("settings.messages.showStatusWidgetsDescription")}>
        <Switch
            hook="switch-show-widgets"
            on={settings ? settings.widgets.show : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, widgets: { ...settings.widgets, show: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-minimal-call-alerts" name={$_("settings.calling.minimalCallingAlerts")} description={$_("settings.calling.minimalCallingAlertsDescription")}>
        <Switch
            hook="switch-minimal-call-alerts"
            on={settings ? settings.calling.minimalCallingAlerts : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, calling: { ...(settings.calling || {}), minimalCallingAlerts: on.detail } })
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
