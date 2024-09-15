<script lang="ts">
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
        const userAgent = window.navigator.userAgent.toLowerCase()

        if (userAgent.includes("windows")) {
            return Platform.Windows
        } else if (userAgent.includes("mac")) {
            return Platform.MacOS
        } else if (userAgent.includes("android")) {
            return Platform.Android
        } else if (/iphone|ipad|ipod/.test(userAgent)) {
            return Platform.iOS
        } else if (userAgent.includes("linux")) {
            return Platform.Linux
        } else {
            return Platform.Other
        }
    }

    function isElectron(): boolean {
        return typeof window !== "undefined" && typeof window.process === "object" && window.process.versions?.electron !== undefined
    }

    function isTauri(): boolean {
        return typeof window !== "undefined" && (window as any).__TAURI__ !== undefined
    }

    function isBannerClosed(): boolean {
        return localStorage.getItem("bannerClosed") === "true"
    }

    let showBanner: boolean = !(isElectron() || isTauri() || isBannerClosed())

    let platform: Platform = detectPlatform()

    function closeBanner() {
        showBanner = false
        localStorage.setItem("bannerClosed", "true")
    }
</script>

{#if showBanner}
    <div id="install-banner">
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
            {#if platform === Platform.Windows}
                <Button appearance={Appearance.Alt} text="Download for Windows">
                    <Icon icon={Shape.MicrosoftWindows} />
                </Button>
            {:else if platform === Platform.MacOS}
                <Button appearance={Appearance.Alt} text="Download for MacOS">
                    <Icon icon={Shape.AppleAppStore} />
                </Button>
            {:else if platform === Platform.Android}
                <Button appearance={Appearance.Alt} text="Download for Android">
                    <Icon icon={Shape.Android} />
                </Button>
            {:else if platform === Platform.iOS}
                <Button appearance={Appearance.Alt} text="Download for iPhone">
                    <Icon icon={Shape.Apple} />
                </Button>
            {:else if platform === Platform.Linux}
                <Button appearance={Appearance.Alt} text="Download for Linux">
                    <Icon icon={Shape.Code} />
                </Button>
            {:else}
                <Button appearance={Appearance.Alt} text="Download for Other">
                    <Icon icon={Shape.Download} />
                </Button>
            {/if}
        </Controls>
    </div>
{/if}

<style lang="scss">
    #install-banner {
        width: 100%;
        background: var(--primary-color);
        height: fit-content;
        padding: var(--padding-less);
        display: inline-flex;
        gap: var(--gap);
        justify-content: space-between;

        .pre {
            display: inline-flex;
            gap: var(--gap);
            align-items: center;
        }
    }
</style>
