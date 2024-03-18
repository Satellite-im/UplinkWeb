<script lang="ts">
    import { Appearance, Size } from "$lib/enums"
    import { Loader } from "./"

    export let appearance: Appearance   = Appearance.Default
    export let muted: boolean           = false
    export let loading: boolean         = false
    export let size: Size               = Size.Medium
    export let singleLine: boolean      = false
    export let doubleLine: boolean      = false

    let clazz = ""
	export { clazz as class }
</script>

<p class="text {muted ? "muted" : ""} {appearance} {size} {singleLine ? "single-line" : ""} {doubleLine ? "double-line" : ""} {clazz}">
    {#if loading}
        <Loader text />
    {:else}
        <slot></slot>
    {/if}
</p>

<style lang="scss">
    .text {
        margin: 0;
        padding: 0;
        color: var(--color);
        font-size: var(--font-size);
        text-align: left;
        max-width: fit-content;
        min-width: calc(var(--font-size) * 2);


        &.single-line {
            display: -webkit-box;
            -webkit-line-clamp: 1;
                    line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: var(--font-size-smaller);
            flex: 1;
        }

        &.double-line {
            display: -webkit-box;
            -webkit-line-clamp: 2;
                    line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            flex: 1;
        }

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

        &.alt {
            color: var(--color-alt);
        }
    }
</style>