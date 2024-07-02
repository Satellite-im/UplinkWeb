<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import Label from "$lib/elements/Label.svelte"

    import defaultManifest from "./manifest.json"
    import { Icon, Input } from "$lib/elements"
    import { Shape } from "$lib/enums"
    import { _ } from "svelte-i18n"
    import { writable } from "svelte/store"
    import Spacer from "$lib/elements/Spacer.svelte"

    const stickers = defaultManifest
    const dispatch = createEventDispatcher()
    const searchQuery = writable("")

    function handleStickerClick(sticker: any) {
        dispatch("select", { sticker })
    }

    function handleKeyDown(event: KeyboardEvent, sticker: any) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            handleStickerClick(sticker)
        }
    }
</script>

<div class="sticker-selector">
    <div class="header">
        <!-- svelte-ignore missing-declaration -->
        <Input alt placeholder={$_("generic.search_placeholder")} bind:value={$searchQuery}>
            <Icon icon={Shape.Search} />
        </Input>
    </div>
    <div class="stickers">
        {#each stickers as collection}
            <Label text={`${collection.name} (${collection.author})`} />
            <div class="collection-items">
                {#each collection.assets as sticker}
                    <button class="sticker-item" on:click={() => handleStickerClick(sticker)} on:keydown={event => handleKeyDown(event, sticker)} tabindex="0" aria-label={`Select sticker ${sticker.name}`}>
                        <img src={sticker.path} alt={sticker.name} />
                        <Label class="label" text={sticker.name} />
                    </button>
                {/each}
            </div>
            <Spacer />
        {/each}
    </div>
</div>

<style lang="scss">
    .sticker-selector {
        display: inline-flex;
        flex-direction: column;
        height: var(--emoji-selector-height);
        width: calc(var(--min-component-width) * 2);
        gap: var(--gap);

        .stickers {
            display: flex;
            flex-wrap: wrap;
            gap: var(--gap-less);
            align-items: center;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;

            .collection-items {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                width: calc(var(--min-component-width) * 2);
            }
        }

        .search-bar {
            position: sticky;
            top: 0;
            background: var(--background-color);
            z-index: 1;
            width: 100%;

            .header {
                display: inline-flex;
                flex-direction: row;
                width: 100%;
                gap: var(--gap);
            }
        }
    }

    .sticker-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transition: transform 0.3s;
        background: none;
        border: none;
        padding: var(--padding-less);

        &:hover,
        &:focus {
            transform: scale(1.1);
            outline: none;
            filter: brightness(1.2);
        }
        &:focus::after {
            content: "";
            position: absolute;
            top: var(--gap);
            left: var(--gap);
            transform: translateX(-50%);
            width: 0.5rem;
            height: 0.5rem;
            background-color: var(--primary-color-alt);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--primary-color-alt);
        }

        img {
            width: var(--sticker-width);
            height: auto;
            border-radius: 5px;
        }

        .label {
            margin-top: 5px;
            text-align: center;
            color: var(--primary-color);
            font-size: 14px;
        }
    }
</style>
