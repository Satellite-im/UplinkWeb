<script lang="ts">
    import { createEventDispatcher, onDestroy } from "svelte"
    import { Icon, Text } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import Button from "$lib/elements/Button.svelte"
    import { Controls } from "$lib/layouts"

    export let walletPosition = { top: 50, left: 50 }
    let dragging = false
    let startX = 0
    let startY = 0
    const dispatch = createEventDispatcher()
    function handleClose() {
        dispatch("close")
    }
    function onMouseDown(event: MouseEvent) {
        dragging = true
        startX = event.clientX - walletPosition.left
        startY = event.clientY - walletPosition.top

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
    }

    function onMouseMove(event: MouseEvent) {
        if (dragging) {
            walletPosition.left = event.clientX - startX
            walletPosition.top = event.clientY - startY
        }
    }

    function onMouseUp() {
        dragging = false
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
    }

    onDestroy(() => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
    })
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="toolbar" on:mousedown={onMouseDown}>
    <Icon icon={Shape.DragHandle} muted />

    <div class="title">
        <Text muted size={Size.Smaller}>Wallet</Text>
    </div>
    <Controls>
        <Button appearance={Appearance.Alt} icon small on:click={() => handleClose()}>
            <Icon icon={Shape.XMark} />
        </Button>
    </Controls>
</div>

<style lang="scss">
    .toolbar {
        display: inline-flex;
        align-items: center;
        flex-direction: row;
        cursor: grab;
        gap: var(--gap-less);
        user-select: none;

        .handle {
            align-items: center;
        }

        .title {
            display: inline-flex;
            flex: 1;
        }
    }
</style>
