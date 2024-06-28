<script lang="ts">
    import { onMount } from "svelte"
    import { GiphyFetch } from "@giphy/js-fetch-api"
    import { GIPHY_API_KEY } from "$lib/keys"
    import { writable } from "svelte/store"
    import { createEventDispatcher } from "svelte"
    import { Icon, Input } from "$lib/elements"
    import { Shape } from "$lib/enums"
    import { _ } from "svelte-i18n"
    import Label from "$lib/elements/Label.svelte"

    const gf = new GiphyFetch(GIPHY_API_KEY)
    const searchQuery = writable("")
    const gifs = writable<GiphyGif[]>([])
    const offset = writable(0)
    const limit = 20

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

    const fetchGifs = async (query: string, offsetValue: number) => {
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
    }

    $: if ($searchQuery) {
        gifs.set([])
        offset.set(0)
        fetchGifs($searchQuery, 0)
    }

    function selectGif(gif: GiphyGif) {
        dispatch("gif", gif)
    }

    function loadMoreGifs() {
        const currentOffset = $offset + limit
        offset.set(currentOffset)
        fetchGifs($searchQuery, currentOffset)
    }

    let observer: IntersectionObserver
    let observerElement: HTMLDivElement | null = null

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
    <div class="search-bar">
        <Input alt placeholder={$_("generic.search_placeholder")} bind:value={$searchQuery}>
            <Icon icon={Shape.Search} />
        </Input>
        <Label text="Powered by Giphy" />
    </div>
    <div class="gifs">
        {#each $gifs as gif (gif.uniqueKey)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <img src={gif.images.fixed_height_small.url} alt={gif.title} class="gif" on:click={() => selectGif(gif)} />
        {/each}
        <div class="observer" bind:this={observerElement}></div>
    </div>
</div>

<style lang="scss">
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
            padding: var(--padding-less);
        }

        .gifs {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: var(--gap-less);
            overflow-y: auto;
            overflow-x: hidden;
            flex-grow: 1;

            .gif {
                flex: 1 0 auto;
                object-fit: cover;
                cursor: pointer;
                margin: 0;
                height: 100px;
                border: var(--border-width) solid var(--border-color);
                border-radius: var(--border-radius-minimal);
                transition: transform var(--animation-speed) ease;

                &:hover {
                    transform: scale(1.05);
                }

                &:not(:first-child) {
                    margin-left: 0;
                }
            }

            .observer {
                width: 100%;
                height: 1px;
            }
        }
    }
</style>
