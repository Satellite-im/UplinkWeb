<script lang="ts">
    import SvelteMarkdown from "svelte-markdown"

    import { Appearance, Size } from "$lib/enums"
    import { Loader } from "./"
    import { TextRenderer, HtmlRenderer } from "./renderer/index"
    import LinkRenderer from "./renderer/LinkRenderer.svelte"

    export let appearance: Appearance = Appearance.Default
    export let muted: boolean = false
    export let loading: boolean = false
    export let size: Size = Size.Medium
    export let singleLine: boolean = false
    export let doubleLine: boolean = false
    export let ellipsis: boolean = false
    export let markdown: string = ""
    export let secondaryFont: boolean = false
    export let withShadow: boolean = false
    export let textWidth: number = 0
    export let noWrap: boolean = false
    export let hook: string = ""
    export let centered: boolean = false
    export let color: string = ""

    let clazz = ""
    export { clazz as class }
</script>

<p
    data-cy={hook}
    style={`${textWidth === 0 ? "" : `width: ${textWidth}px`} ${color === "" ? "" : `color: ${color}`}`}
    class="text
        {withShadow ? 'shadow' : ''}
        {noWrap ? 'no-wrap' : ''}
        {muted ? 'muted' : ''}
        {centered ? 'centered' : ''}
        {appearance}
        {size}
        {singleLine ? 'single-line' : ''}
        {doubleLine ? 'double-line' : ''}
        {secondaryFont ? 'secondary-font' : ''}
        {ellipsis ? 'ellipsis' : ''}
        {clazz}">
    {#if loading}
        <Loader text />
    {:else if markdown}
        <SvelteMarkdown source={markdown} renderers={{ text: TextRenderer, html: HtmlRenderer, link: LinkRenderer }} />
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

        &.centered {
            text-align: center;
        }

        &.ellipsis {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        &.no-wrap {
            text-wrap: nowrap;
        }

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

        &.small,
        &.smaller,
        &.smallest,
        &.large,
        &.larger {
            @each $size in small, smaller, smallest, large, larger {
                &.#{$size} {
                    font-size: var(--font-size-#{$size});
                }
            }
        }

        &.success,
        &.info,
        &.error,
        &.warning {
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
            color: var(--color-alt) !important;
        }

        &.shadow {
            text-shadow: 0 0 5px var(--background);
        }
    }
</style>
