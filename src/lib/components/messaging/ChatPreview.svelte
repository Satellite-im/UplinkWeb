<script lang="ts">
    import TimeAgo from "javascript-time-ago"
    import { Appearance, ChatType, PaymentRequestsEnum, Route, Shape, Size, Status } from "$lib/enums"
    import type { Chat } from "$lib/types"
    import { Text, Loader, Button, Icon } from "$lib/elements"
    import { ChatIcon, ProfilePicture } from "$lib/components"
    import { createEventDispatcher, onMount } from "svelte"
    import ProfilePictureMany from "../profile/ProfilePictureMany.svelte"
    import { Store } from "$lib/state/Store"
    import { goto } from "$app/navigation"
    import { derived, get } from "svelte/store"
    import { tempCDN } from "$lib/utils/CommonVariables"
    import { UIStore } from "$lib/state/ui"
    import { _ } from "svelte-i18n"
    import { checkMobile } from "$lib/utils/Mobile"
    import { ConversationStore } from "$lib/state/conversation"
    import { SettingsStore } from "$lib/state"
    import { callInProgress, timeCallStarted } from "$lib/media/Voice"

    export let chat: Chat
    export let cta: boolean = false
    export let loading: boolean
    export let interactable: boolean = true

    const timeAgo = new TimeAgo("en-US")

    $: users = Store.getUsers(chat.users)
    $: lookupUsers = Store.getUsersLookup(chat.users)
    $: chatName = chat.kind === ChatType.Group ? chat.name : ($users[1]?.name ?? $users[0].name)
    $: loading = chatName === "Unknown User" || ($users.length <= 2 && ($users[1]?.loading == true || $users[0].loading == true))
    $: directChatPhoto = $users[1]?.profile.photo.image ?? $users[0].profile.photo.image
    $: chatStatus = $users.length > 2 ? Status.Offline : ($users[1]?.profile.status ?? $users[0].profile.status)
    $: simpleUnreads = derived(SettingsStore.state, s => s.messaging.simpleUnreads)
    $: user = chat.typing_indicator.users().map(u => {
        return $lookupUsers[u]
    })
    let timeago = getTimeAgo(chat.last_message_at)
    const dispatch = createEventDispatcher()
    let ownId = get(Store.state.user)
    $: messagePreview = (() => {
        if (!chat.last_message_id) {
            return $_("message_previews.none")
        }

        if (chat.last_message_id && !chat.last_message_preview) {
            return $_("message_previews.attachment")
        }

        if (chat.last_message_preview.startsWith(PaymentRequestsEnum.Request)) {
            try {
                const sendingUserId = ConversationStore.getMessage(chat.id, chat.last_message_id)?.details.origin
                const sendingUserDetails = get(Store.getUser(sendingUserId!))
                const { amountPreview } = JSON.parse(chat.last_message_preview.slice(8))

                return sendingUserId !== ownId.key
                    ? $_("message_previews.coin_requested", { values: { username: sendingUserDetails.name, amount: amountPreview } })
                    : $_("message_previews.request_sent", { values: { amount: amountPreview } })
            } catch (error) {
                console.log(chat.last_message_preview)
                return "Invalid message format"
            }
        }
        if (chat.last_message_preview.startsWith(PaymentRequestsEnum.Reject)) {
            try {
                const sendingUserId = ConversationStore.getMessage(chat.id, chat.last_message_id)?.details.origin
                const sendingUserDetails = get(Store.getUser(sendingUserId!))
                if (get(Store.getUser(sendingUserId!)).key !== ownId.key) {
                    return $_("message_previews.coin_declined", { values: { username: sendingUserDetails.name } })
                } else {
                    return $_("message_previews.coin_canceled")
                }
            } catch (error) {
                console.log(chat.last_message_preview)
                return "Invalid message format"
            }
        }
        if (chat.last_message_preview.startsWith(PaymentRequestsEnum.Send)) {
            try {
                const sendingUserId = ConversationStore.getMessage(chat.id, chat.last_message_id)?.details.origin
                const sendingUserDetails = get(Store.getUser(sendingUserId!))
                const jsonStartIndex = chat.last_message_preview.indexOf("{")
                if (jsonStartIndex === -1) {
                    console.error("No JSON found in last_message_preview:", chat.last_message_preview)
                    return "Invalid message format"
                }
                const jsonPart = chat.last_message_preview.slice(jsonStartIndex)
                let parsedMessage
                try {
                    parsedMessage = JSON.parse(jsonPart)
                } catch (error) {
                    console.error("Error parsing JSON:", error, chat.last_message_preview)
                    return "Invalid message format"
                }
                const amountWei = parsedMessage.details.amount
                if (sendingUserDetails.key !== ownId.key) {
                    return `${sendingUserDetails.name} sent you ${amountWei}`
                } else {
                    return `You sent ${amountWei} to ${sendingUserDetails.name}`
                }
            } catch (error) {
                console.error("Error in PaymentRequestsEnum.Send condition:", error)
                return "Invalid message format"
            }
        }

        return chat.last_message_preview
    })()

    function getTimeAgo(dateInput: string | Date) {
        const date: Date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
        return timeAgo.format(date)
    }

    onMount(() => {
        setInterval(() => {
            timeago = getTimeAgo(chat.last_message_at)
        }, 500)
    })

    $: isActiveChat = get(Store.state.activeChat)?.id === chat.id

    function getClass() {
        if (!interactable) return ""
        return `${cta ? "cta" : ""} `
    }

    let elapsedTime: string = "00:00"

    function updateElapsedTime() {
        const now = new Date()
        const diff = now.getTime() - ($timeCallStarted ?? now).getTime()

        const minutes = Math.floor(diff / (1000 * 60))
            .toString()
            .padStart(2, "0")
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
            .toString()
            .padStart(2, "0")

        elapsedTime = `${minutes}:${seconds}`
    }

    const interval = setInterval(updateElapsedTime, 1000)
</script>

<button
    data-cy="chat-preview"
    class="chat-preview {getClass()} {isActiveChat ? 'active-chat' : ''}"
    disabled={!interactable}
    on:contextmenu
    on:click={_ => {
        if (!interactable) return
        dispatch("click")
        Store.setActiveChat(chat)
        let isMobile = checkMobile()
        if (isMobile) {
            UIStore.toggleSidebar()
        }
        goto(Route.Chat)
    }}>
    <ChatIcon chat={chat} profileHook={"chat-preview-picture"} loading={loading} />
    <div class="content">
        <div class="heading">
            <Text hook="chat-preview-name" class="chat-user min-text" singleLine loading={loading}>
                {chatName}
            </Text>
            <div class="right">
                <Text hook="chat-preview-timestamp" class="timestamp min-text" loading={loading} size={Size.Smallest} muted>
                    {#if $callInProgress === chat.id}
                        <Icon icon={Shape.PhoneCall} highlight={Appearance.Success} />
                    {:else}
                        {timeago}
                    {/if}
                </Text>
                {#if !loading}
                    {#if chat.notifications > 0 && !$simpleUnreads}
                        <span class="unreads">
                            {chat.notifications}
                        </span>
                    {:else if chat.notifications > 0 && $simpleUnreads}
                        <span class="unreads simple" data-cy="unreads-notification"></span>
                    {/if}
                {/if}
            </div>
        </div>
        <p class="last-message">
            {#if loading}
                <Loader text small />
                <Loader text small />
            {:else if chat.last_message_preview.includes(tempCDN) || chat.last_message_preview.includes("giphy.com")}
                <div class="sticker">
                    <Text hook="chat-preview-last-message" size={Size.Small} loading={loading} markdown={chat.last_message_preview}></Text>
                </div>
            {:else}
                <Text hook="chat-preview-last-message" size={Size.Small} loading={loading}>
                    {messagePreview}
                </Text>
            {/if}
        </p>
    </div>
</button>

<style lang="scss">
    .sticker {
        width: 40px;
    }

    .chat-preview {
        display: inline-flex;
        flex-direction: row;
        gap: var(--gap);
        background-color: var(--background-alt);
        padding: var(--padding-less);
        border-radius: var(--border-radius);
        border: var(--border-width) solid var(--border-color);
        user-select: none;
        transition: all var(--animation-speed);
        min-width: var(--min-component-width);

        &.active-chat {
            border-color: var(--primary-color-alt);
        }

        &.cta {
            background-color: var(--alt-color);

            &:hover {
                border: var(--border-width) solid var(--primary-color);
            }
        }

        p {
            margin: 0;
        }

        &:disabled {
            opacity: var(--disabled-opacity);
            pointer-events: none;
        }

        &:hover {
            background-color: var(--alt-color-alt);
            cursor: pointer;
        }

        .content {
            flex: 1;
            width: 1%;
            pointer-events: none;

            .heading {
                display: inline-flex;
                align-items: center;
                gap: var(--gap);
                width: 100%;
                position: relative;
                justify-content: space-between;

                .right {
                    display: inline-flex;
                    gap: var(--gap);
                    align-items: center;
                }

                :global(.chat-user),
                :global(.timestamp) {
                    min-width: 50px;
                }

                .unreads {
                    background-color: var(--error-color);
                    font-size: var(--font-size-smaller);
                    padding: 0 var(--padding-minimal);
                    border-radius: var(--border-radius-minimal);

                    &.simple {
                        content: none;
                        color: var(--primary-color);
                        font-size: 0rem;
                        height: var(--font-size-smallest);
                        width: var(--font-size-smallest);
                        border-radius: calc(var(--label-size) / 2);
                        background-color: var(--primary-color);
                        padding: 0;
                        box-shadow: 0 0 0 var(--border-width-more) var(--alt-color);
                    }
                }
            }

            :global(.chat-user) {
                align-items: center;
                gap: var(--gap);
                font-size: var(--text-size);
                white-space: nowrap;
                flex: 1;
            }

            :global(.timestamp) {
                white-space: nowrap;
                display: inline;
                min-width: fit-content;
            }

            .last-message {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                font-size: var(--font-size-smaller);
            }
        }
    }

    @media only screen and (max-width: 600px) {
        .chat-preview {
            min-width: 0;
        }
    }
</style>
