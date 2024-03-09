<script lang="ts">
    import ChatPreview from "$lib/components/ChatPreview.svelte";
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import Label from "$lib/elements/Label.svelte";
    import Loader from "$lib/elements/Loader.svelte";
    import { Appearance, Route, Shape, Status } from "$lib/enums";
    import { initLocale } from "$lib/lang";
    import Navigation from "$lib/layouts/Navigation.svelte";
    import Sidebar from "$lib/layouts/Sidebar.svelte";
    import Slimbar from "$lib/layouts/Slimbar.svelte";
    import { settingsRoutes } from "$lib/mock/routes";
    import { chats } from "$lib/mock/users";
    import { onMount } from "svelte";
    import { _ } from 'svelte-i18n';
    import { fade } from "svelte/transition";

    initLocale();

    let loading = true;
    let sidebarOpen = true;

    // TODO: Mock
    onMount(() => {
        setTimeout(() => loading = false, 1500);
    })

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }
</script>

<div id="settings">
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Settings}>
        <Navigation routes={settingsRoutes} vertical />
    </Sidebar>

    <div class="content">
        <slot></slot>
    </div>
</div>

<style lang="scss">
    #settings {
        display: flex;
        width: 100vw;
        height: 100vh;
        margin: 0;

        .content {
            flex: 1;
        }
    }
</style>