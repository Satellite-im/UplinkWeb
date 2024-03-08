<script lang="ts">
    import TimeAgo from 'javascript-time-ago'
    import en from 'javascript-time-ago/locale/en'

    import { Size, Status } from "$lib/enums";
    import ProfilePicture from './ProfilePicture.svelte';
    import type { User } from '$lib/types';
    import { fade } from 'svelte/transition';
    import Loader from '$lib/elements/Loader.svelte';

    export let users: User[] = [];
    export let status: Status = Status.Offline;
    export let notifications: number = 0;
    export let simpleUnreads: boolean = false;
    export let timestamp: Date = new Date();
    export let message: string = "";
    export let loading: boolean = true;

    TimeAgo.addDefaultLocale(en)
    const timeAgo = new TimeAgo('en-US')

    let photo = (users.length > 1) ?  "todo" : users[0].profile.photo.image;
    let name = (users.length > 1) ? "todo" : users[0].name;
</script>

<div class="chat-preview">
    <ProfilePicture image={photo} status={status} size={Size.Small} loading={loading} />
    <div class="content">
        <div class="heading">
            <h3 class="chat-user">
                {#if loading}
                    <Loader text />
                {:else}
                    {name}
                {/if}
            </h3>
            <p class="timestamp">
                {#if !loading}
                    {timeAgo.format(timestamp)}
                {/if}
            </p>
            {#if !loading}
                {#if notifications > 0 && !simpleUnreads}
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label class="unreads">{notifications}</label>
                {:else if notifications > 0 && simpleUnreads}
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label class="unreads simple"></label>
                {/if}
            {/if}
        </div>
        <p class="last-message">
            {#if loading}
                <Loader text small />
                <Loader text small />
            {:else}
                {message}
            {/if}
        </p>
    </div>
</div>

<style lang="scss">
    .chat-preview {
        display: inline-flex;
        flex-direction: row;
        gap: var(--gap);
        background-color: var(--alt-color);
        padding: var(--padding);
        border-radius: var(--border-radius);
        border: var(--border-width) solid var(--border-color);
        user-select: none;
        transition: all var(--animation-speed);

        p, h3 {
            margin: 0;
        }

        &:hover {
            background-color: var(--alt-color-alt);
            cursor: pointer;
        }

        .content {
            flex: 1;

            .heading {
                display: inline-flex;
                align-items: center;
                gap: var(--gap);
                width: 100%;
                position: relative;

                .unreads {
                    position: absolute;
                    right: calc(var(--padding-less) * -0.5);
                    top: calc(var(--padding-less) * -0.5);
                    background-color: var(--error-color);
                    font-size: var(--font-size-smaller);
                    font-family: "Secondary";
                    padding: 0 var(--padding-minimal);
                    border-radius: var(--border-radius-minimal);

                    &.simple {
                        content: none;
                        color: var(--primary-color);
                        font-size: 0rem;
                        height: var(--label-size);
                        width: var(--label-size);
                        border-radius: calc(var(--label-size) / 2);
                        background-color: var(--primary-color);
                        padding: 0;
                        box-shadow: 0 0 0 var(--border-width-more) var(--alt-color);
                    }
                }
            }

            .chat-user {
                align-items: center;
                gap: var(--gap);
                font-size: var(--text-size);
                font-weight: bold;
                white-space: nowrap;
                min-width: 50%;
            }

            .heading .timestamp {
                font-size: var(--font-size-smallest);
                color: var(--color-muted);
                white-space: nowrap;
                min-width: 30%;
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