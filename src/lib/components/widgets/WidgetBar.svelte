<script lang="ts">
    import Label from "$lib/elements/Label.svelte"
    import BatteryIndicator from "./BatteryIndicator.svelte"
    import CpuUsage from "./CPU.svelte"
    import RamUsage from "./RamUsage.svelte"
</script>

<div id="widget-bar" data-cy="widget-bar">
    <div class="item">
        <Label hook="label-widget-bar-battery" text="Battery" />
        <BatteryIndicator />
    </div>
    <div class="item">
        <Label hook="label-widget-bar-ram" text="Ram" />
        <RamUsage />
    </div>
    <div class="item">
        <Label hook="label-widget-bar-cpu" text="CPU" />
        <CpuUsage />
    </div>
</div>

<style lang="scss">
    #widget-bar {
        display: inline-flex;
        gap: var(--gap);
        border: var(--border-width) solid var(--border-color);
        padding: var(--padding-less);
        background-color: var(--opaque-color);
        border-radius: var(--border-radius);

        .item {
            display: inline-flex;
            flex-direction: column;
        }
    }
</style>
