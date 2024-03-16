<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Route, Shape } from "$lib/enums"
    import { Topbar } from "$lib/layouts"
    import { initLocale } from "$lib/lang"
    import Sidebar from "$lib/layouts/Sidebar.svelte"
    import Slimbar from "$lib/layouts/Slimbar.svelte"
    import { onMount } from "svelte"
    import { _ } from 'svelte-i18n'
    import type { User } from "$lib/types"

    // Initialize locale
    initLocale()

    let loading: boolean = true
    let sidebarOpen: boolean = true

    // Mock loading behavior
    onMount(() => {
        setTimeout(() => loading = false, 1500)
    })

    function toggleSidebar(): void {
        sidebarOpen = !sidebarOpen
    }

    // Function to group users alphabetically by the first character of their usernames
    function groupUsersAlphabetically(users: User[]): { [letter: string]: User[] } {
        const groupedUsers: { [letter: string]: User[] } = {};
        users.forEach(user => {
            const firstChar: string = user.name.charAt(0).toUpperCase();
            if (!groupedUsers[firstChar]) {
                groupedUsers[firstChar] = [];
            }
            groupedUsers[firstChar].push(user);
        });
        return groupedUsers;
    }
</script>

<div id="page">
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Files} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Files} >
       
    </Sidebar>
    <div class="content">
        <Topbar>
            <div slot="controls">
                <Button appearance={Appearance.Alt} icon tooltip="New Folder">
                    <Icon icon={Shape.FolderPlus} />
                </Button>
                <Button appearance={Appearance.Alt} icon tooltip="Upload">
                    <Icon icon={Shape.Plus} />
                </Button>
            </div>
        </Topbar>

        <div class="body">
            
        </div>
    </div>
</div>

<style lang="scss">
    #page {
        display: flex;
        margin: 0;
        flex: 1;
        height: 100%;
        overflow: hidden;
        
        .content {
            display: flex;
            min-height: 0;
            display: flex;
            flex-direction: column;
            flex: 1;
        }
    }
</style>
