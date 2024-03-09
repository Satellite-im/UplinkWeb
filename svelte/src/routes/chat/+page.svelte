<script lang="ts">
    import ChatPreview from "$lib/components/ChatPreview.svelte";
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import Label from "$lib/elements/Label.svelte";
    import Loader from "$lib/elements/Loader.svelte";
    import { Appearance, Route, Shape, Status } from "$lib/enums";
    import { initLocale } from "$lib/lang";
    import Chatbar from "$lib/layouts/Chatbar.svelte";
    import Sidebar from "$lib/layouts/Sidebar.svelte";
    import Slimbar from "$lib/layouts/Slimbar.svelte";
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

<div id="chat">
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Chat} >
        <Button outline appearance={Appearance.Alt} text="Market">
            <Icon icon={Shape.Shop} />
        </Button>

        <div class="content-header">
            <Label text="Chats" />
            <Button icon small tooltip="Create Chat">
                <Icon icon={Shape.ChatPlus} />
            </Button>
        </div>

        {#each chats as chat}
            <ChatPreview
                loading={loading}
                users={chat.users}
                simpleUnreads
                notifications={chat.notifications}
                timestamp={chat.last_message_at}
                message={chat.last_message_preview} />
        {/each}
        </Sidebar>
    <div class="right">
        <div class="content">
            Content
        </div>
        <Chatbar />
    </div>
</div>

<style lang="scss">
    #chat {
        display: flex;
        width: 100vw;
        height: 100vh;
        margin: 0;


        .content-header {
            display: inline-flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-end;
        }

        .right {
            flex: 1;
            display: inline-flex;
            flex-direction: column;
            .content {
                flex: 1;
            }
        }
    }
</style>