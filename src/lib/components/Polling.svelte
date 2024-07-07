<script lang="ts">
    import { onMount } from "svelte"

    export let rate: number = 5000

    function poll() {
        // add processes here.
        setTimeout(poll, rate)
    }

    onMount(() => {
        poll()
    })
</script>
