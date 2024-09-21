<script lang="ts">
    import TimeAgo from "javascript-time-ago"
    import { ChatType, Route, Size, Status } from "$lib/enums"
    import type { Chat } from "$lib/types"
    import { Text, Loader } from "$lib/elements"
    import { ProfilePicture } from "$lib/components"
    import { createEventDispatcher, onMount } from "svelte"
    import ProfilePictureMany from "../profile/ProfilePictureMany.svelte"
    import { Store } from "$lib/state/Store"
    import { goto } from "$app/navigation"
    import { get } from "svelte/store"
    import { tempCDN } from "$lib/utils/CommonVariables"

    export let chat: Chat
    export let cta: boolean = false
    export let simpleUnreads: boolean = false
    export let loading: boolean

    const timeAgo = new TimeAgo("en-US")

    $: users = Store.getUsers(chat.users)

    $: chatName = chat.kind === ChatType.Group ? chat.name : ($users[1]?.name ?? $users[0].name)
    $: loading = chatName === "Unknown User" || ($users.length <= 2 && ($users[1]?.loading == true || $users[0].loading == true))
    $: directChatPhoto = $users[1]?.profile.photo.image ?? $users[0].profile.photo.image
    $: chatStatus = $users.length > 2 ? Status.Offline : ($users[1]?.profile.status ?? $users[0].profile.status)

    let timeago = getTimeAgo(chat.last_message_at)
    const dispatch = createEventDispatcher()

    function getTimeAgo(dateInput: string | Date) {
        const date: Date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
        return timeAgo.format(date)
    }

    onMount(() => {
        setInterval(() => {
            timeago = getTimeAgo(chat.last_message_at)
        }, 500)
    })
</script>

<button
    data-cy="chat-preview"
    class="chat-preview {cta ? 'cta' : ''} {get(Store.state.activeChat)?.id === chat.id ? 'active-chat' : ''}"
    on:contextmenu
    on:click={_ => {
        dispatch("click")
        Store.setActiveChat(chat)
        goto(Route.Chat)
    }}>
    {#if chat.kind === ChatType.DirectMessage}
        <ProfilePicture hook="chat-preview-picture" id={$users[1].key} typing={chat.typing_indicator.size > 0} image={directChatPhoto} status={chatStatus} size={Size.Medium} loading={loading} frame={$users[1].profile.photo.frame} />
    {:else}
        <ProfilePictureMany users={$users} />
    {/if}
    <div class="content">
        <div class="heading">
            <Text hook="chat-preview-name" class="chat-user min-text" singleLine loading={loading}>
                {chatName}
            </Text>
            <div class="right">
                <Text hook="chat-preview-timestamp" class="timestamp min-text" loading={loading} size={Size.Smallest} muted>
                    {timeago}
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
            {:else if chat.last_message_preview.includes(tempCDN) || chat.last_message_preview.includes("giphy.com")}
                <div class="sticker">
                    <Text hook="chat-preview-last-message" size={Size.Small} loading={loading} markdown={chat.last_message_preview}></Text>
                </div>
            {:else}
                <Text hook="chat-preview-last-message" size={Size.Small} loading={loading}>
                    {chat.last_message_preview || "No messages sent yet."}
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
