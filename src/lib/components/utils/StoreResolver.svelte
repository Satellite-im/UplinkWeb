<script lang="ts">
    // A Helper component that turns a value into a readable with auto subscription
    import { type Readable } from "svelte/store"

    type T = $$Generic
    type V = $$Generic
    export let value: T
    export let resolver: (t: T) => Readable<V>
    $: resolved = resolver(value)
</script>

<slot resolved={$resolved} />
