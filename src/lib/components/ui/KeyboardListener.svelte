<script lang="ts">
    import { KeybindState } from "$lib/enums"
    import type { Keybind } from "$lib/types"
    import { onMount, onDestroy } from "svelte"
    import { createEventDispatcher } from "svelte"

    export let keybinds: Keybind[] = []

    const dispatch = createEventDispatcher()

    interface Recording {
        key: string
        modifiers: string[]
    }

    let keyboardRecording: Recording = { key: "", modifiers: [] }
    let isRecording = false

    function handleKeyDown(event: KeyboardEvent) {
        if (event.repeat) return // Prevents duplicate keypresses while holding a key down

        let key = event.key
        let modifiers: string[] = []

        if (event.shiftKey) modifiers.push("shift")
        if (event.ctrlKey) modifiers.push("ctrl")

        keyboardRecording = { key, modifiers } // Update recording
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

        // Stop recording
        isRecording = false
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)
    })

    onDestroy(() => {
        window.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("keyup", handleKeyUp)
    })
</script>
