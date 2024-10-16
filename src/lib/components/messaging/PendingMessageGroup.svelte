<script lang="ts">
    import { get } from "svelte/store"
    import { SettingsStore } from "$lib/state"
    import { Store } from "$lib/state/Store"
    import { _ } from "svelte-i18n"
    const compact: boolean = get(SettingsStore.state).messaging.compact

    $: activeChat = Store.state.activeChat
    $: users = Store.getUsersLookup($activeChat.users)
    $: typingMessage = is_friend_typing()
    $: is_friend_typing = () => {
        if ($activeChat.typing_indicator.size === 0) {
            return ""
        } else if ($activeChat.typing_indicator.size === 1) {
            const user = $activeChat.typing_indicator.users().map(u => {
                return $users[u]
            })
            return $_("chat.user-typing", { values: { user: user[0].name } })
        } else {
            return $_("chat.multiple-users-typing")
        }
    }
</script>

<div data-cy="pending-message-group" class={`pending-message-group ${compact ? "compact" : ""}`}>
    <div class="flex">
        <p class={typingMessage !== "" ? "loading" : ""}>{typingMessage}</p>
    </div>
</div>

<style lang="scss">
    .pending-message-group {
        display: inline-flex;
        flex-direction: row;
        align-items: flex-end;
        gap: var(--gap);
        width: 100%;
        position: relative;
        margin-top: 10px;

        .flex {
            flex: 1;
            gap: var(--gap-less);
            display: inline-flex;
            flex-direction: column;
        }
    }

    .loading {
        font-size: 10px;
        position: absolute;
        bottom: 0;
    }

    .loading:after {
        overflow: hidden;
        display: inline-block;
        vertical-align: bottom;
        -webkit-animation: ellipsis steps(4, end) 900ms infinite;
        animation: ellipsis steps(4, end) 900ms infinite;
        content: "\2026";
        width: 0px;
    }

    @keyframes ellipsis {
        to {
            width: 1.25em;
        }
    }

    @-webkit-keyframes ellipsis {
        to {
            width: 1.25em;
        }
    }
</style>
