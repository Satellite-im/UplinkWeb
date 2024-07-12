<script lang="ts">
    import { onDestroy, onMount } from "svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Shape } from "$lib/enums"
    import { writable } from "svelte/store"
    import { _ } from "svelte-i18n"
    import { checkIfBrowserIsSafari } from "../utils/CheckBrowser"

    interface BatteryStatus {
        charging: boolean
        level: number // Battery level as a fraction (e.g., 0.6 means 60%)
    }

    const batteryStatus = writable<BatteryStatus>({ charging: false, level: 0 })
    let isSafariBrowser = checkIfBrowserIsSafari()

    let updateStatus: () => void

    onMount(() => {
        async function updateBatteryInfo() {
            // @ts-ignore
            const battery = await navigator.getBattery()
            batteryStatus.set({
                charging: battery.charging,
                level: battery.level,
            })

            console.log("batteryStatus: ", batteryStatus)

            // Event listeners to update the battery status
            updateStatus = () => {
                batteryStatus.set({
                    charging: battery.charging,
                    level: battery.level,
                })
            }

            battery.addEventListener("chargingchange", updateStatus)
            battery.addEventListener("levelchange", updateStatus)
        }

        updateBatteryInfo()
    })

    onDestroy(() => {
        if (updateStatus) {
            // @ts-ignore
            navigator.getBattery().then(battery => {
                battery.removeEventListener("chargingchange", updateStatus)
                battery.removeEventListener("levelchange", updateStatus)
            })
        }
    })
</script>

{#if !isSafariBrowser}
<div class="battery-indicator">
    <div class="battery-icon">
        <div class="battery-level" class:medium={$batteryStatus.level <= 0.5 && $batteryStatus.level > 0.2} class:low={$batteryStatus.level <= 0.2} style="width: {$batteryStatus.level * 100}%;"></div>
    </div>
    {#if $batteryStatus.charging}
        <div class="charge-indicator">
            <Icon icon={Shape.LightningBolt} />
        </div>
    {/if}
    {($batteryStatus.level * 100).toFixed()}%
</div>
{:else}
    <div>
        {$_("settings.developer.browserNotSupportedError")}
    </div>
{/if}

<style lang="scss">
    .battery-indicator {
        display: inline-flex;
        align-items: center;
        flex-direction: row;
        gap: var(--gap-less);
        position: relative;

        .charge-indicator {
            position: absolute;
            left: 0.4rem;
            top: 0.15rem;
        }
        .battery-icon {
            display: inline-flex;
            align-items: center;
            justify-content: flex-start;
            min-width: calc(var(--font-size) * 2);
            height: var(--font-size);
            border: var(--border-width) solid currentColor;
            border-radius: var(--border-radius-minimal);
            position: relative;
            padding: 2px;
            &::after {
                content: "";
                position: absolute;
                top: 25%;
                right: -0.2rem;
                width: 0.1em;
                height: 50%;
                background: currentColor;
            }
        }

        .battery-level {
            height: 100%;
            background-color: green;
            transition: width 0.3s ease-in-out;
            border-radius: 2px;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            &.medium {
                background-color: orange;
            }
            &.low {
                background-color: red;
            }
        }
    }
</style>
