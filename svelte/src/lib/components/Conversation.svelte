<script lang="ts">
    import { onMount } from "svelte";

    let element: Element;
    const scrollToBottom = async (node: Element) => {
        node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
    }; 

    onMount(() => {
        scrollToBottom(element);
    });

    $: if(element) {
		scrollToBottom(element);
	}
</script>

<div class="conversation" bind:this={element}>
    <div class="scroll">
        <div class="spacer"></div>
        <slot></slot>
    </div>
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
        

        .scroll {
            display: flex;
            align-items: flex-end;
            flex-direction: column;
            width: 100%;
            mask-image: linear-gradient(to top, var(--background) calc(100% - (var(--sidebar-width) / 6)), transparent 100%);
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