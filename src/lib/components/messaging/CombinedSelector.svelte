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
    ]
    export let active: SimpleRoute = { name: "Emojis", icon: Shape.Smile }

    const dispatch = createEventDispatcher()
</script>

<div id="combined-selector">
    <div class="body">
        {#if active.name == tabs[0].name}
            <EmojiSelector on:emoji={e => dispatch("emoji", e.detail)} />
        {:else if active.name == tabs[1].name}
            <GifSelector on:gif={e => dispatch("gif", e.detail)} />
        {:else}
            <StickerSelector />
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

        footer {
            display: inline-flex;
            justify-content: flex-end;
        }
    }
</style>
