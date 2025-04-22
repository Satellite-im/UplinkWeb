<script lang="ts">
    import { onMount } from "svelte"

    export let targetDigit: number = 0
    export let duration: number = 1000 // Duration of animation in milliseconds
    let digits: number[] = []
    let animationName: string = ""

    // Generate the digits array and create a unique animation name
    onMount(() => {
        // Create an array of digits from 0 to 9, repeated to simulate spinning
        digits = Array.from({ length: 30 }, (_, i) => i % 10)

        // Create a unique animation name to prevent conflicts
        animationName = `scroll-${Math.random().toString(36).substr(2, 9)}`
    })
</script>

<div class="digit-container">
    <div class="digit-scroll" style="animation: {animationName} {duration}ms cubic-bezier(0.2, 0.5, 0.3, 1) forwards;">
        {#each digits as digit}
            <div class="digit">{digit}</div>
        {/each}
    </div>
</div>

<!-- Dynamically inject the keyframes animation -->
{@html `
    <style>
        @keyframes ${animationName} {
            from {
                transform: translateY(0);
            }
            to {
                transform: translateY(calc(-${digits.length - (10 - targetDigit)} * 1em));
            }
        }
    </style>
`}

<style>
    .digit-container {
        overflow: hidden;
        height: 1em;
        display: inline-block;
    }
    .digit-scroll {
        display: inline-block;
    }
    .digit {
        height: 1em;
        line-height: 1em;
        font-family: "SpaceMono";
    }
</style>
