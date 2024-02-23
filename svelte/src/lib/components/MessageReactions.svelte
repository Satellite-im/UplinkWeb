<script lang="ts">
    import type { Reaction } from "$lib/types";

    export let reactions: Array<Reaction> = [];
    export let remote: boolean = false;
</script>

<div class="message-reactions {remote ? "remote" : "local"}">
    {#each reactions as reaction}
        <div class="reaction highlight-{reaction.highlight.toLowerCase()}">
            <span class="emoji">{reaction.emoji}</span>
            <span class="count">{reaction.count}</span>
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
            font-family: "Secondary";
            border: var(--border-width) solid var(--border-color);
            background-color: var(--alt-color-alt);
            width: fit-content;
            padding: var(--padding-minimal) var(--padding-less);
            border-radius: var(--border-radius-more);
            align-self: flex-end;
            cursor: pointer;
            font-size: var(--label-size);
            justify-content: center;
            align-items: center;
            user-select: none;

            &:hover {
                background-color: var(--alt-color);
            }

            @each $type in primary, success, info, error {
                &.highlight-#{$type} {
                    background-color: var(--#{$type}-color);
                    color: var(--color-alt);

                    &:hover {
                        background-color: var(--#{$type}-color-alt);
                    }
                }
            }
        }
    }
</style>