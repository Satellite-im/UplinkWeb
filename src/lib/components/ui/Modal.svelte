<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import { clickoutside } from '@svelte-put/clickoutside'

    
    const dispatch = createEventDispatcher()
    function onClose(event: MouseEvent) {
        dispatch('close', event)
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="modal" on:click={onClose}>
    <div class="body" on:click|stopPropagation>
        <slot name="controls"></slot>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</div>

<style lang="scss">
    .modal {
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--gap);
        position: fixed;
        z-index: 3;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-color: var(--opaque-color);
        backdrop-filter: blur(var(--blur-radius));
        -webkit-backdrop-filter: blur(var(--blur-radius));

        .body {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: var(--min-component-width);
            max-height: 100%;
            max-width: 100%;
            width: fit-content;
            border-radius: var(--border-radius);
            background-color: var(--background-alt);
            border: var(--border-width-more) solid var(--background-alt);

            .content {
                max-width: 75vw;
                max-height: 100%;
                border-radius: var(--border-radius);
                overflow: hidden;
            }

            :global(.controls) {
                width: 100%;
                display: inline-flex;
                justify-content: flex-end;
                align-items: center;
                padding: var(--padding-less);
            }
        }
    }
</style>