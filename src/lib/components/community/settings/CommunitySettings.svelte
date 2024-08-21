<script lang="ts">
    import PermissionsSettings from "./permissions/PermissionsSettings.svelte"
    import SimpleSidebar from "$lib/layouts/SimpleSidebar.svelte"
    import type { NavRoute } from "$lib/types"
    import { CommunitySettingsRoute, Shape } from "$lib/enums"
    import Navigation from "$lib/layouts/Navigation.svelte"
    import CreateRole from "./roles/CreateRole.svelte"
    import CommunityDetails from "./details/CommunityDetails.svelte"
    import { CommunityTags, ModerationSettings, SecuritySettings } from "$lib/components"
    import RoleSelector from "./roles/RoleSelector.svelte"
    import ManageMembers from "./members/ManageMembers.svelte"

    let routes: NavRoute[] = [
        {
            to: CommunitySettingsRoute.Details,
            icon: Shape.Details,
            name: "Details",
        },
        {
            to: CommunitySettingsRoute.Moderation,
            icon: Shape.Shield,
            name: "Moderation",
        },
        {
            to: CommunitySettingsRoute.Security,
            icon: Shape.Lock,
            name: "Security",
        },
        {
            to: CommunitySettingsRoute.Roles,
            icon: Shape.ID,
            name: "Roles",
        },
        {
            to: CommunitySettingsRoute.Tags,
            icon: Shape.Tag,
            name: "Tags",
        },
        {
            to: CommunitySettingsRoute.Users,
            icon: Shape.Users,
            name: "Users",
        },
        {
            to: CommunitySettingsRoute.Extensions,
            icon: Shape.Beaker,
            name: "Extensions",
        },
        {
            to: CommunitySettingsRoute.Bots,
            icon: Shape.Beaker,
            name: "Bots",
        },
    ]

    let activeRoute: CommunitySettingsRoute = CommunitySettingsRoute.Roles
</script>

<div id="community-settings">
    <SimpleSidebar>
        <Navigation
            routes={routes}
            vertical
            on:navigate={e => {
                activeRoute = e.detail
            }}
            activeRoute={activeRoute} />
    </SimpleSidebar>
    <div class="content">
        {#if activeRoute === CommunitySettingsRoute.Roles}
            <!-- Todo: current Roles -->
            <CreateRole />
            <RoleSelector />
            <PermissionsSettings />
        {:else if activeRoute === CommunitySettingsRoute.Users}
            <ManageMembers />
        {:else if activeRoute === CommunitySettingsRoute.Details}
            <CommunityDetails />
        {:else if activeRoute === CommunitySettingsRoute.Moderation}
            <ModerationSettings />
        {:else if activeRoute === CommunitySettingsRoute.Security}
            <SecuritySettings />
        {:else if activeRoute === CommunitySettingsRoute.Tags}
            <CommunityTags />
        {/if}
    </div>
</div>

<style lang="scss">
    #community-settings {
        display: inline-flex;
        flex-direction: row;
        gap: var(--gap);
        flex: 1;
        min-width: 900px;
        max-width: 1200px;
        min-width: var(--min-component-width);
        height: 80vh;
        width: 80vw;
        max-height: 1200px;
        padding: var(--padding-less);

        .content {
            display: inline-flex;
            padding: var(--padding-less);
            flex-direction: column;
            gap: var(--gap);
            overflow-y: scroll;
            flex: 1;
        }
    }

    @media (max-width: 960px) {
        #community-settings {
            max-width: 100%;
            padding: var(--padding-less);
        }

        .content {
            padding: var(--padding-less);
            max-width: 100%;
        }
    }
</style>
