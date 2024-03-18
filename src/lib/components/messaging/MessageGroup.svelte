<script lang="ts">
    import { Size } from "$lib/enums"
    import type { ProfilePictureRequirements } from "$lib/types"
    import { ProfilePicture } from "$lib/components";

    export let remote: boolean          = false
    export let subtext: string | null   = ""

    export let profilePictureRequirements: ProfilePictureRequirements | null = null
</script>

<div class="message-group">
    {#if profilePictureRequirements && remote}
        <div class="aside">
            <ProfilePicture
                size={Size.Small}
                image={profilePictureRequirements.image}
                status={profilePictureRequirements.status}
                highlight={profilePictureRequirements.highlight}
                notifications={profilePictureRequirements.notifications} />
        </div>
    {/if}
    <div class="flex">
        <slot></slot>
    </div>
    {#if profilePictureRequirements && !remote}
        <div class="aside">
            <ProfilePicture
                size={Size.Small}
                image={profilePictureRequirements.image}
                status={profilePictureRequirements.status}
                highlight={profilePictureRequirements.highlight}
                notifications={profilePictureRequirements.notifications} />
        </div>
    {/if}

    {#if subtext}
        <span class="subtext {remote ? "remote" : "local"}">{subtext}</span>
    {/if}
</div>

<style lang="scss">
    .message-group {
        display: inline-flex;
        flex-direction: row;
        align-items: flex-end;
        gap: var(--gap);
        width: 100%;
        position: relative;
        margin-bottom: calc(var(--padding) * 2);

        .flex {
            flex: 1;
            gap: var(--gap-less);
            display: inline-flex;
            flex-direction: column;
        }
        .aside {
            width: fit-content;
            height: 100%;
            flex-direction: row;
        }

        .subtext {
            position: absolute;
            font-size: var(--font-size-smallest);
            color: var(--color-muted);
            top: calc(100% + var(--gap-less));
            margin-left: var(--profile-picture-size);
            
            &.local {
                right: 0;
                margin-left: 0;
                margin-right: var(--profile-picture-size);
            }
        }
    }
</style>