<script lang="ts">
    import { Size } from "$lib/enums"
    import { ProfilePicture } from "$lib/components"

    export let remote: boolean = false
    export let image: string = ""
    export let first: boolean = false
</script>

<div class="message-reply-container {remote ? 'remote' : ''} {first ? 'first' : ''}">
    {#if !remote}
        <ProfilePicture size={Size.Smallest} image={image} />
    {/if}
    <slot></slot>
    {#if remote}
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
        justify-content: flex-end;

        &.first {
            margin-right: var(--profile-picture-size);
            margin-bottom: var(--gap-less);
            position: relative;
            position: relative;
            &.remote {
                margin-right: calc(-1 * var(--profile-picture-size));
            }
            &::before {
                content: "";
                position: absolute;
                width: calc(0.5 * var(--profile-picture-size));
                height: 50%;
                border-style: solid;
                border-color: var(--alt-color-alt);
                border-width: var(--border-width-more) var(--border-width-more) 0 0;
                border-radius: 0 var(--border-radius) 0 0;
                top: 50%;
                right: calc(-0.5 * var(--profile-picture-size) - var(--gap-less));
            }
        }

        &.remote {
            padding-right: 0px;
            justify-content: flex-start;
            &::before {
                border-width: var(--border-width-more) 0 0 var(--border-width-more);
                border-radius: var(--border-radius) 0 0 0;
                left: calc(-0.5 * var(--profile-picture-size) - var(--gap-less));
            }
        }
    }
</style>
