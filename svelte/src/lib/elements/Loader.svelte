<script lang="ts">
    export let alt: boolean = false;
    export let text: boolean = false;
</script>

{#if text}
    <div class="loading-text {alt ? "alt" : ""}"></div>
{:else}
    <div class="pulse-loader {alt ? "alt" : ""}">
        <div></div>
        <div></div>
        <div></div>
    </div>
{/if}

<style lang="scss">
    .loading-text {
        flex: 1;
        min-width: var(--icon-size);
        width: 100%;
        min-height: var(--icon-size);
        background-color: var(--color);
        opacity: 0.25;
        margin: var(--padding-minimal) 0;
        animation: flash var(--animation-speed-mid) cubic-bezier(0, 0.2, 0.8, 1) infinite;

        &.alt {
            background-color: var(--color-alt);
        }
    }

    .pulse-loader {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        position: relative;
        width: var(--icon-size);
        height: var(--icon-size);
        
        div {
            position: absolute;
            border: var(--border-width) solid var(--color);
            opacity: 1;
            border-radius: 50%;
            animation: pulse var(--animation-speed-slow) cubic-bezier(0, 0.2, 0.8, 1) infinite;

            &:nth-child(2) {
                animation-delay: calc(var(--animation-speed-slow) * -1.165);
            }
            &:nth-child(3) {
                animation-delay: calc(var(--animation-speed-slow) * -1.75);
            }
        }

        &.alt {
            div {
                border-color: var(--color-alt);
            }
        }
    }

    @keyframes pulse {
        0%, 4.9% {
            width: 0;
            height: 0;
            opacity: 0;
        }
        5% {
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            width: calc((var(--icon-size) * 2) - 10%);
            height: calc((var(--icon-size) * 2) - 10%);
            opacity: 0;
        }
    }

    @keyframes flash {
        0%, 4.9% {
            width: 0;
            height: 0;
            opacity: 0;
        }
        5% {
            width: 0;
            height: 0;
            opacity: 0.6;
        }
        100% {
            opacity: 0;
        }
    }

</style>