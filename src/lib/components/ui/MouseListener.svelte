<script lang="ts">
    import { MouseButtons } from "$lib/enums"
    import { onMount, createEventDispatcher } from "svelte"

    const dispatch = createEventDispatcher()

    function handleMouseDown(event: MouseEvent) {
        const buttonEnum = MouseButtons[event.button]

        if (buttonEnum !== undefined) {
            dispatch("clicked", buttonEnum)
        }
    }

    onMount(() => {
        window.addEventListener("mousedown", handleMouseDown)
        return () => {
            window.removeEventListener("mousedown", handleMouseDown)
        }
    })
</script>
