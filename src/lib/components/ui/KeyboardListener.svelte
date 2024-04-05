<script lang="ts">
    import type { Keybind } from "$lib/types"
    import { onMount, onDestroy } from "svelte"
    import { createEventDispatcher } from "svelte"
    
    export let keybinds: Keybind[] = []
  
    const dispatch = createEventDispatcher()
  
    function handleKeyDown(event: KeyboardEvent) {
        let key = event.key
        let modifiers: string[] = []

        if (event.shiftKey) modifiers.push("shift")
        if (event.ctrlKey) modifiers.push("ctrl")

        dispatch("event", { key, modifiers })

        keybinds.forEach((keybind) => {
            if (keybind.key === key &&
                keybind.modifiers.sort().join() === modifiers.sort().join()) {
                dispatch("match", keybind)
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