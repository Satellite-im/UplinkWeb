<script lang="ts">
    import { Select } from "$lib/elements"
    import { createPersistentState } from "$lib/state"
    import { onMount, onDestroy } from "svelte"
    import { writable, get } from "svelte/store"

    let gamepadIndex: number | null = null
    let previousButtonStates: boolean[] = []
    let animationFrameId: number | null = null
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let lastHoveredElement: Element | null = null
    let lastAngle = 0

    export let gui: boolean = false

    // Modify this section to change the controller button mappings
    const actions: Record<number, string> = {
        0: "A", // A
        1: "B", // B
        2: "X", // X
        3: "Y", // Y
        4: "LeftClick", // Left Bumper
        5: "RightClick", // Right Bumper
        6: "Forward", // Left Trigger
        7: "Back", // Right Trigger
        8: "LeftMenu", // Left Menu
        9: "RightMenu", // Right Menu
        10: "Button10", // Left Stick In
        11: "Button11", // Right Stick In
        12: "ArrowUp", // D-Pad Up
        13: "ArrowDown", // D-Pad Down
        14: "ArrowLeft", // D-Pad Left
        15: "ArrowRight", // D-Pad Right
    }

    const deadzone = createPersistentState("gamepad.deadzone", 0.1)
    const pointerSensitivity = createPersistentState("gamepad.sensitivity", 5)

    const buttonMap = writable<{ [key: number]: string }>(actions)
    const buttonStates = writable<{ [key: number]: boolean }>({})
    const controllerConnected = writable<boolean>(false)
    const leftJoystick = writable<{ x: number; y: number }>({ x: 0, y: 0 })
    const rightJoystick = writable<{ x: number; y: number }>({ x: 0, y: 0 })
    const hoveredElement = writable<Element | null>(null)
    const isScrolling = writable<boolean>(false)
    const controllerInfo = writable<string | null>(null)

    onMount(() => {
        window.addEventListener("gamepadconnected", connectHandler)
        window.addEventListener("gamepaddisconnected", disconnectHandler)
        startAnimationFrameLoop()
    })

    onDestroy(() => {
        window.removeEventListener("gamepadconnected", connectHandler)
        window.removeEventListener("gamepaddisconnected", disconnectHandler)
        stopAnimationFrameLoop()
    })

    const startAnimationFrameLoop = () => {
        if (animationFrameId === null) {
            animationFrameId = requestAnimationFrame(update)
        }
    }

    const stopAnimationFrameLoop = () => {
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = null
        }
    }

    const connectHandler = (event: GamepadEvent) => {
        gamepadIndex = event.gamepad.index
        previousButtonStates = new Array(event.gamepad.buttons.length).fill(false)
        buttonStates.set({})
        controllerConnected.set(true)
        getControllerInfo()
        startAnimationFrameLoop()
    }

    const disconnectHandler = () => {
        gamepadIndex = null
        previousButtonStates = []
        buttonStates.set({})
        controllerConnected.set(false)
        controllerInfo.set(null)
        stopAnimationFrameLoop()
    }

    const update = () => {
        if (gamepadIndex !== null) {
            const gamepad = navigator.getGamepads()[gamepadIndex]
            if (gamepad) handleGamepadInput(gamepad)
        }
        animationFrameId = requestAnimationFrame(update)
    }

    const applyDeadzone = (value: number) => (Math.abs(value) < get(deadzone) ? 0 : value)

    const handleNavigation = (key: string) => {
        if (!gui) {
            switch (key) {
                case "Tab":
                    focusNextElement()
                    break
                case "Shift+Tab":
                    focusPreviousElement()
                    break
                case "ArrowUp":
                    focusPreviousElement()
                    break
                case "ArrowDown":
                    focusNextElement()
                    break
                case "Enter":
                    activateElement()
                    break
                case "Back":
                    navigateBack()
                    break
                case "LeftClick":
                    clickMouse()
                    break
                case "RightClick":
                    rightClickMouse()
                    break
                case "Forward":
                    window.history.forward()
                    break
                case "Space":
                    triggerKeyEvent(" ")
                    break
                default:
                    triggerKeyEvent(key)
            }
        }
    }

    const focusNextElement = () => {
        const focusableElements = Array.from(document.querySelectorAll('a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])')).filter((el: any) => !el.hasAttribute("disabled")) as HTMLElement[]
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
        focusableElements[(currentIndex + 1) % focusableElements.length].focus()
    }

    const focusPreviousElement = () => {
        const focusableElements = Array.from(document.querySelectorAll('a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])')).filter((el: any) => !el.hasAttribute("disabled")) as HTMLElement[]
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
        focusableElements[(currentIndex - 1 + focusableElements.length) % focusableElements.length].focus()
    }

    const activateElement = () => (document.activeElement as HTMLElement)?.click()

    const navigateBack = () => window.history.back()

    const clickMouse = () => {
        const element = document.elementFromPoint(mouseX, mouseY) as HTMLElement

        if (element) {
            // Focus the element if it's an input or select
            if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
                element.focus()

                // If the element is a select box, trigger a spacebar key event after a small delay
                if (element instanceof HTMLSelectElement) {
                    const spacebarEvent = new KeyboardEvent("keydown", {
                        key: " ",
                        code: "Space",
                        keyCode: 32,
                        which: 32,
                        bubbles: true,
                    })
                    element.dispatchEvent(spacebarEvent)

                    const spacebarEventUp = new KeyboardEvent("keyup", {
                        key: " ",
                        code: "Space",
                        keyCode: 32,
                        which: 32,
                        bubbles: true,
                    })
                    element.dispatchEvent(spacebarEventUp)
                } else {
                    // Add a small delay before triggering the mouse click events
                    setTimeout(() => {
                        // Dispatch mousedown event
                        const mousedownEvent = new MouseEvent("mousedown", {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                            clientX: mouseX,
                            clientY: mouseY,
                        })
                        element.dispatchEvent(mousedownEvent)

                        // Dispatch mouseup event
                        const mouseupEvent = new MouseEvent("mouseup", {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                            clientX: mouseX,
                            clientY: mouseY,
                        })
                        element.dispatchEvent(mouseupEvent)

                        // Dispatch click event
                        const clickEvent = new MouseEvent("click", {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                            clientX: mouseX,
                            clientY: mouseY,
                        })
                        element.dispatchEvent(clickEvent)
                    }, 100) // 100 milliseconds delay
                }
            } else {
                // Dispatch mousedown event
                const mousedownEvent = new MouseEvent("mousedown", {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: mouseX,
                    clientY: mouseY,
                })
                element.dispatchEvent(mousedownEvent)

                // Dispatch mouseup event
                const mouseupEvent = new MouseEvent("mouseup", {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: mouseX,
                    clientY: mouseY,
                })
                element.dispatchEvent(mouseupEvent)

                // Dispatch click event
                const clickEvent = new MouseEvent("click", {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: mouseX,
                    clientY: mouseY,
                })
                element.dispatchEvent(clickEvent)
            }
        }
    }

    const rightClickMouse = () => {
        const element = document.elementFromPoint(mouseX, mouseY)
        const event = new MouseEvent("contextmenu", {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: mouseX,
            clientY: mouseY,
        })
        element?.dispatchEvent(event)
        if (element instanceof HTMLInputElement) element.focus()
    }

    const triggerKeyEvent = (key: string) => {
        const event = new KeyboardEvent("keydown", {
            key,
            code: key,
            keyCode: keyToKeyCode(key),
            which: keyToKeyCode(key),
            bubbles: true,
        })
        document.dispatchEvent(event)
    }

    const keyToKeyCode = (key: string) =>
        ({
            ArrowUp: 38,
            ArrowDown: 40,
            ArrowLeft: 37,
            ArrowRight: 39,
            Enter: 13,
            Tab: 9,
            " ": 32,
            Circle: 79,
            Square: 81,
            Triangle: 84,
            L1: 76,
            R1: 82,
            L2: 90,
            R2: 88,
            Share: 83,
            Options: 80,
            L3: 67,
            R3: 86,
            PSButton: 91,
            Touchpad: 93,
        })[key]

    const handleGamepadInput = (gamepad: Gamepad) => {
        const newButtonStates: { [key: number]: boolean } = {}
        gamepad.buttons.forEach((button, index) => {
            newButtonStates[index] = button.pressed
            if (button.pressed && !previousButtonStates[index]) {
                console.log("button", index)

                buttonMap.subscribe(map => {
                    const action = map[index]
                    if (action) handleNavigation(action)
                })
            }
            previousButtonStates[index] = button.pressed
        })
        buttonStates.set(newButtonStates)

        const [lx, ly, rx, ry] = gamepad.axes.map(applyDeadzone)
        const speed = get(pointerSensitivity)
        mouseX = Math.max(0, Math.min(window.innerWidth, mouseX + lx * speed))
        mouseY = Math.max(0, Math.min(window.innerHeight, mouseY + ly * speed))
        if (!gui) {
            moveVirtualMouse(mouseX, mouseY, lx, ly)
        }
        leftJoystick.set({ x: lx, y: ly })
        rightJoystick.set({ x: rx, y: ry })

        if (ry !== 0) {
            const element = get(hoveredElement) as HTMLElement
            if (element) {
                const scrollableParent = findScrollableParent(element)
                if (scrollableParent) {
                    isScrolling.set(true)
                    scrollableParent.scrollTop += ry * speed
                }
            }
        } else {
            isScrolling.set(false)
        }
    }

    const moveVirtualMouse = (x: number, y: number, lx: number, ly: number) => {
        const mouse = document.getElementById("virtual-mouse")
        if (!mouse) return

        mouse.style.left = `${x}px`
        mouse.style.top = `${y}px`
        if (lx !== 0 || ly !== 0) lastAngle = Math.atan2(ly, lx) * (180 / Math.PI)

        const element = document.elementFromPoint(x, y) as HTMLElement
        const img = mouse.querySelector<HTMLImageElement>("img")
        if (element && isInteractive(element)) {
            if (img && !get(isScrolling)) img.src = "/assets/controller/virtual_cursor_hover.png"
            mouse.style.transform = `translate(0%, 0%)`
        } else {
            if (img && !get(isScrolling)) img.src = "/assets/controller/virtual_cursor.png"
            mouse.style.transform = `translate(0%, 0%) rotate(${lastAngle}deg)`
        }

        mouse.dispatchEvent(
            new MouseEvent("mousemove", {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
            })
        )
        if (element) {
            if (lastHoveredElement !== element) {
                lastHoveredElement?.dispatchEvent(
                    new MouseEvent("mouseout", {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y,
                    })
                )
                element.dispatchEvent(
                    new MouseEvent("mouseover", {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y,
                    })
                )
                lastHoveredElement = element
            }
            element.dispatchEvent(
                new MouseEvent("mousemove", {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: x,
                    clientY: y,
                })
            )
            hoveredElement.set(element)
        } else hoveredElement.set(null)
    }

    const isInteractive = (element: Element) => ["A", "BUTTON", "INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || element.hasAttribute("onclick") || isScrollable(element)

    const isScrollable = (element: Element) => {
        const style = window.getComputedStyle(element)
        return (style.overflowY === "scroll" || style.overflowY === "auto") && element.scrollHeight > element.clientHeight
    }

    const findScrollableParent = (element: HTMLElement): HTMLElement | null => {
        if (!element) return null
        return isScrollable(element) ? element : findScrollableParent(element.parentElement!)
    }

    const handleSelectChange = (event: CustomEvent<string>, index: string) => {
        buttonMap.update(map => {
            map[parseInt(index)] = event.detail
            return map
        })
    }

    const getControllerInfo = () => {
        if (gamepadIndex !== null) {
            const gamepad = navigator.getGamepads()[gamepadIndex]
            if (gamepad) {
                controllerInfo.set(`${gamepad.id.split("(")[0]} (${gamepad.mapping})`)
            }
        }
    }
</script>

{#if gui}
    {#if $controllerInfo !== null}
        <div>{$controllerInfo}</div>
    {/if}
    <div class="controller-mappings">
        <div class="left-controls">
            {#each [4, 7, 8, 12, 13, 14, 15, 10] as index}
                <label for="button-{index}">Button {index} ({$buttonMap[+index]})</label>
                <Select options={Object.keys(actions).map(action => ({ value: actions[+action], text: actions[+action] }))} selected={$buttonMap[+index]} alt on:change={event => handleSelectChange(event, index.toString())} />
            {/each}
        </div>
        <div id="controller">
            {#if $controllerConnected}
                <img src="/assets/controller/ps5/controller.png" id="bg" alt="controller" />
                {#each Object.keys($buttonStates) as index}
                    {#if $buttonStates[index]}
                        <img src={`/assets/controller/ps5/${actions[+index].toLowerCase()}.png`} class="button" alt="button" />
                    {/if}
                {/each}
                <img src="/assets/controller/ps5/left-stick.png" class="joystick" id="left-joystick" style="transform: translate({$leftJoystick.x * 15}px, {$leftJoystick.y * 15}px);" alt="left joystick" />
                <img src="/assets/controller/ps5/right-stick.png" class="joystick" id="right-joystick" style="transform: translate({$rightJoystick.x * 15}px, {$rightJoystick.y * 15}px);" alt="right joystick" />
            {:else}
                <img src="/assets/controller/ps5/controller_off.png" id="bg" alt="controller off" />
            {/if}
        </div>
        <div class="right-controls">
            {#each [5, 6, 0, 1, 2, 3, 9, 11] as index}
                <label for="button-{index}">Button {index} ({$buttonMap[+index]})</label>
                <Select options={Object.keys(actions).map(action => ({ value: actions[+action], text: actions[+action] }))} selected={$buttonMap[+index]} alt on:change={event => handleSelectChange(event, index.toString())} />
            {/each}
        </div>
    </div>
    <div id="mapping">
        <h3>Tweak</h3>
        <label for="deadzone">Joystick Deadzone</label>
        <input type="range" id="deadzone" min="0" max="1" step="0.01" bind:value={$deadzone} />
        <span>{$deadzone}</span>
        <label for="sensitivity">Pointer Sensitivity</label>
        <input type="range" id="sensitivity" min="1" max="20" step="1" bind:value={$pointerSensitivity} />
        <span>{$pointerSensitivity}</span>
    </div>
{/if}

{#if $controllerConnected && !gui}
    <div id="virtual-mouse">
        <img src="/assets/controller/virtual_cursor.png" alt="virtual mouse" />
    </div>
{/if}

<style lang="scss">
    .controller-mappings {
        display: flex;
        justify-content: space-between;
        gap: var(--gap);
        align-items: center;

        .left-controls,
        .right-controls {
            flex: 1;
        }

        #controller {
            max-width: 600px;
            position: relative;

            img.button,
            img.joystick {
                position: absolute;
                z-index: 2;
                top: 0;
            }

            #bg {
                position: relative;
                width: 100%;
                height: auto;
                z-index: 1;
            }
        }
    }

    #virtual-mouse {
        z-index: 10000;
        position: absolute;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        pointer-events: none;
        transform-origin: center;
    }

    #mapping {
        margin-top: 20px;

        label {
            margin-right: 10px;
        }

        input[type="range"] {
            margin-bottom: 10px;
            width: 100%;
        }
    }
</style>
