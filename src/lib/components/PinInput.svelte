<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte"
    import { Appearance, Shape } from "$lib/enums"

    import { Button, Icon, Spacer, Loader, Switch, Label } from "$lib/elements"

    import { _ } from "svelte-i18n"

    export let error: boolean = false
    export let loading: boolean = false
    export let scramble: boolean = false
    export let showSettings: boolean = false
    export let min: number = 4
    export let max: number = 6

    let pinValue: string = "" // This holds the actual pin value
    let displayDots: Array<boolean> = [] // This holds the state for each dot (filled or not)

    // Initialize or shuffle digits for the keypad
    const pinDigitsOriginal: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    let pinDigits: string[] = [...pinDigitsOriginal]

    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray<T>(array: T[]): T[] {
        if (scramble)
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[array[i], array[j]] = [array[j], array[i]]
            }
        return array
    }

    // Update the pin value and the display dots
    const updatePinValue = (digit: string) => {
        dispatch("updatePinValue", digit)
        if (pinValue.length < max) {
            pinValue += digit
            updateDisplayDots()
        }
    }

    // Update display dots based on the current pin value
    const updateDisplayDots = () => {
        displayDots = pinValue.length < min ? Array.from({ length: min }, (_, i) => i < pinValue.length) : Array.from({ length: pinValue.length }, () => true)
        pinDigits = scramble ? shuffleArray(pinDigits) : [...pinDigitsOriginal]
    }

    // Clear the pin value and update display dots
    const clearPinValue = () => {
        pinValue = ""
        updateDisplayDots()
    }

    // Create an event dispatcher
    const dispatch = createEventDispatcher()

    // Function to dispatch a 'click' event
    function onSubmit(pin: string) {
        dispatch("submit", pin)
    }
    // Placeholder for submit action
    const submitPinValue = () => {
        onSubmit(pinValue)
        clearPinValue()
    }

    function handleKeyDown(event: { key: any }) {
        const key = event.key
        // Check if the key is a digit
        if (!isNaN(key) && key !== " ") {
            updatePinValue(key)
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeyDown)
        updateDisplayDots()
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    })

    function handleToggleScramble(value: any) {
        scramble = value.detail
        pinDigits = scramble ? shuffleArray(pinDigits) : [...pinDigitsOriginal]
    }

    function handleInput(event: any) {
        const input = event.target.value
        if (input.length <= max) {
            pinValue = input
            updateDisplayDots()
        }
    }

    $: pinValue, updateDisplayDots()
</script>

<div class="pin-input-group {loading ? 'loading' : ''}">
    <div class="pin-group">
        <div class="pin-display {error ? 'error' : ''}">
            {#each displayDots as dot}
                <span class="dot {dot ? 'filled' : ''}"></span>
            {/each}
        </div>
        <div class="shadow-input">
            <input type="number" on:input={handleInput} pattern="[0-9]*" />
        </div>
    </div>
    <Spacer less />
    {#key pinDigits.join()}
        <div class="pin-keypad" data-keyorder={pinDigits.join()} data-shuffle="true" data-cy="pin-keypad">
            {#each pinDigits.slice(0, -1) as digit}
                <Button class="pin-key" testid="button-pin-{digit}" icon disabled={error || loading} on:click={() => updatePinValue(digit)} appearance={Appearance.Alt}>
                    {#if loading}
                        <Loader />
                    {:else}
                        {digit}
                    {/if}
                </Button>
            {/each}
            <Button class="pin-key" disabled={loading} testid="button-clear-input" rotateOnHover on:click={clearPinValue} appearance={Appearance.Error}>
                {#if loading}
                    <Loader alt />
                {:else}
                    <Icon icon={Shape.Refresh} />
                {/if}
            </Button>
            <Button class="pin-key" disabled={error || loading} testid="button-pin-{pinDigits.slice(-1)}" icon on:click={() => updatePinValue(pinDigits.slice(-1).toString())} appearance={Appearance.Alt}>
                {#if loading}
                    <Loader />
                {:else}
                    {pinDigits.slice(-1)}
                {/if}
            </Button>
            <Button class="pin-key" icon on:click={submitPinValue} testid="button-confirm-pin" appearance={pinValue.length < min && !loading ? Appearance.Alt : Appearance.Success} disabled={pinValue.length < min || error || loading}>
                {#if loading}
                    <Loader alt />
                {:else}
                    <Icon icon={Shape.CheckMark} alt={pinValue.length < min} />
                {/if}
            </Button>
        </div>
    {/key}
    <Spacer less />
    <div class="flex-column">
        <Button
            outline={!showSettings}
            testid="button-settings"
            appearance={Appearance.Alt}
            on:click={_ => {
                showSettings = !showSettings
            }}>
            <Icon icon={showSettings ? Shape.ChevronDown : Shape.ChevronRight} /> Settings
        </Button>
        <div class="pin-settings flex-column {showSettings ? 'visible' : 'hidden'}">
            <div class="flex-row setting">
                <Switch on={scramble} on:toggle={handleToggleScramble} />
                <Label text={$_("pages.auth.unlock.scramble_pin")} />
            </div>
            <hr class="divider" />
            <div class="flex-row setting">
                <Switch />
                <Label text="Stay unlocked?" />
            </div>
        </div>
    </div>
</div>

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

        .pin-settings {
            max-height: fit-content;
            overflow: hidden;
            transition: all var(--animation-speed) ease;
            background-color: var(--background-color);
            padding: var(--padding);
            border-radius: var(--border-radius);
            border: var(--border-width) solid var(--border-color);
            display: inline-flex;
            gap: var(--gap-less);
            justify-content: space-between;

            &.hidden {
                opacity: 0;
            }

            &.visible {
                opacity: 1;
            }

            .setting {
                display: inline-flex;
                justify-content: space-between;
            }
        }

        &.loading {
            cursor: wait;

            input {
                pointer-events: none;
            }
        }

        .pin-display {
            display: inline-flex;
            gap: var(--gap);
            justify-content: center;
            padding: var(--padding) 0;
            cursor: text;

            .dot {
                width: var(--font-size);
                height: var(--font-size);
                background-color: var(--color);
                transition: all ease var(--animation-speed);
                border-radius: 50%;
                border: var(--border-width) solid var(--border-color);
                display: inline-block;

                &.filled {
                    background-color: var(--primary-color);
                }
            }

            &.error {
                .dot {
                    border: var(--error-color) solid var(--border-width);
                    background-color: var(--color-alt);
                    &.filled {
                        background-color: var(--error-color);
                    }
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

                &[type="number"] {
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
