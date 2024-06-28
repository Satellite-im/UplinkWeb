<script lang="ts">
    import { GiphyFetch } from "@giphy/js-fetch-api"
    import { GIPHY_API_KEY } from "$lib/keys"
    import { writable } from "svelte/store"
    import { createEventDispatcher } from "svelte"

    const gf = new GiphyFetch(GIPHY_API_KEY)
    const searchQuery = writable("")
    const gifs = writable<GiphyGif[]>([])

    const dispatch = createEventDispatcher()

    type GiphyImage = {
        url: string
    }

    type GiphyGif = {
        id: string
        images: {
            fixed_height_small: GiphyImage
        }
        title: string
    }

    const fetchGifs = async (query: string) => {
        const { data } = await gf.search(query, { limit: 10 })
        gifs.set(
            data.map((gif: any) => ({
                id: gif.id,
                images: {
                    fixed_height_small: {
                        url: gif.images.fixed_height_small.url,
                    },
                },
                title: gif.title,
            }))
        )
    }

    $: if ($searchQuery) fetchGifs($searchQuery)

    function selectGif(gif: GiphyGif) {
        dispatch("gif", gif)
    }
</script>

<div class="giphy-selector">
    <div class="search-bar">
        <input type="text" placeholder="Search for GIFs" bind:value={$searchQuery} />
        <button on:click={() => fetchGifs($searchQuery)}>Search</button>
    </div>
    <div class="gifs">
        {#each $gifs as gif (gif.id)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <img src={gif.images.fixed_height_small.url} alt={gif.title} class="gif" on:click={() => selectGif(gif)} />
        {/each}
    </div>
</div>

<style>
    .giphy-selector {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .search-bar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .gifs {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 0.5rem;
    }

    .gif {
        cursor: pointer;
        transition: transform 0.2s;
    }

    .gif:hover {
        transform: scale(1.1);
    }
</style>
