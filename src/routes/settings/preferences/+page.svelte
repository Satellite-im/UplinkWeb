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
    import type { Result } from "$lib/utils/Result"
    import type { WarpError } from "$lib/wasm/HandleWarpErrors"
    import * as opentype from "opentype.js"
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
    function getFontFamilyName(fontFile: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = function (event) {
                const arrayBuffer = event.target?.result as ArrayBuffer

                try {
                    const font = opentype.parse(arrayBuffer, {})

                    // Ensure the font has a family name in English ('en')
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

    // Example usage
    // const fontFile = // ... your uploaded font file (e.g., File or Blob object)
    //     getFontFamilyName(fontFile)
    //         .then(fontFamily => {
    //             console.log("Font Family:", fontFamily)
    //         })
    //         .catch(error => {
    //             console.error(error)
    //         })

    async function updateAvailableItems() {
        const fonts = getUserUploadedItems("fonts")
        const emoji = getUserUploadedItems("emoji")
        const identicons = getUserUploadedItems("identicon")
        const themes = getUserUploadedItems("theme")
        UIStore.state.allFonts.set([...availableFonts, ...fonts])

        availableFontsStore.set([...availableFonts, ...fonts])
        availableEmojiStore.set([...availableEmoji, ...emoji])
        availableIdenticonsStore.set([...availableIdenticons, ...identicons])
        availableThemesStore.set([...availableThemes, ...themes])
    }
    const blobUrlMap: Record<string, string> = {}

    // function updateBlobUrl(fileName: string, blobUrl: string) {
    //     blobUrlMap[fileName] = blobUrl
    //     console.log("Updated blob URL:", fileName, blobUrlMap)

    //     // Update availableFontsStore with new font
    //     availableFontsStore.update(existingFonts => {
    //         const newFont: FontOption = {
    //             text: fileName,
    //             value: blobUrl,
    //         }
    //         return [...existingFonts, newFont]
    //     })
    //     console.log("Updated availableFontsStore", $availableFontsStore, blobUrlMap)

    //     // Optionally, update other stores or state if needed
    //     // getCurrentDirectoryFiles().then(updateAvailableItems)
    // }
    async function saveBlobUrlMap(fileName: string): Promise<void> {
        const db = await openDatabase()
        const transaction = db.transaction("blobUrlMap", "readwrite")
        const store = transaction.objectStore("blobUrlMap")
        store.put({ id: "blobUrlMap", data: blobUrlMap })

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve()
            transaction.onerror = () => reject("Error saving blobUrlMap to IndexedDB")
        })
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
    // Open (or create) an IndexedDB database
    function openDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("FontSDatabase", 2) // Increment the version if needed

            request.onupgradeneeded = event => {
                const db = (event.target as IDBOpenDBRequest).result
                const oldVersion = event.oldVersion

                if (oldVersion < 1) {
                    // Create object stores
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

    // Save a font file (ArrayBuffer) into IndexedDB
    async function saveFontToDB(fileName: string, fileData: Blob): Promise<void> {
        const db = await openDatabase()

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("fonts", "readwrite")
            const store = transaction.objectStore("fonts")
            // Save the font data (Blob) with the file name as the key
            const request = store.put({ fileName, fileData })

            // Success handler
            request.onsuccess = () => {
                console.log(`Font saved to DB: ${fileName}`)

                resolve()
            }

            // Error handler
            request.onerror = () => {
                console.error(`Error saving font to DB: ${fileName}`)
                reject("Error saving font to IndexedDB")
            }
        })
    }
    availableFontsStore.subscribe(value => {
        UIStore.state.allFonts.set([...value])
        console.log("Available fonts store value:", value)
    })
    // function splitFileName(fileName: string): { name: string; extension: string } {
    //     const lastDotIndex = fileName.lastIndexOf(".")
    //     if (lastDotIndex === -1) {
    //         return { name: fileName, extension: "" }
    //     }
    //     const name = fileName.substring(0, lastDotIndex)
    //     const extension = fileName.substring(lastDotIndex + 1)
    //     return { name, extension }
    // }
    // function arrayBufferToBase64(buffer: ArrayBuffer): string {
    //     let binary = ""
    //     const bytes = new Uint8Array(buffer)
    //     const len = bytes.byteLength
    //     for (let i = 0; i < len; i++) {
    //         binary += String.fromCharCode(bytes[i])
    //     }
    //     return window.btoa(binary)
    // }

    // Generate a Base64 URL for the font
    function generateBase64Url(arrayBuffer: ArrayBuffer, mimeType: string): string {
        const bytes = new Uint8Array(arrayBuffer)
        const binary = bytes.reduce((data, byte) => data + String.fromCharCode(byte), "")
        const base64String = btoa(binary) // Convert binary to base64

        return `data:${mimeType};base64,${base64String}`
    }
    // async function loadFontAndInjectCss(file: File) {
    //     // Convert Blob to ArrayBuffer
    //     const fileData = await blobToArrayBuffer(file)

    //     // Generate base64 URL
    //     const base64Url = generateBase64Url(fileData, "font/ttf")
    //     console.log(base64Url)
    //     // For example, in CSS
    //     const fontFaceCss = `
    //     @font-face {
    //         font-family: 'CustomFont';
    //         src: url(${base64Url}) format('truetype');
    //     }
    // `

    //     // Inject the font face CSS into the document
    //     document.head.insertAdjacentHTML("beforeend", `<style>${fontFaceCss}</style>`)
    //     console.log("Custom font injected:", fontFaceCss)
    // }

    // Call this function with your file object where it's available
    // const input = document.querySelector("input[type='file']")
    // input?.addEventListener("change", async (e: Event) => {
    //     const target = e.target as HTMLInputElement
    //     if (target && target.files && target.files.length > 0) {
    //         const file = target.files[0]
    //         await loadFontAndInjectCss(file) // Pass the file to the function
    //     }
    // })
    // For example, in CSS
    // const fontFaceCss = `
    //     @font-face {
    //         font-family: 'CustomFont';
    //         src: url(${base64Url}) format('truetype');
    //     }
    // `
    // document.head.insertAdjacentHTML("beforeend", `<style>${fontFaceCss}</style>`)
    async function getFontDataFromDB(fileName: string): Promise<Uint8Array | null> {
        const db = await openDatabase()
        const transaction = db.transaction("fonts", "readonly")
        const store = transaction.objectStore("fonts")
        const request = store.get(fileName)

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.fileData) // Assuming `fileData` is the property holding the font data
                } else {
                    resolve(null)
                }
            }
            request.onerror = () => reject("Error retrieving font data from IndexedDB")
        })
    }
    function generateBlobUrl(fontData: Uint8Array, mimeType: string): string {
        const blob = new Blob([fontData], { type: mimeType })
        console.log(URL.createObjectURL(blob))
        return URL.createObjectURL(blob)
    }
    function updateAvailableFontsStore(fileName: string, base64Url: string) {
        // Assuming `availableFontsStore` is a writable store
        availableFontsStore.update(currentFonts => {
            const index = currentFonts.findIndex(font => font.text === fileName)
            if (index !== -1) {
                currentFonts[index] = { text: fileName, value: base64Url }
            } else {
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
        console.log(request)
        request.onsuccess = async (event: Event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
            if (cursor) {
                const fileName = cursor.value.fileName
                const fontData = cursor.value.fileData
                const base64Url = generateBlobUrl(fontData, "font/ttf")
                // Update your store or application state with the new URL
                updateAvailableFontsStore(fileName, base64Url)

                cursor.continue()
            }
        }

        request.onerror = () => console.error("Error loading fonts from IndexedDB")
    }
    async function loadFont(fileName: string) {
        const fontData = await getFontDataFromDB(fileName)
        console.log("load font func", fontData)
        if (fontData) {
            const base64Url = generateBase64Url(fontData, "font/ttf") // Assuming TTF here, adjust as needed
            updateBlobUrl(fileName, base64Url) // Store the URL for app use
        }
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
    function updateBlobUrl(fileName: string, blobUrl: string) {
        blobUrlMap[fileName] = blobUrl
        console.log("Updated blob URL:", fileName, blobUrlMap)

        // Save the updated blobUrlMap to IndexedDB
        saveBlobUrlMap(fileName).catch(err => console.error(err))

        // Update the available fonts store
        updateAvailableItems()
    }
    async function saveFile(e: Event, folderHandle: string) {
        const target = e.target as HTMLInputElement
        if (target && target.files) {
            for (let i = 0; i < target.files.length; i++) {
                const file = target.files[i]

                const fontFam = (await getFontFamilyName(file)).replace(/\s+/g, "")

                // Save the font file to IndexedDB (Blob)
                await saveFontToDB(fontFam, file)

                // Convert Blob to ArrayBuffer
                const fileData = await blobToArrayBuffer(file)

                // Generate base64 URL
                const base64Url = generateBase64Url(fileData, "font/tts")

                // Update availableFontsStore with base64 URL and fileName
                availableFontsStore.update(availableFonts => [...availableFonts, { text: fontFam, value: base64Url }])

                console.log(`Base64 URL for ${fontFam} added to store:`, $availableFontsStore)
            }
        }

        target.value = "" // Reset the input value
    }
    function getUserUploadedItems(type: string): { text: string; value: string }[] {
        const userUploaded: { text: string; value: string }[] = []
        const availbleBlobUrls = blobUrlMap

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

        return userUploaded
    }
    async function syncFonts() {
        // Load fonts from store
        const availableFonts = $availableFontsStore
        const fontValue: Font = availableFonts[0]?.value as Font
        // Set the font in UIStore to a default or preferred font

        UIStore.state.allFonts.set([...availableFonts])
        if (availableFonts.length > 0) {
            UIStore.state.font.set(fontValue) // or whatever logic you use
        }
    }
    const unsubscribeFromFiles = Store.state.files.subscribe((f: any) => {
        currentFiles = f
    })
    $: {
        // When availableFontsStore changes, update the UIStore font
        const fonts = $availableFontsStore
        const fontValue: Font = fonts[0]?.value as Font
        if (fonts.length > 0) {
            // Assuming you want to use the first font or implement your own logic
            UIStore.state.font.set(fontValue)
        }
    }
    onMount(async () => {
        await loadBlobUrlMap() // Load blobUrlMap from IndexedDB
        await updateFontBlobUrls()
        updateAvailableItems() // Ensure this updates availableFontsStore correctly
        syncFonts()
        console.log(font)
        const fontNames = Object.keys(blobUrlMap) // Assuming blobUrlMap holds the font names
        for (const fontName of fontNames) {
            console.log(fontName, "ONMOUNT")
            await loadFont(fontName)
        }
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
