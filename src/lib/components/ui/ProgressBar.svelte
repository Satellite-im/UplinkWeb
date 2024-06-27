<script lang="ts">
    import { Label } from "$lib/elements"
    import { Appearance } from "$lib/enums"

    export let percent: number = 0
    export let appearance: Appearance = Appearance.Default
    export let label: string = ""
</script>

<div class="progress-bar {appearance}">
    <div class="track">
        <div class="bar" style="width: {percent}%"></div>
    </div>
    {#if label.length}
        <Label text={label} />
    {/if}
</div>

<style lang="scss">
    .progress-bar {
        display: inline-flex;
        flex-direction: column;
        width: 100%;
        height: fit-content;
        border-radius: calc(var(--progress-bar-height) / 2);
        color: var(--color-muted);

        .track {
            height: var(--progress-bar-height);
            width: 100%;
            border: var(--border-width) solid var(--border-color);
            background-color: var(--alt-color);
            border-radius: calc(var(--progress-bar-height) / 2);

            .bar {
                height: 100%;
                background-color: var(--primary-color);
                border-radius: calc(var(--progress-bar-height) / 2);
            }
        }

        &.alt .track .bar {
            background-color: var(--alt-color);
        }

        &.info .track .bar {
            background-color: var(--info-color);
        }

        &.warning .track .bar {
            background-color: var(--warning-color);
        }

        &.error .track .bar {
            background-color: var(--error-color);
        }

        &.success .track .bar {
            background-color: var(--success-color);
        }
    }
</style>
