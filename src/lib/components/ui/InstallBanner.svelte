<script lang="ts">
    import { DOWNLOAD_LINKS } from "$lib/config"
    import { Icon } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import Controls from "$lib/layouts/Controls.svelte"

    enum Platform {
        Windows = "Windows",
        MacOS = "MacOS",
        Android = "Android",
        iOS = "iOS",
        Linux = "Linux",
        Other = "Other",
    }

    function detectPlatform(): Platform {
        const userAgent = navigator.userAgent.toLowerCase()

        if (userAgent.includes("windows")) return Platform.Windows
        if (userAgent.includes("mac")) return Platform.MacOS
        if (userAgent.includes("android")) return Platform.Android
        if (/iphone|ipad|ipod/.test(userAgent)) return Platform.iOS
        if (userAgent.includes("linux")) return Platform.Linux
        return Platform.Other
    }

    function isElectron(): boolean {
        return typeof window !== "undefined" && window.process?.versions?.electron !== undefined
    }

    function isTauri(): boolean {
        return typeof window !== "undefined" && "__TAURI__" in window
    }

    function isCapacitor(): boolean {
        return typeof window !== "undefined" && "Capacitor" in window
    }

    function isBannerClosed(): boolean {
        return localStorage.getItem("install-banner-dismissed") === "true"
    }

    let showBanner = !(isElectron() || isTauri() || isCapacitor() || isBannerClosed())
    let platform = detectPlatform()

    function closeBanner() {
        showBanner = false
        localStorage.setItem("install-banner-dismissed", "true")
    }

    const platformButtonProps = {
        [Platform.Windows]: {
            text: "Windows",
            icon: Shape.MicrosoftWindows,
            download: DOWNLOAD_LINKS.Windows,
        },
        [Platform.MacOS]: {
            text: "MacOS",
            icon: Shape.AppleAppStore,
            download: DOWNLOAD_LINKS.Mac,
        },
        [Platform.Android]: {
            text: "Android",
            icon: Shape.Android,
            download: DOWNLOAD_LINKS.Android,
        },
        [Platform.iOS]: {
            text: "iPhone",
            icon: Shape.Apple,
            download: DOWNLOAD_LINKS.iOS,
        },
        [Platform.Linux]: {
            text: "Linux",
            icon: Shape.Code,
            download: DOWNLOAD_LINKS.Linux,
        },
        [Platform.Other]: {
            text: "Download",
            icon: Shape.Download,
            download: DOWNLOAD_LINKS.Linux,
        },
    }
</script>

{#if showBanner}
    <div id="install-banner" class="pulse-success">
        <div class="pre">
            <Button appearance={Appearance.Alt} icon on:click={closeBanner}>
                <Icon icon={Shape.XMark} />
            </Button>
            <div class="content">
                <Label text="Install Uplink" />
                <p>Install our app for a better experience</p>
            </div>
        </div>
        <Controls>
            <Button
                appearance={Appearance.Success}
                outline
                text={platformButtonProps[platform].text}
                on:click={() => {
                    window.open(platformButtonProps[platform].download)
                }}>
                <Icon icon={platformButtonProps[platform].icon} highlight={Appearance.Success} />
            </Button>
        </Controls>
    </div>
{/if}

<style lang="scss">
    #install-banner {
        width: 100%;
        background: var(--background-alt);
        padding: var(--padding-less);
        display: flex;
        gap: var(--gap);
        justify-content: space-between;
        align-items: center;

        .pre {
            display: flex;
            gap: var(--gap);
            align-items: center;
        }
    }
</style>
