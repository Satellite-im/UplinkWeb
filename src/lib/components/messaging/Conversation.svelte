<script lang="ts">
    import { afterUpdate, onMount } from "svelte"
    import Button from "src/lib/elements/Button.svelte"
    import { Icon } from "src/lib/elements"
    import { Appearance, Shape } from "src/lib/enums"
    import { fade } from "svelte/transition"
    import { SettingsStore } from "src/lib/state"
    import { get } from "svelte/store"

    let scrollContainer: Element

    let showScrollToBottom: boolean = false

    const scrollToBottom = (node: Element) => {
        node.scrollTop = node.scrollHeight
    }

    const handleScroll = () => {
        const isScrolledUp = scrollContainer.scrollHeight - scrollContainer.scrollTop > scrollContainer.clientHeight * 1.5
        showScrollToBottom = isScrolledUp
    }

    const compact: boolean = get(SettingsStore.state).messaging.compact

    afterUpdate(() => {
        if (!showScrollToBottom) scrollToBottom(scrollContainer)
    })

    onMount(() => {
        setTimeout(() => {
            scrollToBottom(scrollContainer)
        }, 250)
    })
</script>

<div class={`conversation ${compact ? "compact" : ""}`}>
    <div bind:this={scrollContainer} class="scroll" on:scroll={handleScroll}>
        <div class="spacer"></div>
        <slot></slot>
    </div>
    {#if showScrollToBottom}
        <div class="scroll-to-bottom" transition:fade={{ duration: 300 }}>
            <Button icon appearance={Appearance.Primary} on:click={() => scrollToBottom(scrollContainer)}>
                <Icon icon={Shape.ArrowDown} />
            </Button>
        </div>
    {/if}
</div>

<style lang="scss">
    .conversation {
        min-width: var(--minimum-width);
        flex: 1;
        display: inline-flex;
        justify-content: flex-end;
        align-items: flex-end;
        overflow: hidden;
        padding: var(--padding-less);
        position: relative;
        gap: var(--gap);

        &.compact {
            gap: var(--gap-less);
        }

        .scroll-to-bottom {
            display: inline-flex;
            position: absolute;
            width: 100%;
            align-items: center;
            justify-content: center;
        }

        .scroll {
            display: flex;
            align-items: flex-end;
            flex-direction: column;
            width: 100%;
            mask-image: linear-gradient(to top, var(--background) calc(100% - 1rem), transparent 100%);
            padding-top: 2rem;
            height: 100%;
            overflow-y: scroll;
            overflow-x: hidden;
            padding-right: var(--padding-less);

            & .spacer {
                flex: 1;
            }
        }
    }
</style>
