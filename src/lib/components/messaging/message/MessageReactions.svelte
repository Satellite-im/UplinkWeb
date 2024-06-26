<script lang="ts">
    import type { Reaction } from "$lib/types"

    export let reactions: Array<Reaction> = []
    export let remote: boolean = false
    export let onClick: (emoji: string) => void
</script>

<div class="message-reactions {remote ? 'remote' : 'local'}">
    {#each reactions as reaction}
        <div role="none" class="reaction highlight-{reaction.highlight.toLowerCase()}" on:click={_ => onClick(reaction.emoji)}>
            <div class="reaction-hover">
                <span class="emoji">{reaction.emoji}</span> <span class="description">{reaction.description}</span>
            </div>
            <span class="reaction-emoji">{reaction.emoji}</span>
            <span class="count">{reaction.reactors.size}</span>
        </div>
    {/each}
</div>

<style lang="scss">
    .message-reactions {
        display: inline-flex;
        justify-content: flex-end;
        gap: var(--gap);

        &.remote {
            justify-content: flex-start;
        }

        .reaction {
            position: relative;
            display: inline-flex;
            border: var(--border-width) solid var(--border-color);
            background-color: var(--alt-color-alt);
            width: fit-content;
            padding: 0 var(--padding-less);
            border-radius: var(--border-radius-more);
            align-self: flex-end;
            cursor: pointer;
            font-size: var(--label-size);
            justify-content: center;
            align-items: center;
            user-select: none;
            gap: var(--gap);

            .reaction-emoji {
                font-size: calc(var(--emoji-size) / 1.65);
            }

            .reaction-hover {
                position: absolute;
                z-index: 2;
                font-size: var(--font-size-large);
                bottom: calc(100% + var(--gap-less));
                left: 50%;
                transform: translate(-50%, 0);
                padding: 0 var(--padding-less);
                border-radius: var(--border-radius);
                display: none;
                flex-direction: row;
                white-space: nowrap;
                align-items: center;
                color: var(--color);
                gap: var(--gap);
                background-color: var(--opaque-color);
                backdrop-filter: blur(var(--blur-radius));
                -webkit-backdrop-filter: blur(var(--blur-radius));

                .description {
                    font-size: var(--label-size);
                }
            }

            &:hover {
                background-color: var(--alt-color);

                .reaction-hover {
                    display: inline-flex;
                }
            }

            @each $type in primary, success, info, error {
                &.highlight-#{$type} {
                    background-color: var(--#{$type}-color);
                    color: var(--color);

                    &:hover {
                        background-color: var(--#{$type}-color-alt);
                    }
                }
            }
        }
    }
</style>
