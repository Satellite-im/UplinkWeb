<script lang="ts">
    import { goto } from "$app/navigation"

    export let name: string = ""
    export let image: string = ""
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="community-icon" on:click={_ => goto("/community/chat")}>
    <img src={image} alt={name} />
</div>

<style lang="scss">
    .community-icon {
        width: var(--profile-picture-size);
        height: var(--profile-picture-size);

        img {
            width: var(--profile-picture-size);
            height: var(--profile-picture-size);
            border-radius: 50%;
            border: var(--border-width) solid var(--border-color);
        }

        &:hover {
            cursor: pointer;
        }
    }
</style>
