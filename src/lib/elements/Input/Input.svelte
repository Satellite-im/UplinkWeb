<script lang="ts">
    import { InputRules } from "./inputRules"
    import { Appearance } from "../../enums/index"
    import { MarkdownEditor } from "markdown-editor"
    import "./markdown.scss"
    import { createEventDispatcher, onMount } from "svelte"
    import { EditorView } from "@codemirror/view"
    import { writable } from "svelte/store"
    import Text from "../Text.svelte"
    import { debounce } from "$lib/utils/Functions"

    export let placeholder: string = ""
    export let hook: string = ""
    export let alt: boolean = false
    export let rounded: boolean = false
    export let highlight: Appearance = Appearance.Default
    export let value: string = ""
    export let disabled: boolean = false
    export let tooltip: string | null = ""
    export let copyOnInteract: boolean = false
    export let centered: boolean = false
    export let rich: boolean = false
    export let autoFocus: boolean = false
    export let rules: InputRules = new InputRules()

    let errorMessage: string = ""

    function isValidInput(): boolean {
        if (rules.required && !value) {
            errorMessage = "This field is required."
            return false
        }
        if (value.length < rules.minLength) {
            errorMessage = `Minimum length is ${rules.minLength} characters.`
            return false
        }
        if (value.length > rules.maxLength) {
            errorMessage = `Maximum length is ${rules.maxLength} characters.`
            return false
        }
        if (rules.pattern && !rules.pattern.test(value)) {
            errorMessage = "Invalid format."
            return false
        }
        errorMessage = ""
        return true
    }

    const debouncedOnInput = debounce(() => {
        let isValid = isValidInput()
        dispatch("isValid", isValid)
        dispatch("input", value)
    }, 5)

    if (copyOnInteract) {
        tooltip = "Copy"
        disabled = true
    }

    let clazz = ""
    $: input = writable<HTMLElement | null>(null)
    const dispatch = createEventDispatcher()
    const writableValue = writable(value)

    $: writableValue.set(value)
    $: value = $writableValue

    let onsend: any[] = []
    let editor: MarkdownEditor

    $: if (rich && $input && (!editor || !Array.from($input.parentNode!.children).some(el => el === editor.codemirror.dom))) {
        if (editor) {
            editor.codemirror.destroy()
        }
        let input = $input
        editor = new MarkdownEditor(input, {
            keys: MarkdownEditor.ChatEditorKeys(() => send()),
            only_autolink: true,
            extensions: [EditorView.editorAttributes.of({ class: input.classList.toString() })],
        })
        // Init editor with initial value
        editor.value(value)
        let line = editor.codemirror.state.doc.line(editor.codemirror.state.doc.lines)
        editor.codemirror.dispatch({
            selection: { head: line.to, anchor: line.to },
        })
        if (autoFocus) editor.codemirror.focus()
        // @ts-ignore
        editor.updatePlaceholder(input.placeholder)
        editor.registerListener("input", ({ value: val }: { value: string }) => {
            writableValue.set(val)
            onInput()
        })
        onsend.push(() => {
            editor.value("")
        })
    }

    $: if (rich && editor) {
        if (editor.value() !== $writableValue) editor.value($writableValue)
    }

    export { clazz as class }

    const send = () => {
        dispatch("enter", value)
        onsend.forEach(e => e())
    }

    function onInput() {
        debouncedOnInput()
    }

    function onBlur() {
        dispatch("blur")
    }

    function onKeyDown(event: KeyboardEvent) {
        if (event.code === "Enter") {
            send()
        }
    }

    function handleFocus(event: FocusEvent) {
        const input = event.target as HTMLInputElement
        requestAnimationFrame(() => {
            input.select()

            const mouseupListener = () => {
                input.removeEventListener("mouseup", mouseupListener)
                return false
            }

            input.addEventListener("mouseup", mouseupListener)
        })
    }
</script>

{#key hook}
    <div
        id={hook}
        data-cy={hook}
        class="input-group {alt ? 'alt' : ''} {highlight !== null ? `highlight-${highlight}` : ''} {tooltip ? 'tooltip' : ''} {clazz || ''} {rich ? 'multiline' : ''}"
        data-tooltip={tooltip}
        role="none"
        on:click={async _ => {
            if (copyOnInteract) {
                await navigator.clipboard.writeText(`${value}`)
            }
        }}>
        <div class="input-container {rounded ? 'rounded' : ''} {clazz || ''} {rich ? 'multiline' : ''}">
            <slot></slot>
            <!-- svelte-ignore a11y-autofocus -->
            <input
                class="input {centered ? 'centered' : ''} {disabled ? 'disabled' : ''}"
                type="text"
                bind:this={$input}
                on:focus={handleFocus}
                bind:value={$writableValue}
                placeholder={placeholder}
                on:keydown={onKeyDown}
                on:input={onInput}
                on:blur={onBlur}
                autofocus={autoFocus} />
        </div>
    </div>
    {#if errorMessage}
        <Text appearance={Appearance.Warning}>{errorMessage}</Text>
    {/if}
{/key}

<style lang="scss">
    .input-group {
        min-height: var(--input-height);
        height: var(--input-height);
        display: inline-flex;
        flex-direction: row;
        transition: all var(--animation-speed);
        width: 100%;

        .input-container {
            border: var(--border-width) solid var(--border-color);
            border-radius: var(--border-radius-minimal);
            background-color: var(--alt-color);
            color: var(--color);
            display: inline-flex;
            gap: var(--gap);
            align-items: center;
            width: fit-content;
            min-height: var(--input-height);
            height: var(--input-height);
            transition: all var(--animation-speed);
            padding: 0 var(--padding);
            flex: 1;

            &.rounded {
                border-radius: var(--border-radius-more);
            }

            &.multiline {
                height: fit-content;
            }
        }

        &.multiline {
            height: fit-content;
        }

        .input {
            background-color: transparent;
            border: none;
            flex: 1;
            width: 100%;
            color: var(--color);
            cursor: text;

            &.disabled {
                cursor: initial;
                user-select: none;
                pointer-events: none;
            }

            &.centered {
                text-align: center;
            }

            &:focus {
                outline: none;
                border: none;
            }

            &::placeholder {
                color: var(--placeholder-color);
                opacity: 0.75;
                font-size: var(--label-size);
            }
        }

        .input.disabled {
            cursor: not-allowed;
            background-color: var(--disabled-color);
            color: var(--disabled-color);
            opacity: 0.6;
        }

        &.alt {
            .input-container {
                background-color: var(--alt-color);
            }

            .input {
                color: var(--color);

                &::placeholder {
                    color: var(--placeholder-color);
                }
            }
        }

        .input-container:focus-within {
            box-shadow: 0 0 0 var(--shadow-depth) var(--focus-color);
        }

        &.highlight-error .input-container,
        &.highlight-error .svg-icon {
            border-color: var(--error-color);
            color: var(--error-color);
        }

        &.highlight-warning .input-container,
        &.highlight-warning .svg-icon {
            border-color: var(--warning-color);
            color: var(--warning-color);
        }

        &.highlight-info .input-container,
        &.highlight-info .svg-icon {
            border-color: var(--info-color);
            color: var(--info-color);
        }

        &.highlight-success .input-container,
        &.highlight-success .svg-icon {
            border-color: var(--success-color);
            color: var(--success-color);
        }

        // Tooltip styles
        &.tooltip {
            position: relative;

            &:before {
                display: none;
                content: attr(data-tooltip);
                position: absolute;
                bottom: calc(100% + var(--gap));
                white-space: nowrap;
                width: fit-content;
                padding: var(--padding-minimal) var(--padding-less);
                border-radius: var(--border-radius-minimal);
                border: var(--border-width) solid var(--border-color);
                color: var(--color);
                font-size: var(--font-size-smaller);
                text-align: center;
                opacity: 0;
                pointer-events: none;
                z-index: 2;
                transition: all var(--animation-speed);
                background-color: var(--opaque-color);
                backdrop-filter: blur(var(--blur-radius));
                -webkit-backdrop-filter: blur(var(--blur-radius));
            }

            &.tooltip-right:before {
                bottom: unset;
                top: 50%;
                transform: translateY(-50%);
                left: 100%;
                margin-left: var(--gap);
            }

            &.tooltip-left:before {
                bottom: unset;
                top: 50%;
                transform: translateY(-50%);
                right: 100%;
                margin-right: var(--gap);
            }

            &.tooltip-bottom:before {
                top: calc(100% + var(--gap));
            }

            &:hover:before {
                opacity: 1;
                display: inline;
            }

            &.icon {
                &:before {
                    display: flex;
                }
            }
        }
    }
</style>
