<script lang="ts">
    import { routes } from "$lib/mock/routes"
    import Navigation from "./Navigation.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Appearance, Route, Shape, Size } from "$lib/enums"
    import Button from "$lib/elements/Button.svelte"
    import { createEventDispatcher } from "svelte"
    import { slide } from "svelte/transition"
    import { animationDuration } from "$lib/globals/animations"
    import { Store } from "$lib/state/Store"
    import type { Chat } from "$lib/types"
    import { get } from "svelte/store"
    import { ProfilePicture, ProfilePictureMany } from "$lib/components"
    import { Label } from "$lib/elements"
    import { goto } from "$app/navigation"
    import CommunityIcon from "$lib/components/community/icon/CommunityIcon.svelte"
    import StoreResolver from "$lib/components/utils/StoreResolver.svelte"
    import { _ } from "svelte-i18n"

    export let sidebarOpen: boolean = true
    export let activeRoute: Route = Route.Chat
    $: favorites = Store.state.favorites

    const dispatch = createEventDispatcher()
    function handleToggle() {
        dispatch("toggle", sidebarOpen)
    }
</script>

<div class="slimbar" data-cy="slimbar">
    {#if !sidebarOpen}
        <div transition:slide={{ duration: animationDuration, axis: "y" }}>
            <Button hook="button-show-sidebar" icon appearance={Appearance.Alt} on:click={handleToggle}>
                <Icon icon={Shape.Sidebar} />
            </Button>
        </div>
    {/if}

    <div class="content">
        <Button icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Beaker} />
        </Button>
        {#if $favorites.length}
            <Label hook="label-favorites" text={$_("generic.faves")} />
            {#each $favorites as favorite}
                <StoreResolver value={favorite.users} resolver={v => Store.getUsers(v)} let:resolved>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="fave"
                        data-cy="favorite-circle"
                        on:click={_ => {
                            Store.setActiveChat(favorite)
                            goto(Route.Chat)
                        }}>
                        {#if favorite.users.length === 2}
                            <ProfilePicture hook="favorite-profile-picture" id={resolved[0]?.key} typing={favorite.activity} image={resolved[0]?.profile.photo.image} status={resolved[0].profile.status} size={Size.Medium} />
                        {:else}
                            <ProfilePictureMany users={resolved} />
                        {/if}
                    </div>
                </StoreResolver>
            {/each}
        {/if}

        <slot></slot>
        <CommunityIcon name="Satellite.im" image="/assets/logo/satellite.png" />
    </div>

    {#if !sidebarOpen}
        <div transition:slide={{ duration: animationDuration, axis: "y" }}>
            <Navigation vertical icons routes={routes} activeRoute={activeRoute} on:navigate={e => goto(e.detail)} />
        </div>
    {/if}
</div>

<style lang="scss">
    .slimbar {
        display: inline-flex;
        flex-direction: column;
        padding: var(--padding-less);
        gap: var(--gap);
        width: fit-content;
        border-right: var(--border-width) solid var(--border-color);
        align-items: center;

        .content {
            flex: 1;
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            gap: var(--gap);

            .fave {
                cursor: pointer;
            }
        }
    }
</style>
