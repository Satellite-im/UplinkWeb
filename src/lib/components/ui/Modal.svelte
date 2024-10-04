<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte"
    import Controls from "../../layouts/Controls.svelte"

    const dispatch = createEventDispatcher()
    function onClose(event: MouseEvent) {
        dispatch("close", event)
    }

    export let direct: boolean = false
    export let noBackground: boolean = false
    export let padded: boolean = false
    export let withControls: boolean = false
    export let hook: string = ""
    export let escape: boolean = false
    export let large: boolean = false

    let clazz = ""
    export { clazz as class }

    let keyListener: any
    onMount(() => {
        keyListener = (e: KeyboardEvent) => {
            if (escape && e.code === "Escape") {
                dispatch("close")
            }
        }
        document.addEventListener("keydown", keyListener)
    })

    onDestroy(() => {
        document.removeEventListener("keydown", keyListener)
    })
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="modal {noBackground ? '' : 'blurred'}" data-cy={hook} on:click={onClose}>
    {#if direct}
        <div class="content">
            <slot></slot>
        </div>
    {:else}
        <div class="body {padded ? 'padded' : ''} {large ? 'large' : ''} {clazz}" on:click|stopPropagation>
            {#if withControls}
                <Controls>
                    <slot name="controls"></slot>
                </Controls>
            {/if}
            <div class="content">
                <slot></slot>
            </div>
        </div>
    {/if}
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
        &.blurred {
            background-color: var(--opaque-color);
            backdrop-filter: blur(var(--blur-radius));
            -webkit-backdrop-filter: blur(var(--blur-radius));
        }

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

            &.large {
                min-width: 0;
                width: calc(var(--max-component-width) * 2);
                height: var(--max-component-width);

                .content {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }

    @media only screen and (max-width: 600px) {
        .modal {
            .body {
                max-width: 100%;
                max-width: calc(100% - var(--padding) * 2);
                /* width: 100%; */
                /* height: 100%; */
                top: var(--padding);
                left: var(--padding);
                right: var(--padding);

                .content {
                    max-width: 100%;
                    height: 100%;
                    width: 100%;
                    display: inline-flex;
                }
            }
        }
    }
</style>
