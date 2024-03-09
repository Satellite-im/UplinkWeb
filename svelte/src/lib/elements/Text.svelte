<script lang="ts">
    import { Appearance, Size } from "$lib/enums";
    import Loader from "./Loader.svelte";

    export let appearance: Appearance = Appearance.Default;
    export let muted: boolean = false;
    export let loading: boolean = false;
    export let size: Size = Size.Medium;

    let clazz = "";
	export { clazz as class };
</script>

<p class="text {muted ? "muted" : ""} {appearance} {size} {clazz}">
    {#if loading}
        <Loader text />
    {:else}
        <slot></slot>
    {/if}
</p>

<style lang="scss">
    .text {
        margin: 0;
        flex: auto;
        padding: 0;
        color: var(--color);
        font-size: var(--font-size);
        text-align: left;
        max-width: fit-content;
        min-width: calc(var(--font-size) * 2);

        &.small, &.smaller, &.smallest, &.large, &.larger {
            @each $size in small, smaller, smallest, large, larger {
                &.#{$size} {
                    font-size: var(--font-size-#{$size});
                }
            }
        }
    
        &.success, &.info, &.error, &.warning {
            @each $type in success, info, error, warning {
                &.#{$type} {
                    color: var(--#{$type}-color);
                }
            }
        }

        &.muted {
            color: var(--color-muted);
        }
    }
</style>