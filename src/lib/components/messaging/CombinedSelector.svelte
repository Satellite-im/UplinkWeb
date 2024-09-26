<script lang="ts">
    import { Shape } from "$lib/enums"
    import type { SimpleRoute } from "$lib/types"
    import { createEventDispatcher } from "svelte"
    import PillTabs from "../ui/PillTabs.svelte"
    import EmojiSelector from "./emoji/EmojiSelector.svelte"
    import GifSelector from "./gif/GifSelector.svelte"
    import StickerSelector from "./stickers/StickerSelector.svelte"

    let tabs: SimpleRoute[] = [
        { name: "Emojis", icon: Shape.Smile },
        { name: "GIFs", icon: Shape.Gif },
        { name: "Stickers", icon: Shape.Beaker },
        //    { name: "Effects", icon: Shape.Effects },
    ]
    export let active: SimpleRoute = { name: "Emojis", icon: Shape.Smile }

    const dispatch = createEventDispatcher()
</script>

<div id="combined-selector" data-cy="combined-selector">
    <div class="body">
        {#if active.name == tabs[0].name}
            <EmojiSelector on:emoji={e => dispatch("emoji", e.detail)} />
        {:else if active.name == tabs[1].name}
            <GifSelector on:gif={e => dispatch("gif", e.detail)} />
        {:else}
            <StickerSelector on:sticker={e => dispatch("sticker", e.detail)} />
        {/if}
    </div>
    <footer>
        <PillTabs tabs={tabs} active={active} on:click={e => (active = active)} on:nav={e => (active = e.detail.tab)} />
    </footer>
</div>

<style lang="scss">
    #combined-selector {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        width: 100%;
        flex: 1;

        .body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            flex: 1;
        }

        footer {
            display: inline-flex;
            justify-content: flex-end;
        }
    }
</style>
