<script lang="ts">
    import { DEFAULT_CDN } from "$lib/config"
    import { onMount } from "svelte"

    let manifest: any = ""

    async function getManifest() {
        const manifestUrl = `${DEFAULT_CDN.address}/stickers/manifest.json`

        try {
            const response = await fetch(manifestUrl)
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`)
            }

            const json = await response.json()
            manifest = json
        } catch (error) {
            console.error(error.message)
        }
    }

    onMount(() => {
        getManifest()
    })
</script>

<style lang="scss">
</style>
