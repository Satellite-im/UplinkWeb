<script lang="ts">
    import { onMount } from 'svelte';
    import Button from "$lib/elements/Button.svelte";
    import { Appearance, Shape } from "$lib/enums";
    import Icon from '$lib/elements/Icon.svelte';

    export let error: boolean = false;
    export let loading: boolean = false;

    export let min: number = 4;
    export let max: number = 6;

    let pinValue: string = ''; // This holds the actual pin value
    let displayDots: Array<boolean> = []; // This holds the state for each dot (filled or not)

    // Initialize or shuffle digits for the keypad
    let pinDigits: string[] = shuffleArray(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);

    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Update the pin value and the display dots
    const updatePinValue = (digit: string) => {
        if (pinValue.length < max) {
            pinValue += digit;
            updateDisplayDots();

        }
    };

    // Update display dots based on the current pin value
    const updateDisplayDots = () => {
        displayDots = (pinValue.length < min) ? 
            Array.from({ length: min }, (_, i) => i < pinValue.length) :
            Array.from({ length: pinValue.length }, () => true);
        pinDigits = shuffleArray(pinDigits);
    };

    // Clear the pin value and update display dots
    const clearPinValue = () => {
        pinValue = '';
        updateDisplayDots();
    };

    // Placeholder for submit action
    const submitPinValue = () => {
        console.log("Submitting pin:", pinValue);
        clearPinValue();
    };

    onMount(() => {
        updateDisplayDots();
    });
</script>

<div class="pin-input-group">
    <div class="pin-group">
        <div class="pin-display">
            {#each displayDots as dot}
                <span class="dot {dot ? 'filled' : ''}"></span>
            {/each}
        </div>
        <div class="shadow-input">
            <input type="number" bind:value={pinValue} pattern="[0-9]*" />
        </div>
    </div>
    <div class="pin-keypad" data-shuffle="true">
        {#each pinDigits.slice(0, -1) as digit}
            <Button 
                class="pin-key"
                icon
                on:click={() => updatePinValue(digit)}
                appearance={Appearance.Alt}>
                {digit}
            </Button>
        {/each}
        <Button class="pin-key" icon rotateOnHover on:click={clearPinValue} appearance={Appearance.Error}>
            <Icon icon={Shape.Refresh} />
        </Button>
        <Button class="pin-key" icon on:click={() => updatePinValue(pinDigits.slice(-1).toString())} appearance={Appearance.Alt}>{pinDigits.slice(-1)}</Button>
        <Button class="pin-key" icon on:click={submitPinValue} appearance={(pinValue.length < min) ? Appearance.Alt : Appearance.Success} disabled={(pinValue.length < min)}>
            <Icon icon={Shape.CheckMark} alt={(pinValue.length < min)} />
        </Button>
    </div>
</div>

<!-- The style remains unchanged -->
<style lang="scss">
    /* Base */
    .pin-input-group {
        position: relative;
        height: fit-content;
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--gap);

        .pin-display {
            display: inline-flex;
            gap: var(--gap);
            justify-content: center;
            padding: var(--padding) 0;

            .dot {
                width: var(--font-size);
                height: var(--font-size);
                background-color: var(--color);
                transition: all ease var(--animation-speed);
                border-radius: 50%;
                border: var(--border-width) solid var(--border-color);
                display: inline-block;

                &.filled {
                    background-color: var(--info-color);
                }
            }
        }

        .shadow-input {
            position: absolute;
            top: calc(var(--padding) / 1.5);
            left: 0;

            input {
                background-color: transparent;
                height: 100%;
                width: 100%;
                color: transparent;
                border: none;
                outline: none;

                &::-webkit-outer-spin-button,
                &::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
                }

                &[type=number] {
                -moz-appearance: textfield;
                     appearance: textfield;
                }

                &::selection {
                background: transparent;
                }
            }
        }

        .pin-keypad {
            width: calc((var(--input-height) * 3) + (var(--gap) * 3));
            display: inline-flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            gap: var(--gap);
        }
    }

    /* Accessibility */
    .pin-group:focus-within {
        .dot {
        transition: all var(--animation-speed);
        box-shadow: 0 0 0 var(--shadow-depth) var(--focus-color);
        }
    }
</style>