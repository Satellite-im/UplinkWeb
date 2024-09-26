<script lang="ts">
    import { routes } from "$lib/defaults/routes"
    import Navigation from "./Navigation.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Appearance, ChatType, Route, Shape, Size } from "$lib/enums"
    import Button from "$lib/elements/Button.svelte"
    import { createEventDispatcher } from "svelte"
    import { slide } from "svelte/transition"
    import { animationDuration } from "$lib/globals/animations"
    import { Store } from "$lib/state/Store"
    import { ProfilePicture, ProfilePictureMany } from "$lib/components"
    import { Label } from "$lib/elements"
    import { goto } from "$app/navigation"
    import CommunityIcon from "$lib/components/community/icon/CommunityIcon.svelte"
    import StoreResolver from "$lib/components/utils/StoreResolver.svelte"
    import { _ } from "svelte-i18n"
    import { SettingsStore } from "$lib/state"
    import { UIStore } from "$lib/state/ui"
    import { checkMobile } from "$lib/utils/Mobile"

    export let sidebarOpen: boolean = true
    export let activeRoute: Route = Route.Chat

    $: settings = SettingsStore.state
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
        {#if $settings.devmode}
            <Button
                appearance={Appearance.Alt}
                on:click={() => {
                    UIStore.toggleMarket()
                }}
                icon>
                <Icon icon={Shape.Shop} />
            </Button>
        {/if}
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
                            if (checkMobile()) {
                                UIStore.toggleSidebar()
                            }
                            goto(Route.Chat)
                        }}>
                        {#if favorite.kind === ChatType.DirectMessage}
                            <ProfilePicture hook="favorite-profile-picture" id={resolved[1]?.key} typing={favorite.typing_indicator.size > 0} image={resolved[1]?.profile.photo.image} status={resolved[1].profile.status} size={Size.Medium} />
                        {:else}
                            <ProfilePictureMany users={resolved} />
                        {/if}
                    </div>
                </StoreResolver>
            {/each}
        {/if}

        <slot></slot>

        {#if $settings.devmode}
            <CommunityIcon name="Satellite.im" image="/assets/logo/satellite.png" />
        {/if}
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
