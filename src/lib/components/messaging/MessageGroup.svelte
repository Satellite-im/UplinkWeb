<script lang="ts">
    import { Size } from "$lib/enums"
    import type { ProfilePictureRequirements } from "$lib/types"
    import { ProfilePicture } from "$lib/components"
    import { createEventDispatcher } from "svelte"
    import { get } from "svelte/store"
    import { SettingsStore } from "$lib/state"

    export let remote: boolean = false
    export let subtext: string | null = ""
    export let profilePictureRequirements: ProfilePictureRequirements | null = null
    const dispatch = createEventDispatcher()

    const compact: boolean = get(SettingsStore.state).messaging.compact
</script>

<div class={`message-group ${compact ? "compact" : ""}`}>
    {#if profilePictureRequirements && remote}
        <div class="aside">
            <ProfilePicture
                size={Size.Small}
                image={profilePictureRequirements.image}
                status={profilePictureRequirements.status}
                highlight={profilePictureRequirements.highlight}
                notifications={profilePictureRequirements.notifications}
                on:click={_ => dispatch("profileClick")} />
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
                notifications={profilePictureRequirements.notifications}
                frame={profilePictureRequirements.frame}
                on:click={_ => dispatch("profileClick")} />
        </div>
    {/if}

    {#if subtext}
        <span class="subtext {remote ? 'remote' : 'local'}">{subtext}</span>
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
