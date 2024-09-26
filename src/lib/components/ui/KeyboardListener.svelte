<script lang="ts">
    import { KeybindState } from "$lib/enums"
    import type { Keybind } from "$lib/types"
    import { onMount } from "svelte"
    import { createEventDispatcher } from "svelte"

    export let keybinds: Keybind[] = []

    const dispatch = createEventDispatcher()

    interface Recording {
        key: string
        modifiers: string[]
    }

    let isRecording = false

    function handleKeyDown(event: KeyboardEvent) {
        if (event.repeat) return

        let modifiers: string[] = []

        if (event.shiftKey) modifiers.push("shift")
        if (event.ctrlKey) modifiers.push("ctrl")
        if (event.altKey) modifiers.push("alt")

        let key = event.key.toWellFormed()
        if (event.altKey) {
            if (event.code.startsWith("Key")) {
                key = event.code.replace("Key", "")
            } else if (event.code.startsWith("Digit")) {
                key = event.code.replace("Digit", "")
            }
        }

        isRecording = true

        dispatch("event", { key, modifiers, state: KeybindState.Pressed })

        keybinds.forEach(keybind => {
            if (keybind.key === key && keybind.modifiers.sort().join() === modifiers.sort().join()) {
                dispatch("matchRelease", keybind)
            }
        })
    }

    function handleKeyUp(event: KeyboardEvent) {
        if (!isRecording) return

        let key = event.key
        let modifiers: string[] = []

        if (event.shiftKey) modifiers.push("shift")
        if (event.ctrlKey) modifiers.push("ctrl")

        dispatch("event", { key, modifiers, state: KeybindState.Released })

        keybinds.forEach(keybind => {
            if (keybind.key === key && keybind.modifiers.sort().join() === modifiers.sort().join()) {
                dispatch("match", keybind)
            }
        })

        isRecording = false
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("keyup", handleKeyUp)
        }
    })
</script>
