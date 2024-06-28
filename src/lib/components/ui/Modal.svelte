<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import Controls from "../../layouts/Controls.svelte"

    const dispatch = createEventDispatcher()
    function onClose(event: MouseEvent) {
        dispatch("close", event)
    }

    export let padded: boolean = false
    export let withControls: boolean = false
    export let hook: string = ""

    let clazz = ""
    export { clazz as class }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="modal" data-cy={hook} on:click={onClose}>
    <div class="body {padded ? 'padded' : ''} {clazz}" on:click|stopPropagation>
        {#if withControls}
            <Controls>
                <slot name="controls"></slot>
            </Controls>
        {/if}
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
        z-index: 4;
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

            &.padded {
                padding: var(--padding);
            }

            .content {
                max-width: 75vw;
                max-height: 100%;
                border-radius: var(--border-radius);
                overflow: hidden;
                padding-top: 0;
                width: 100%;
            }

            :global(.controls) {
                width: 100%;
                display: inline-flex;
                justify-content: flex-end;
                align-items: center;
                padding: var(--padding-minimal);
            }
        }
    }
</style>
