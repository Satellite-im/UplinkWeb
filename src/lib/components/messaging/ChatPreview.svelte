<script lang="ts">
    import TimeAgo from "javascript-time-ago"
    import { Route, Size, Status } from "$lib/enums"
    import type { Chat, User } from "$lib/types"
    import { Text, Loader } from "$lib/elements"
    import { ProfilePicture } from "$lib/components"
    import { createEventDispatcher } from "svelte"
    import ProfilePictureMany from "../profile/ProfilePictureMany.svelte"
    import { Store } from "$lib/state/Store"
    import { goto } from "$app/navigation"
    import { get } from "svelte/store"

    export let chat: Chat
    export let cta: boolean = false
    export let simpleUnreads: boolean = false
    export let loading: boolean = false

    const timeAgo = new TimeAgo("en-US")

    let user: User
    $: users = get(Store.getUsers(chat.users))
    $: getPreviewText = getPreviewTextFunction()
    let chats: Chat
    Store.state.activeChat.subscribe(value => {
        chats = value
        user = get(Store.state.user)
        getPreviewText = getPreviewTextFunction()
    })

    $: chatName = users.length > 2 ? chat.name : (users[1]?.name ?? users[0].name)
    $: chatPhoto = users.length > 2 ? "todo" : (users[1]?.profile.photo.image ?? users[0].profile.photo.image)
    $: chatStatus = users.length > 2 ? Status.Offline : (users[1]?.profile.status ?? users[0].profile.status)

    const dispatch = createEventDispatcher()

    function getTimeAgo(dateInput: string | Date) {
        const date: Date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
        return timeAgo.format(date)
    }
    function getPreviewTextFunction() {
        console.log("chatpreviefe", user, chats, chats.last_message_sent_by_user, user.key)
        // console.log("check chats var catch", chats.last_message_preview, chats.last_message_has_attachment)
        if (chats.last_message_preview === "" && chats.last_message_has_attachment === "true" && chats.last_message_sent_by_user !== user.key) {
            // console.log("attachment catch user on lyh", user)
            return "New Attachment Received"
        } else if (chats.last_message_preview !== "" && chats.last_message_has_attachment === "false" && chats.last_message_sent_by_user !== user.key) {
            // console.log("mess catch", chats.last_message_preview, chats)
            return chats.last_message_preview
        } else if (chats.last_message_preview !== "" && chats.last_message_sent_by_user === user.key) {
            // console.log("mess catch", chats.last_message_preview, chats)
            return "Message Sent"
        } else if (chats.last_message_preview !== "" && !chats.last_message_sent_by_user) {
            // console.log("mess catch", chats.last_message_preview, chats)
            return chats.last_message_preview
        }
        // else if (chats.last_message_sent_by_user !== user.key && chats.last_message_has_attachment && chats.last_message_preview !== "") {
        //     return chats.last_message_preview
        // } else if (chats.last_message_sent_by_user === user.key && chats.last_message_has_attachment && chats.last_message_preview === "") {
        //     return "Attachment sent"
        // } else if (chats.last_message_sent_by_user === user.key && chats.last_message_preview !== "") {
        //     return "Message Sent"
        // }
        else {
            return ""
        }
    }
</script>

<button
    data-cy="chat-preview"
    class="chat-preview {cta ? 'cta' : ''}"
    on:contextmenu
    on:click={_ => {
        dispatch("click")
        Store.setActiveChat(chat)
        goto(Route.Chat)
    }}>
    {#if chat.users.length === 2}
        <ProfilePicture hook="chat-preview-picture" id={users[1].key} typing={chat.activity} image={chatPhoto} status={chatStatus} size={Size.Medium} loading={loading} frame={users[1].profile.photo.frame} />
    {:else}
        <ProfilePictureMany users={users} />
    {/if}
    <div class="content">
        <div class="heading">
            <Text hook="chat-preview-name" class="chat-user" singleLine loading={loading}>
                {chatName}
            </Text>
            <div class="right">
                <Text hook="chat-preview-timestamp" class="timestamp" loading={loading} size={Size.Smallest} muted>
                    {getTimeAgo(chat.last_message_at)}
                </Text>
                {#if !loading}
                    {#if chat.notifications > 0 && !simpleUnreads}
                        <span class="unreads">
                            {chat.notifications}
                        </span>
                    {:else if chat.notifications > 0 && simpleUnreads}
                        <span class="unreads simple"></span>
                    {/if}
                {/if}
            </div>
        </div>
        <p class="last-message">
            {#if loading}
                <Loader text small />
                <Loader text small />
            {:else}
                <Text hook="chat-preview-last-message" size={Size.Small} loading={loading}>
                    {getPreviewText}
                </Text>
            {/if}
        </p>
    </div>
</button>

<style lang="scss">
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

        &.cta {
            background-color: var(--alt-color);

            &:hover {
                border: var(--border-width) solid var(--primary-color);
            }
        }

        p {
            margin: 0;
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
</style>
