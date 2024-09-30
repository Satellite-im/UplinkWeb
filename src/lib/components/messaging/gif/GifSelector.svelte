<script lang="ts">
    import { onMount } from "svelte"
    import { GiphyFetch } from "@giphy/js-fetch-api"
    import { GIPHY_API_KEY } from "$lib/keys"
    import { writable, derived } from "svelte/store"
    import { createEventDispatcher } from "svelte"
    import { Icon, Input, Loader, RangeSelector, Spacer } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { _ } from "svelte-i18n"
    import Label from "$lib/elements/Label.svelte"
    import Button from "$lib/elements/Button.svelte"
    import { createPersistentState } from "$lib/state"
    import type { GiphyGif } from "$lib/types"
    import { log } from "$lib/utils/Logger"

    const gf = new GiphyFetch(GIPHY_API_KEY)
    const searchQuery = writable("")
    const gifs = writable<GiphyGif[]>([])
    const offset = writable(0)
    const limit = 20
    const loading = writable(false)
    const favorites = createPersistentState<GiphyGif[]>("uplink.favorite-gifs", [])

    type Tab = "search" | "favorites"
    const activeTab = writable<Tab>("search")

    const dispatch = createEventDispatcher()

    const generateUniqueKey = (id: string, index: number) => `${id}-${index}`

    const fetchTrendingGifs = async (offsetValue: number) => {
        loading.set(true)
        const { data } = await gf.trending({ limit, offset: offsetValue })
        gifs.update(gifs =>
            gifs.concat(
                data.map((gif: any, index: number) => ({
                    id: gif.id,
                    uniqueKey: generateUniqueKey(gif.id, offsetValue + index),
                    images: {
                        fixed_height_small: {
                            url: gif.images.fixed_height_small.url,
                        },
                        original: {
                            url: gif.images.original.url,
                        },
                    },
                    title: gif.title,
                }))
            )
        )
        loading.set(false)
    }

    const fetchSearchGifs = async (query: string, offsetValue: number) => {
        loading.set(true)
        try {
            const { data } = await gf.search(query, { limit, offset: offsetValue })
            gifs.update(gifs =>
                gifs.concat(
                    data.map((gif: any, index: number) => ({
                        id: gif.id,
                        uniqueKey: generateUniqueKey(gif.id, offsetValue + index),
                        images: {
                            fixed_height_small: {
                                url: gif.images.fixed_height_small.url,
                            },
                            original: {
                                url: gif.images.original.url,
                            },
                        },
                        title: gif.title,
                    }))
                )
            )
        } catch (error) {
            log.error(`"GIF fetch failed:" ${error}`)
        } finally {
            loading.set(false)
        }
    }

    $: if ($searchQuery) {
        gifs.set([])
        offset.set(0)
        fetchSearchGifs($searchQuery, 0)
    } else {
        gifs.set([])
        offset.set(0)
        fetchTrendingGifs(0)
    }

    function selectGif(gif: GiphyGif) {
        dispatch("gif", gif)
    }

    function toggleFavorite(gif: GiphyGif) {
        favorites.update(currentFavorites => {
            const index = currentFavorites.findIndex(fav => fav.id === gif.id)
            if (index === -1) {
                return [...currentFavorites, gif]
            } else {
                return currentFavorites.filter(fav => fav.id !== gif.id)
            }
        })
    }

    const isFavorite = derived(favorites, $favorites => (gif: GiphyGif) => $favorites.some(fav => fav.id === gif.id))

    function loadMoreGifs() {
        const currentOffset = $offset + limit
        offset.set(currentOffset)
        if ($searchQuery) {
            fetchSearchGifs($searchQuery, currentOffset)
        } else {
            fetchTrendingGifs(currentOffset)
        }
    }

    let observer: IntersectionObserver
    let observerElement: HTMLDivElement | null = null

    function toggleTab() {
        if ($activeTab === "favorites") {
            activeTab.set("search")
        } else {
            activeTab.set("favorites")
        }
    }

    const gifHeight = createPersistentState("uplink.gifsize", 133.33)

    onMount(() => {
        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadMoreGifs()
                }
            })
        })

        if (observerElement) {
            observer.observe(observerElement)
        }

        return () => {
            if (observer) {
                observer.disconnect()
            }
        }
    })
</script>

<div class="giphy-selector" data-cy="giphy-selector">
    <div class="search-bar">
        <div class="header">
            <Input hook="giphy-selector-search-bar" alt placeholder={$_("generic.search_placeholder")} bind:value={$searchQuery}>
                <Icon icon={Shape.Search} />
            </Input>

            <Button hook="giphy-selector-favorites-button" icon appearance={$activeTab === "favorites" ? Appearance.Primary : Appearance.Alt} on:click={toggleTab}>
                <Icon icon={Shape.Heart} />
            </Button>
        </div>
        <Spacer less />
        <div class="tools">
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src="/assets/brand/giphy_attr.png" width="150" />
            <div class="slider-container">
                <Label hook="giphy-selector-label-size" text="Size" />
                <RangeSelector min={100} max={200} bind:value={$gifHeight} />
            </div>
        </div>
    </div>

    {#if $activeTab === "search"}
        <div class="gifs" data-cy="giphy-selector-gifs">
            {#each $gifs as gif, index (gif.id + "-" + index)}
                <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                <div data-cy="gif-container" class="gif-container">
                    <button
                        data-cy="gif-container-favorite-button"
                        class="icon-container"
                        class:show-heart-icon={$isFavorite(gif)}
                        on:click={() => toggleFavorite(gif)}
                        aria-label={$isFavorite(gif) ? "Remove from favorites" : "Add to favorites"}>
                        <Icon icon={Shape.Heart} class="heart-icon {$isFavorite(gif) ? 'favorited' : ''}" />
                    </button>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <img src={gif.images.fixed_height_small.url} alt={gif.title} class="gif" style="height: {$gifHeight}px;" on:click={() => selectGif(gif)} on:load={() => (gif.loaded = true)} tabindex="0" />
                </div>
            {/each}

            {#if $loading}
                <div class="loader-container">
                    <Loader />
                </div>
            {/if}
            <div class="observer" bind:this={observerElement}></div>
        </div>
    {:else if $activeTab === "favorites"}
        <div class="gifs" data-cy="giphy-selector-favorites">
            {#each $favorites as gif (gif.uniqueKey)}
                <div data-cy="gif-container" class="gif-container" style="height: {$gifHeight}px;">
                    <button
                        data-cy="gif-container-favorite-button"
                        class="icon-container"
                        class:show-heart-icon={$isFavorite(gif)}
                        on:click={() => toggleFavorite(gif)}
                        aria-label={$isFavorite(gif) ? "Remove from favorites" : "Add to favorites"}>
                        <Icon icon={Shape.Heart} class="heart-icon {$isFavorite(gif) ? 'favorited' : ''}" />
                    </button>
                    <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
                    <img
                        src={gif.images.fixed_height_small.url}
                        alt={gif.title}
                        class="gif"
                        style="height: {$gifHeight}px;"
                        role="button"
                        aria-pressed="false"
                        on:click={() => selectGif(gif)}
                        on:keydown={e => (e.key === "Enter" ? selectGif(gif) : null)}
                        on:load={() => (gif.loaded = true)}
                        tabindex="0" />
                </div>
            {/each}

            {#if $favorites.length === 0}
                <p data-cy="text-no-favorites-yet">No favorites yet.</p>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
    :global(.heart-icon) {
        &:hover {
            stroke: var(--primary-color);
            fill: var(--primary-color);
        }
    }

    :global(.favorited) {
        stroke: var(--primary-color);
        fill: var(--primary-color);
    }

    .icon-container {
        visibility: hidden;
        border: none;
        background: none;
        padding: 0;
    }

    .icon-container.show-heart-icon {
        visibility: visible;
    }
    .tools {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }
    .slider-container {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        gap: var(--gap-less);
        max-width: var(--min-component-width);
    }

    .giphy-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: var(--emoji-selector-height);
        width: calc(var(--min-component-width) * 2);

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

        .gifs {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: var(--gap-less);
            overflow-y: auto;
            overflow-x: hidden;
            flex-grow: 1;

            .gif-container {
                flex: 1 0 auto;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;

                &:hover .icon-container {
                    visibility: visible;
                }

                .icon-container {
                    position: absolute;
                    top: var(--gap-less);
                    left: var(--gap-less);
                    z-index: 3;

                    &:hover {
                        cursor: pointer;
                    }
                }

                .gif {
                    object-fit: fill;
                    cursor: pointer;
                    height: 133.33px;
                    width: 100%;
                    border: var(--border-width) solid var(--border-color);
                    border-radius: var(--border-radius-minimal);
                    transition: transform var(--animation-speed) ease;

                    &:hover {
                        transform: scale(1.05);
                    }
                }
            }

            .loader-container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 140px;
            }

            .observer {
                width: 100%;
                height: 1px;
            }
        }
    }
    @media only screen and (max-width: 600px) {
        .giphy-selector {
            height: 100%;
            width: fit-content;
        }
    }
</style>
