<script lang="ts">
    import { Size } from "$lib/enums"
    import { ProfilePicture } from "$lib/components"

    export let remote: boolean = false
    export let image: string = ""
</script>

<div class="message-reply-container {remote ? 'remote' : ''}">
    {#if remote}
        <ProfilePicture size={Size.Smallest} image={image} />
    {/if}
    <slot></slot>
    {#if !remote}
        <ProfilePicture size={Size.Smallest} image={image} />
    {/if}
</div>

<style lang="scss">
    .message-reply-container {
        width: 100%;
        display: inline-flex;
        flex-direction: row;
        width: 100%;
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        gap: var(--gap);

        &.remote {
            justify-content: flex-end;
        }
    }
</style>
