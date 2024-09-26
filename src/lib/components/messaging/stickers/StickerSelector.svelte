<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import Label from "$lib/elements/Label.svelte"
    import defaultManifest from "$lib/cdn.json"
    import { Icon, Input } from "$lib/elements"
    import { Shape } from "$lib/enums"
    import { _ } from "svelte-i18n"
    import { writable } from "svelte/store"
    import Spacer from "$lib/elements/Spacer.svelte"
    import { tempCDN } from "$lib/utils/CommonVariables"
    import Fuse from "fuse.js"

    const stickers = writable(defaultManifest.stickers)
    const searchQuery = writable("")
    const dispatch = createEventDispatcher()

    function handleStickerClick(sticker: any) {
        dispatch("sticker", { sticker })
    }

    function handleKeyDown(event: KeyboardEvent, sticker: any) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            handleStickerClick(sticker)
        }
    }

    function filterStickers(query: string) {
        if (!query) {
            stickers.set(defaultManifest.stickers)
            return
        }

        const fuseOptions = {
            keys: ["name", "assets.name"],
            threshold: 0.3,
        }

        const filteredCollections = defaultManifest.stickers
            .map(collection => {
                const fuse = new Fuse(collection.assets, { keys: ["name"], threshold: 0.3 })
                const filteredStickers = fuse.search(query).map(result => result.item)

                if (filteredStickers.length > 0) {
                    return {
                        ...collection,
                        assets: filteredStickers,
                    }
                }

                return null
            })
            .filter(collection => collection !== null)

        stickers.set(filteredCollections)
    }

    $: if ($searchQuery) {
        filterStickers($searchQuery)
    } else {
        stickers.set(defaultManifest.stickers)
    }
</script>

<div class="sticker-selector" data-cy="sticker-selector">
    <div class="sidebar" data-cy="sticker-selector-sidebar">
        <Label hook="sticker-selector-sidebar-label" text="Packs" />

        {#each $stickers as collection}
            <a href={`#${collection.name}`} class="collection-link" aria-label={`Jump to ${collection.name}`}>
                <img data-cy="sticker-sidebar-collection" src={`${tempCDN}${collection.assets[0].path}`} alt={collection.name} />
            </a>
        {/each}
    </div>
    <div class="content">
        <div class="header">
            <!-- svelte-ignore missing-declaration -->
            <Input hook="sticker-search-input" alt placeholder={$_("generic.search_placeholder")} bind:value={$searchQuery}>
                <Icon icon={Shape.Search} />
            </Input>
        </div>
        <div class="stickers" data-cy="stickers-contents">
            {#each $stickers as collection}
                <section data-cy="sticker-collection" id={collection.name}>
                    <Label hook="sticker-collection-label" text={`${collection.name} (${collection.author})`} />
                    <div class="collection-items">
                        {#each collection.assets as sticker}
                            <button
                                data-cy="sticker-collection-item"
                                class="sticker-item"
                                on:click={() => handleStickerClick(sticker)}
                                on:keydown={event => handleKeyDown(event, sticker)}
                                tabindex="0"
                                aria-label={`Select sticker ${sticker.name}`}>
                                <img src={`${tempCDN}${sticker.path}`} alt={sticker.name} />
                                <Label hook="sticker-collection-item-name" class="label" text={sticker.name} />
                            </button>
                        {/each}
                    </div>
                    <Spacer />
                </section>
            {/each}
        </div>
    </div>
</div>

<style lang="scss">
    .sticker-selector {
        display: flex;
        height: var(--emoji-selector-height);
        width: calc(var(--min-component-width) * 2);
        max-width: var(--max-component-width);
    }

    .sidebar {
        display: flex;
        flex-direction: column;
        gap: var(--gap-less);
        overflow-y: auto;
        background: var(--background-color);
        border-right: var(--border-width) solid var(--border-color);
        align-items: center;
        padding-right: var(--gap);

        .collection-link {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: var(--gap-less);

            img {
                width: 64px;
                height: 64px;
                border-radius: 5px;
                transition:
                    transform 0.3s,
                    filter 0.3s;
            }

            &:hover img,
            &:focus img {
                transform: scale(1.1);
                filter: brightness(1.2);
            }
        }
    }

    .content {
        display: flex;
        flex-direction: column;
        flex: 1;

        .header {
            position: sticky;
            top: 0;
            background: var(--background-color);
            z-index: 1;
            padding: 0 var(--padding-less);
        }

        .stickers {
            padding: var(--padding);
            display: flex;
            flex-direction: column;
            gap: var(--gap);
            overflow-y: auto;

            section {
                margin-bottom: 1rem;

                .collection-items {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    gap: var(--gap-less);
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

                &:hover,
                &:focus {
                    transform: scale(1.1);
                    outline: none;
                    filter: brightness(1.2);
                }

                img {
                    width: var(--sticker-width);
                    height: auto;
                    border-radius: 5px;
                }
            }
        }
    }

    @media only screen and (max-width: 600px) {
        .sticker-selector {
            height: 100%;
            .sidebar {
                .collection-link {
                    img {
                        width: 32px;
                        height: 32px;
                    }
                }
            }

            .sticker-item {
                img {
                    width: calc(var(--sticker-width) / 1.5) !important;
                }
            }
        }
    }
</style>
