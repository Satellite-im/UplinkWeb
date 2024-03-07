<script lang="ts">
    import Loader from "$lib/elements/Loader.svelte";

    export let number: number = 0;
    export let word: string = "UNKNOWN";
    export let loading: boolean = false;
</script>

<div class="ordered-phrase">
    <span class="number">
        {#if loading}
            <Loader alt />
        {:else}
            {number}
        {/if}
    </span>
    <span class="word">
        {#if loading}
            <Loader text alt />
        {:else}
            {word}
        {/if}
    </span>
</div>

<style lang="scss">
    .ordered-phrase {
        display: inline-flex;
        flex: 40%;
        background-color: var(--alt-color);
        border-radius: var(--border-radius-minimal);
        overflow: hidden;
        align-items: center;
        justify-content: center;
        position: relative;
        padding-left: 1.5rem;
        border: var(--border-width) solid var(--primary-color);

        .number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: var(--primary-color);
            color: var(--color-alt);
            font-size: var(--font-size-smaller);
            padding: 0 var(--padding-less);
            width: 1.5rem;
            height: 100%;
            align-self: flex-start;
            position: absolute;
            top: 0;
            left: 0;
        }

        .word {
            display: inline-block;
            flex: 1;
            padding: var(--padding-minimal) var(--padding);
        }
    }
</style>