<script lang="ts">
    import { KeybindState } from "$lib/enums"
    import type { Keybind } from "$lib/types"
    import { onMount, onDestroy } from "svelte"
    import { createEventDispatcher } from "svelte"

    export let keybinds: Keybind[] = []

    const dispatch = createEventDispatcher()

    function handleKeyDown(event: KeyboardEvent) {
        if (event.repeat) return // Prevents duplicate keypresses while holding a key down

        let modifiers: string[] = []

        if (event.shiftKey) modifiers.push("shift")
        if (event.ctrlKey) modifiers.push("ctrl")
        if (event.altKey) modifiers.push("alt")

        let key = event.key.toWellFormed()
        if (event.altKey) {
            if (event.code.startsWith('Key')) {
                key = event.code.replace('Key', '')
            } else if (event.code.startsWith('Digit')) {
                key = event.code.replace('Digit', '')
            }
        }


        dispatch("event", { key, modifiers, state: KeybindState.Pressed })

        keybinds.forEach(keybind => {
            if (keybind.key === key && keybind.modifiers.sort().join() === modifiers.sort().join()) {
                dispatch("matchRelease", keybind)
            }
        })
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeyDown)
    })

    onDestroy(() => {
        window.removeEventListener("keydown", handleKeyDown)
    })
</script>
