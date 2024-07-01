<script lang="ts">
    import { Shape } from "$lib/enums"
    import type { SimpleRoute } from "$lib/types"
    import PillTabs from "../ui/PillTabs.svelte"
    import EmojiSelector from "./emoji/EmojiSelector.svelte"
    import GifSelector from "./gif/GifSelector.svelte"

    let tabs: SimpleRoute[] = [
        { name: "Emoji", icon: Shape.Smile },
        { name: "GIFs", icon: Shape.Gif },
        { name: "Sticker", icon: Shape.Beaker },
    ]
    export let active: SimpleRoute = tabs[0]
</script>

<div id="combined-selector">
    <div class="body">
        {#if active === tabs[0]}
            <EmojiSelector />
        {:else if active === tabs[1]}
            <GifSelector />
        {:else}
            <div>Stickers</div>
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
