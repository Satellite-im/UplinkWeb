<script lang="ts">
    import ProfilePicture from "./ProfilePicture.svelte";

    export let remote: boolean = false;
    export let image: string = "";
</script>

<div class="message-reply-container {remote ? "remote" : ""}">
    {#if remote}
        <ProfilePicture smallest image={image} />
    {/if}
    <slot></slot>
    {#if !remote}
        <ProfilePicture smallest image={image} />
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