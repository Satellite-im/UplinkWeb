<script lang="ts">
    import { onMount } from "svelte"
    import Sandbox from "./Sandbox.svelte"

    export let markupUrl: string = ""
    export let scriptUrl: string = ""
    export let styleUrl: string = ""
    export let dimensions: { width: number; height: number } = { width: 100, height: 100 }

    let markup = ""
    let script = ""
    let style = ""

    const fetchContent = async (url: string): Promise<string> => {
        const response = await fetch(url)
        return response.ok ? response.text() : ""
    }

    onMount(async () => {
        if (markupUrl) markup = await fetchContent(markupUrl)
        if (scriptUrl) script = await fetchContent(scriptUrl)
        if (styleUrl) style = await fetchContent(styleUrl)
    })
</script>

<div class="inline-mod-loader">
    <Sandbox markup={markup} script={script} style={style} dimensions={dimensions} />
</div>

<style lang="scss">
    .inline-mod-loader {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        width: 100%;
        flex: 1;
    }
</style>
