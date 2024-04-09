<script lang="ts">
    import { Icon } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import { animationDuration } from "$lib/globals/animations"
    import { afterUpdate } from 'svelte'
    import { onMount } from "svelte"
    import { fade } from "svelte/transition"

    let element: Element
    let height: number

    let showScrollToBottom: boolean = false;

    const scrollToBottom = async (node: Element) => {
        node.scroll({ top: node.scrollHeight, behavior: 'smooth' })
    }

    onMount(() => {
        scrollToBottom(element)
    })

    afterUpdate(() => {
        if (!showScrollToBottom) scrollToBottom(element)
    })
</script>

<div class="conversation" bind:this={element}>
    <div bind:clientHeight={height} class="scroll" on:scroll={(e) => {
        // @ts-expect-error: This value does indeed exist at runtime.
        if (e.target?.scrollHeight - e.target?.scrollTop > (height * 3)) {
            showScrollToBottom = true
        } else {
            showScrollToBottom = false
        }
    }}>
        <div class="spacer"></div>
        <slot></slot>
    </div>
    {#if showScrollToBottom}
        <div class="scroll-to-bottom" transition:fade={{duration: animationDuration}}>
            <Button icon appearance={Appearance.Primary} on:click={(_) => {
                scrollToBottom(element)
            }}>
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