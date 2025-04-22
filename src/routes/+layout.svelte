<script lang="ts">
    import { page } from "$app/stores"
    import { Toasts } from "$lib/components"
    import IncomingCall from "$lib/components/calling/IncomingCall.svelte"
    import Polling from "$lib/components/Polling.svelte"
    import GamepadListener from "$lib/components/ui/GamepadListener.svelte"
    import KeyboardListener from "$lib/components/ui/KeyboardListener.svelte"
    import { playSound, Sounds } from "$lib/components/utils/SoundHandler"
    import { EmojiFont, getRoute, KeybindAction, KeybindState, Route } from "$lib/enums"
    import { VoiceRTCInstance } from "$lib/media/Voice"
    import { SettingsStore } from "$lib/state"
    import { checkIfUserIsLogged } from "$lib/state/auth"
    import { Store } from "$lib/state/Store"
    import { UIStore } from "$lib/state/ui"
    import type { FontOption, Keybind } from "$lib/types"
    import { log } from "$lib/utils/Logger"
    import "/src/app.scss"
    import TimeAgo from "javascript-time-ago"
    import en from "javascript-time-ago/locale/en"
    import { onMount } from "svelte"
    import { get } from "svelte/store"
    import { _, locale } from "svelte-i18n"
    import { initializeLocale } from "$lib/lang/index"
    import CircularProgressIndicator from "$lib/components/loading/CircularProgressIndicator.svelte"
    import MouseListener from "$lib/components/ui/MouseListener.svelte"
    import InstallBanner from "$lib/components/ui/InstallBanner.svelte"
    import Market from "$lib/components/market/Market.svelte"
    import { swipe } from "$lib/components/ui/Swipe"
    import Wallet from "$lib/components/wallet/Wallet.svelte"
    import { WalletStore } from "$lib/state/wallet"
    import { ScreenOrientation } from "@capacitor/screen-orientation"
    import { App } from "@capacitor/app"
    import BottomNavBarMobile from "$lib/layouts/BottomNavBarMobile.svelte"
    import { goto } from "$app/navigation"
    import { routes } from "$lib/defaults/routes"
    import { fetchDeviceInfo, isAndroid, isAndroidOriOS, isiOSMobile } from "$lib/utils/Mobile"
    import { Keyboard, KeyboardResize } from "@capacitor/keyboard"
    import { changeSafeAreaColorsOnAndroid } from "$lib/plugins/safeAreaColorAndroid"
    import { changeSafeAreaColorsOniOS } from "$lib/plugins/safeAreaColoriOS"
    import VideoPreview from "$lib/components/calling/VideoPreview.svelte"
    import { ToastMessage } from "$lib/state/ui/toast"

    log.debug("Initializing app, layout routes page.")

    TimeAgo.addDefaultLocale(en)
    let keybinds: Keybind[]
    let devmode: boolean = get(SettingsStore.state).devmode
    let color: string = get(UIStore.state.color)
    let fontSize: number = get(UIStore.state.fontSize)
    let font: FontOption = get(UIStore.state.font)
    let allFonts: FontOption[] = get(UIStore.state.allFonts)
    let emojiFont: EmojiFont = get(UIStore.state.emojiFont)
    let theme: string = get(UIStore.state.theme)
    let cssOverride: string = get(UIStore.state.cssOverride)
    let muted: boolean = get(Store.state.devices.muted)
    let deafened: boolean = get(Store.state.devices.deafened)

    function handleKeybindMatch(event: CustomEvent<any>) {
        let keybind: Keybind = event.detail
        let state: KeybindState = keybind.state

        switch (keybind.action) {
            case KeybindAction.IncreaseFontSize:
                UIStore.increaseFontSize()
                break
            case KeybindAction.DecreaseFontSize:
                UIStore.decreaseFontSize()
                break
            case KeybindAction.ToggleMute:
                if (VoiceRTCInstance.isInCall) {
                    Store.updateMuted(!muted)
                    VoiceRTCInstance.toggleMute(!muted)
                }
                break
            case KeybindAction.ToggleDeafen:
                if (VoiceRTCInstance.isInCall) {
                    Store.updateDeafened(!deafened)
                    VoiceRTCInstance.toggleDeafen(!deafened)
                }
                break
            case KeybindAction.OpenInspector:
                log.info("todo")
                break
            case KeybindAction.ToggleDevmode:
                log.info("todo")
                break
            case KeybindAction.FocusUplink:
                log.info("todo")
                break
            case KeybindAction.PushToTalk:
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Press)
                    VoiceRTCInstance.toggleMute(false)
                }
                break
            case KeybindAction.PushToMute:
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Press)
                    VoiceRTCInstance.toggleMute(true)
                }
                break
            case KeybindAction.PushToDeafen:
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Press)
                    VoiceRTCInstance.toggleDeafen(true)
                }
                break
            default:
                log.info("unhandled keybind " + keybind.action)
        }
    }
    function handleKeybindMatchRelease(event: CustomEvent<any>) {
        let keybind: Keybind = event.detail
        let state: KeybindState = keybind.state

        switch (keybind.action) {
            case KeybindAction.PushToTalk:
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Release)
                    VoiceRTCInstance.toggleMute(true)
                }
                break
            case KeybindAction.PushToMute:
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Release)
                    VoiceRTCInstance.toggleMute(false)
                }
                break
            case KeybindAction.PushToDeafen:
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Release)
                    VoiceRTCInstance.toggleDeafen(false)
                }
                break
            default:
                log.info("unhandled keybind " + keybind.action)
        }
    }

    function getValidFontFormats(fontName: string): string {
        const extensions = ["ttf", "otf", "woff2", "woff"]
        return extensions.map(ext => `/assets/font/${fontName}.${ext} format('${ext}')`).join(", ")
    }

    function buildStyle() {
        const activeFont = get(UIStore.state.font)
        const allFontsFromStore = get(UIStore.state.allFonts)
        let fontFaceRules = ""

        fontFaceRules = allFontsFromStore
            .map(({ text, value }) => {
                const isActiveFont = activeFont && activeFont.value === value

                if (value.startsWith("blob:") && isActiveFont) {
                    return `
                @font-face {
                    font-family: '${text}';
                    src: url('${value}'); // Use the blob URL directly
                    font-weight: normal;
                    font-style: normal;
                }`
                }

                if (!value.startsWith("blob:") && isActiveFont) {
                    const validFontFormats = getValidFontFormats(text)
                    return `
                @font-face {
                    font-family: '${text}';
                    src: ${validFontFormats}; // Load only valid formats
                    font-weight: normal;
                    font-style: normal;
                }`
                }
            })
            .filter(Boolean) // Remove any undefined/null values
            .join("\n")

        const primaryFont = activeFont.text || font.text

        return `
        ${fontFaceRules}
        :root {
            --font-size: ${fontSize.toFixed(2)}rem;
            --primary-color: ${color};
            --primary-font: '${primaryFont}'; // Ensure primary font is set
        }
        .emoji {
            font-family: '${emojiFont}';
        }
        .theme {
            font-family: '${theme}';
        }
    `
    }

    function injectStyle(styleString: string) {
        const style = document.createElement("style")
        style.innerHTML = styleString
        document.head.appendChild(style)
    }

    let style: string = buildStyle()
    injectStyle(buildStyle())
    UIStore.state.color.subscribe(v => {
        color = v
        style = buildStyle()
    })

    UIStore.state.fontSize.subscribe(s => {
        fontSize = s
        style = buildStyle()
    })

    UIStore.state.cssOverride.subscribe(css => {
        cssOverride = css
        style = buildStyle()
    })

    UIStore.state.font.subscribe(f => {
        font = f
        style = buildStyle()
    })

    UIStore.state.allFonts.subscribe(f => {
        allFonts = f
        style = buildStyle()
    })

    UIStore.state.emojiFont.subscribe(f => {
        emojiFont = f
        style = buildStyle()
    })

    UIStore.state.theme.subscribe(f => {
        theme = f
        style = buildStyle()
        changeSafeAreaColors()
    })

    function changeSafeAreaColors() {
        setTimeout(() => {
            const rootStyles = getComputedStyle(document.documentElement)
            let mainBgColor = rootStyles.getPropertyValue("--background").trim()
            if (isAndroid()) {
                changeSafeAreaColorsOnAndroid(mainBgColor)
            }
            if (isiOSMobile()) {
                changeSafeAreaColorsOniOS(mainBgColor)
            }
        }, 1000)
    }

    SettingsStore.state.subscribe(settings => {
        keybinds = settings.keybinds
        devmode = settings.devmode
    })
    Store.state.devices.muted.subscribe(state => (muted = state))
    Store.state.devices.deafened.subscribe(state => (deafened = state))

    window.addEventListener(
        "click",
        () => {
            initializeAudioContext()
            log.debug("Audio context unlocked after click.")
        },
        { once: true }
    )

    window.addEventListener(
        "touchstart",
        () => {
            initializeAudioContext()
            log.debug("Audio context unlocked after touch.")
        },
        { once: true }
    )

    function initializeAudioContext() {
        const audioContext = new window.AudioContext()
        if (audioContext.state === "suspended") {
            audioContext.resume().then(() => {
                log.info("Audio context unlocked.")
            })
        }
    }

    let isLocaleSet = false

    $: if ($locale) {
        isLocaleSet = true
    }

    $: showWallet = WalletStore.state.open
    $: walletPosition = WalletStore.state.position

    const lockOrientation = async () => {
        try {
            await ScreenOrientation.lock({ orientation: "portrait" })
            log.info("Screen orientation locked to portrait.")
        } catch (error) {
            log.error("Failed to lock screen orientation:", error)
        }
    }

    onMount(() => {
        let exitAppInNextPress = false
        if (isAndroid()) {
            App.addListener("backButton", async _ => {
                const sidebarOpenValue = get(UIStore.state.sidebarOpen)
                if (!sidebarOpenValue) {
                    UIStore.openSidebar()
                    return
                }

                if (history.length <= 2 && !exitAppInNextPress) {
                    exitAppInNextPress = true
                    alert("Press back again to exit.")
                } else if (history.length <= 2 && exitAppInNextPress) {
                    await App.exitApp()
                }

                if (history.length > 2) {
                    exitAppInNextPress = false
                    history.back()
                }
            })

            return () => {
                App.removeAllListeners()
            }
        }
    })

    onMount(async () => {
        await fetchDeviceInfo()
        if (isAndroidOriOS()) {
            lockOrientation()
        }
        if (isiOSMobile()) {
            await Keyboard.setResizeMode({ mode: KeyboardResize.Native })
        }

        await checkIfUserIsLogged($page.route.id)
        await initializeLocale()
        buildStyle()
        changeSafeAreaColors()
    })

    $: activeRoute = getRoute($page.route.id!)
</script>

{#if isLocaleSet}
    <div
        id="app"
        use:swipe
        on:swipeleft={() => {
            UIStore.closeSidebar()
            if (isAndroidOriOS()) {
                Keyboard.hide()
            }
        }}
        on:swiperight={() => {
            UIStore.openSidebar()
            if (isAndroidOriOS()) {
                Keyboard.hide()
            }
        }}>
        {@html `<style>${style}</style>`}
        <link rel="stylesheet" href={`/assets/themes/${theme}.css`} />
        {@html `<style>${cssOverride}</style>`}
        <Polling rate={5000} />
        <KeyboardListener keybinds={keybinds} on:match={handleKeybindMatch} on:matchRelease={handleKeybindMatchRelease} />
        <MouseListener on:clicked={() => {}} />
        <Toasts />
        <IncomingCall />
        <VideoPreview />
        <GamepadListener />
        {#if $showWallet}
            <Wallet position={{ top: $walletPosition[0], left: $walletPosition[1] }} />
        {/if}
        <Market on:close={() => UIStore.toggleMarket()} />
        <InstallBanner />
        <slot></slot>
        <BottomNavBarMobile
            icons
            routes={routes}
            activeRoute={activeRoute}
            on:navigate={e => {
                activeRoute = e.detail
                goto(e.detail)
            }} />
    </div>
{:else}
    <CircularProgressIndicator />
{/if}

<style lang="scss">
    #app {
        display: inline-flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
    }
</style>
