<script lang="ts">
    import { get } from "svelte/store"
    import { SettingsStore } from "$lib/state"
    import { Store } from "$lib/state/Store"
    import { UIStore } from "$lib/state/ui"
    import type { Chat, User } from "$lib/types"
    import { ChatType } from "$lib/enums"
    import { debounce } from "$lib/utils/Functions"
    import { onMount } from "svelte"

    const compact: boolean = get(SettingsStore.state).messaging.compact

    $: activeChat = Store.state.activeChat
    $: users = Store.getUsersLookup($activeChat.users)
    $: chats = UIStore.state.chats
    $: typingMessage = $activeChat.typing_indicator.size
    // let isType = $activeChat.typing_indicator !== undefined
    // let isTyping: boolean = false
    // $: is_friend_typing = () => {
    //     UIStore.updateTypingIndicators()
    //     console.log(typingMessage)
    //     // typingMessage = `{$activeChat.typing_indicator} + "JIMBO"`
    //     // return "FUCK"
    //     if ($activeChat.typing_indicator.size !== undefined) {
    //         return "FUCK ${users[0].name} is typing"
    //     }
    //     isTyping = $activeChat.typing_indicator.size > 0
    //     // let dm = $chats.find(c => c.kind === ChatType.DirectMessage && c.users[0] === users.key)
    //     // return dm && dm.typing_indicator.has(users.key)
    // }
    // let typing = debounce(async () => {
    //     console.log(users, chats)
    //     if ($activeChat.typing_indicator.size > 0) {
    //         console.log("SUCCESS")
    //     }
    //     // await RaygunStoreInstance.sendEvent($activeChat.id, MessageEvent.Typing)
    // }, 50)

    onMount(() => {
        setInterval(() => {
            // UIStore.updateTypingIndicators()
            // console.log($activeChat.typing_indicator.size !== 0)
            // if ($activeChat.typing_indicator.size > 0) {
            //     console.log("SUCCESS")
            // }
            // is_friend_typing()
            // console.log(isTyping, $activeChat.typing_indicator)
            // console.log($activeChat.typing_indicator.size)
            // timeago = getTimeAgo(chat.last_message_at)
        }, 500)
    })
</script>

<div data-cy="pending-message-group" class={`pending-message-group ${compact ? "compact" : ""}`}>
    <div class="flex">
        <slot></slot>
    </div>
    <div class="pending-message-buffer"></div>
</div>

<div class="flex">
    <p>wtrf ${$activeChat.typing_indicator.size}</p>
</div>

<style lang="scss">
    .pending-message-group {
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
        .pending-message-buffer {
            width: var(--input-height);
        }
    }
</style>
