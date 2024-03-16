<script lang="ts">
    import TimeAgo from 'javascript-time-ago'

    import { Size } from "$lib/enums";
    import type { User } from '$lib/types';

    import { Text, Loader } from "$lib/elements"
    import { ProfilePicture } from './';

    export let users: User[]            = [];
    export let notifications: number    = 0;
    export let simpleUnreads: boolean   = false;
    export let timestamp: Date          = new Date();
    export let message: string          = "";
    export let loading: boolean         = false;
    export let typing: boolean          = false;

    const timeAgo = new TimeAgo('en-US')

    let photo = (users.length > 1) ?  
        "todo" : users[0].profile.photo.image
    let name = (users.length > 1) ? 
        "todo" : users[0].name

    let cta = notifications > 0
</script>

<button class="chat-preview {cta ? "cta" : ""}">
    <ProfilePicture 
        typing={typing} 
        image={photo} 
        status={users[0].profile.status} 
        size={Size.Small} 
        loading={loading} />
    <div class="content">
        <div class="heading">
            <Text 
                class="chat-user" 
                singleLine 
                loading={loading}>
                {name}
            </Text>
            <div class="right">
                <Text 
                    class="timestamp" 
                    loading={loading} 
                    size={Size.Smallest} 
                    muted>
                    {timeAgo.format(timestamp)}
                </Text>
                {#if !loading}
                    {#if notifications > 0 && !simpleUnreads}
                        <span class="unreads">
                            {notifications}
                        </span>
                    {:else if notifications > 0 && simpleUnreads}
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
                <Text 
                    size={Size.Small} 
                    loading={loading}>
                    {message}
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
                    font-family: "Secondary";
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