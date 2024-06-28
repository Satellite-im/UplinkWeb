<script lang="ts">
    import { onMount } from "svelte"
    import { GiphyFetch } from "@giphy/js-fetch-api"
    import { GIPHY_API_KEY } from "$lib/keys"
    import { writable, derived } from "svelte/store"
    import { createEventDispatcher } from "svelte"
    import { Icon, Input, Loader } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { _ } from "svelte-i18n"
    import Label from "$lib/elements/Label.svelte"
    import Button from "$lib/elements/Button.svelte"
    import { createPersistentState } from "$lib/state"

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

    type GiphyImage = {
        url: string
    }

    type GiphyGif = {
        id: string
        uniqueKey: string
        images: {
            fixed_height_small: GiphyImage
        }
        title: string
    }

    const fetchTrendingGifs = async (offsetValue: number) => {
        loading.set(true)
        const { data } = await gf.trending({ limit, offset: offsetValue })
        gifs.update(gifs =>
            gifs.concat(
                data.map((gif: any, index: number) => ({
                    id: gif.id,
                    uniqueKey: `${gif.id}-${offsetValue + index}`,
                    images: {
                        fixed_height_small: {
                            url: gif.images.fixed_height_small.url,
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
        const { data } = await gf.search(query, { limit, offset: offsetValue })
        gifs.update(gifs =>
            gifs.concat(
                data.map((gif: any, index: number) => ({
                    id: gif.id,
                    uniqueKey: `${gif.id}-${offsetValue + index}`,
                    images: {
                        fixed_height_small: {
                            url: gif.images.fixed_height_small.url,
                        },
                    },
                    title: gif.title,
                }))
            )
        )
        loading.set(false)
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

<div class="giphy-selector">
    {#if $activeTab === "search"}
        <div class="search-bar">
            <div class="header">
                <Input alt placeholder={$_("generic.search_placeholder")} bind:value={$searchQuery}>
                    <Icon icon={Shape.Search} />
                </Input>

                <Button icon appearance={$activeTab === "favorites" ? Appearance.Primary : Appearance.Alt} on:click={toggleTab}>
                    <Icon icon={Shape.Heart} />
                </Button>
            </div>
            <Label text="Powered by Giphy" />
        </div>
        <div class="gifs">
            {#each $gifs as gif (gif.uniqueKey)}
                <div class="gif-container">
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="icon-container" on:click={() => toggleFavorite(gif)}>
                        <Icon icon={Shape.Heart} class="heart-icon {$isFavorite(gif) ? 'favorited' : ''}" />
                    </div>
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <img src={gif.images.fixed_height_small.url} alt={gif.title} class="gif" on:click={() => selectGif(gif)} />
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
        <div class="gifs">
            <div class="search-bar">
                <div class="header">
                    <Input alt placeholder={$_("generic.search_placeholder")} bind:value={$searchQuery}>
                        <Icon icon={Shape.Search} />
                    </Input>

                    <Button icon appearance={$activeTab === "favorites" ? Appearance.Primary : Appearance.Alt} on:click={toggleTab}>
                        <Icon icon={Shape.Heart} />
                    </Button>
                </div>
                <Label text="Powered by Giphy" />
            </div>
            {#each $favorites as gif (gif.uniqueKey)}
                <div class="gif-container">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="icon-container" on:click={() => toggleFavorite(gif)}>
                        <Icon icon={Shape.Heart} class="heart-icon {$isFavorite(gif) ? 'favorited' : ''}" />
                    </div>
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <img src={gif.images.fixed_height_small.url} alt={gif.title} class="gif" on:click={() => selectGif(gif)} />
                </div>
            {/each}
            {#if $favorites.length === 0}
                <p>No favorites yet.</p>
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

    .giphy-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: var(--emoji-selector-height);
        width: calc(var(--min-component-width) * 2);

        .tabs {
            display: flex;
            justify-content: center;
            gap: 1rem;

            button {
                padding: 0.5rem 1rem;
                background: var(--background-color);
                border: 1px solid var(--border-color);
                cursor: pointer;
                transition: background-color 0.3s;

                &.active {
                    background: var(--primary-color);
                    color: var(--white);
                }

                &:hover {
                    background: var(--primary-color-light);
                }
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
                    object-fit: cover;
                    cursor: pointer;
                    height: 100px;
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
                height: 100px;
            }

            .observer {
                width: 100%;
                height: 1px;
            }
        }
    }
</style>
