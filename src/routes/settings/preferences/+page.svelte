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
    import { onMount } from "svelte"
    import { writable } from "svelte/store"
    import ThemeSelector from "$lib/themes/ThemeSelector.svelte"
    import { Store } from "$lib/state/Store"
    import { ToastMessage } from "$lib/state/ui/toast"
    import { availableEmoji, availableFonts, availableIdenticons, availableThemes } from "$lib/state/settings/default"
    import * as opentype from "opentype.js"
    import type { FontOption } from "$lib/types"

    let hex = get(UIStore.state.color)
    $: font = get(UIStore.state.font)
    $: emojiFont = get(UIStore.state.emojiFont)
    $: theme = get(UIStore.state.theme)
    $: identiconStyle = get(SettingsStore.state).messaging.identiconStyle

    let cssOverride = get(UIStore.state.cssOverride)
    let fontSize = get(UIStore.state.fontSize)
    let emojiUpload: HTMLInputElement
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

    let possibleEmojis: string[] = ["🛰️", "🪐", "🤣", "😀", "🖖"]
    let randomEmoji: string = possibleEmojis[Math.floor(Math.random() * possibleEmojis.length)]
    let newFontUploadTitle = ""
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
    const blobUrlMap: Record<string, string> = {}

    function getFontFamilyName(fontFile: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = function (event) {
                const arrayBuffer = event.target?.result as ArrayBuffer

                try {
                    const font = opentype.parse(arrayBuffer, {})

                    const familyName = font.names.fontFamily?.en
                    if (familyName) {
                        resolve(familyName)
                    } else {
                        reject("Font family name not found in 'en'")
                    }
                } catch (error) {
                    reject("Failed to parse font: " + error)
                }
            }

            reader.onerror = () => reject("Failed to read font file")
            reader.readAsArrayBuffer(fontFile)
        })
    }

    async function updateAvailableItems() {
        UIStore.state.allFonts.set([...availableFonts])

        availableFontsStore.set([...availableFonts])
        availableEmojiStore.set([...availableEmoji])
        availableIdenticonsStore.set([...availableIdenticons])
        availableThemesStore.set([...availableThemes])
    }

    async function loadBlobUrlMap(): Promise<void> {
        const db = await openDatabase()
        const transaction = db.transaction("fonts", "readonly")
        const store = transaction.objectStore("fonts")
        const request = store.get("fonts")

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                if (request.result && request.result.data) {
                    Object.assign(blobUrlMap, request.result.data)
                    console.log("Blob URL map loaded successfully:", blobUrlMap)
                } else {
                    console.log("No blob URL map found in IndexedDB.")
                }
                resolve()
            }
            request.onerror = () => {
                console.error("Error loading blobUrlMap:", request.error)
                reject("Error loading blobUrlMap from IndexedDB")
            }
        })
    }

    function openDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("FontSDatabase", 2) // Increment the version if needed

            request.onupgradeneeded = event => {
                const db = (event.target as IDBOpenDBRequest).result
                const oldVersion = event.oldVersion

                if (oldVersion < 1) {
                    if (!db.objectStoreNames.contains("fonts")) {
                        db.createObjectStore("fonts", { keyPath: "fileName" })
                    }
                    if (!db.objectStoreNames.contains("blobUrlMap")) {
                        db.createObjectStore("blobUrlMap", { keyPath: "id" })
                    }
                }
            }

            request.onsuccess = () => {
                resolve(request.result)
            }

            request.onerror = () => {
                reject("Error opening database: " + request.error)
            }
        })
    }

    async function saveFontToDB(fileName: string, fileData: Blob): Promise<boolean> {
        const db = await openDatabase()

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("fonts", "readwrite")
            const store = transaction.objectStore("fonts")

            const checkRequest = store.get(fileName)

            checkRequest.onsuccess = () => {
                const existingFont = checkRequest.result

                if (existingFont) {
                    Store.addToastNotification(new ToastMessage("", `Font already exists in DB: ${fileName}`, 2))
                    resolve(false)
                } else {
                    const saveRequest = store.put({ fileName, fileData })

                    saveRequest.onsuccess = () => {
                        Store.addToastNotification(new ToastMessage("", `Font saved to DB: ${fileName}`, 2))
                        resolve(true)
                    }

                    saveRequest.onerror = () => {
                        Store.addToastNotification(new ToastMessage("", `Error saving font to DB: ${fileName}`, 2))
                        reject("Error saving font to IndexedDB")
                    }
                }
            }

            checkRequest.onerror = () => {
                Store.addToastNotification(new ToastMessage("", `Error checking font in DB: ${fileName}`, 2))
                reject("Error checking font in IndexedDB")
            }
        })
    }
    availableFontsStore.subscribe(value => {
        UIStore.state.allFonts.set([...value])
    })
    function generateBase64Url(arrayBuffer: ArrayBuffer, mimeType: string): string {
        const bytes = new Uint8Array(arrayBuffer)
        const binary = bytes.reduce((data, byte) => data + String.fromCharCode(byte), "")
        const base64String = btoa(binary) // Convert binary to base64

        return `data:${mimeType};base64,${base64String}`
    }
    function generateBlobUrl(fontData: Uint8Array, mimeType: string): string {
        const blob = new Blob([fontData], { type: mimeType })
        return URL.createObjectURL(blob)
    }
    function updateAvailableFontsStore(fileName: string, base64Url: string) {
        availableFontsStore.update(currentFonts => {
            const index = currentFonts.findIndex(font => font.text === fileName)
            if (index !== -1) {
                currentFonts[index] = { text: fileName, value: base64Url }
            } else {
                if (newFontUploadTitle === fileName) {
                    UIStore.state.font.set({ text: fileName, value: base64Url })
                }
                currentFonts.push({ text: fileName, value: base64Url })
            }
            return currentFonts
        })
    }
    async function updateFontBlobUrls(): Promise<void> {
        const db = await openDatabase()
        const transaction = db.transaction("fonts", "readonly")
        const store = transaction.objectStore("fonts")
        const request = store.openCursor()
        request.onsuccess = async (event: Event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
            if (cursor) {
                const fileName = cursor.value.fileName
                const fontData = cursor.value.fileData
                const base64Url = generateBlobUrl(fontData, "font/ttf")
                updateAvailableFontsStore(fileName, base64Url)

                cursor.continue()
            }
        }
        request.onerror = () => console.error("Error loading fonts from IndexedDB")
    }
    function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                resolve(reader.result as ArrayBuffer)
            }
            reader.onerror = reject
            reader.readAsArrayBuffer(blob)
        })
    }

    async function saveFile(e: Event) {
        const target = e.target as HTMLInputElement
        if (target && target.files) {
            for (let i = 0; i < target.files.length; i++) {
                const file = target.files[i]

                const fontFam = (await getFontFamilyName(file)).replace(/\s+/g, "")

                const isSaved = await saveFontToDB(fontFam, file)

                if (!isSaved) continue

                const fileData = await blobToArrayBuffer(file)

                const base64Url = generateBase64Url(fileData, "font/tts")
                newFontUploadTitle = fontFam
                availableFontsStore.update(availableFonts => [...availableFonts, { text: fontFam, value: base64Url }])
                await updateFontBlobUrls()
                UIStore.state.font.set({ text: fontFam, value: base64Url })
            }
        }

        target.value = ""
    }
    $: {
        $availableFontsStore.forEach(f => {
            if (f.text === font.text) {
                if (f.value !== font.value) {
                    UIStore.state.font.set(f)
                }
            }
        })
    }
    $: {
        font = get(UIStore.state.font)
    }
    onMount(async () => {
        await loadBlobUrlMap()
        await updateFontBlobUrls()
        await updateAvailableItems()
    })
</script>

<div id="page">
    <SettingSection hook="section-app-language" name={$_("settings.preferences.appLanguage")} description={$_("settings.preferences.appLanguageDescription")}>
        <Select hook="selector-app-language" alt options={[{ text: "English (USA)", value: "english" }]} />
    </SettingSection>
    <SettingSection hook="section-font" name={$_("settings.preferences.font")} description={$_("settings.preferences.fontDescription")}>
        <Select
            hook="selector-current-font-{font.text}"
            selected={font.value}
            options={$availableFontsStore}
            alt
            on:change={v => {
                const selectedFont = $availableFontsStore.find(f => {
                    return f.value === v.detail
                })
                if (selectedFont) {
                    if (selectedFont.text === v.detail) {
                        UIStore.setFont({ text: v.detail, value: v.detail })
                    } else {
                        UIStore.setFont({ text: selectedFont.text, value: v.detail })
                    }
                }
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
        <input data-cy="input=upload-files" style="display:none" multiple type="file" on:change={e => saveFile(e)} bind:this={fontUpload} />
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
        <input data-cy="input=upload-files" style="display:none" multiple type="file" on:change={e => saveFile(e)} bind:this={emojiUpload} />
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
        <input data-cy="input=upload-files" style="display:none" multiple type="file" on:change={e => saveFile(e)} bind:this={identiconUpload} />
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
        <ThemeSelector />
    </SettingSection>
    <SettingSection hook="section-primary-color" name={$_("settings.preferences.primaryColor")} description={$_("settings.preferences.primaryColorDescription")} wrapContent>
        <PopupButton hook="primary-color-popup-button" name={$_("settings.preferences.pick")} color={hex}>
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
            placeholder={`body { background-color: #000; }`}
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

        :global(.wrapper) {
            padding: 0;
            margin: 0;
        }

        :global(.modal .body) {
            min-width: unset;
        }

        :global(input),
        textarea {
            border-radius: var(--border-radius-minimal);
            background-color: var(--alt-color) !important;
            color: var(--color);
        }

        textarea {
            width: 100%;
            min-height: 250px;
            border: var(--border-width) solid var(--border-color);
            padding: var(--padding-minimal);
        }
    }
</style>
