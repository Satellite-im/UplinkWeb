<script lang="ts">
    import { GiphyFetch } from "@giphy/js-fetch-api"
    import { GIPHY_API_KEY } from "$lib/keys"

    const gf = new GiphyFetch(GIPHY_API_KEY)

    const fetch = async () => {
        const { data: gifs } = await gf.trending({ limit: 10 })
        console.log("gifs", gifs)
    }

    fetch()
</script>
