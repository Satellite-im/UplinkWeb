<script lang="ts">
    import TimeAgo from 'javascript-time-ago'
    import en from 'javascript-time-ago/locale/en'

    import { Status } from "$lib/enums";
    import ProfilePicture from './ProfilePicture.svelte';

    export let photo: string = "";
    export let status: Status = Status.Offline;
    export let unreads: number = 0;
    export let timestamp: Date = new Date();
    export let username: string = "";
    export let message: string = "";

    TimeAgo.addDefaultLocale(en)
    const timeAgo = new TimeAgo('en-US')
</script>

<div class="chat-preview">
    <ProfilePicture image={photo} status={status} small />
    <div class="content">
        <div class="heading">
            <h3 class="chat-user">{username}</h3>
            <p class="timestamp">{timeAgo.format(timestamp)}</p>
            {#if unreads > 0}
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label class="unreads">3</label>
            {/if}
        </div>
        <p class="last-message">{message}</p>
    </div>
</div>

<style lang="scss">
    .chat-preview {
        display: inline-flex;
        flex-direction: row;
        gap: var(--gap);
        background-color: var(--alt-color);
        padding: var(--padding-less);
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
                    }
                }
            }

            .chat-user {
                display: inline-flex;
                align-items: center;
                gap: var(--gap);
                font-size: var(--text-size);
                font-weight: bold;
                white-space: nowrap;
            }

            .heading .timestamp {
                font-size: var(--font-size-smallest);
                color: var(--color-muted);
                white-space: nowrap;
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