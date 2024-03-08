<script lang="ts">
    import ChatPreview from "$lib/components/ChatPreview.svelte";
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import Label from "$lib/elements/Label.svelte";
    import Loader from "$lib/elements/Loader.svelte";
    import { Appearance, Shape, Status } from "$lib/enums";
    import { initLocale } from "$lib/lang";
    import Sidebar from "$lib/layouts/Sidebar.svelte";
    import { chats } from "$lib/mock/users";
    import { onMount } from "svelte";
    import { _ } from 'svelte-i18n';
    import { fade } from "svelte/transition";

    initLocale();

    let loading = false;

    // TODO: Mock
    onMount(() => {
        loading = true;
        setTimeout(() => loading = false, 1500);
    })
</script>

<div id="chat">
    <div class="left">
        <Sidebar>
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
    </div>
    <div class="right">
        Right
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

        .left {
            display: inline-flex;
            border-right: var(--border-width) solid var(--border-color);
        }
        .right {
            flex: 1;
        }
    }
</style>