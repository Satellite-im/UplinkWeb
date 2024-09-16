<script>
    import { v4 as uuidv4 } from "uuid"

    export let breakpoint = 0

    let id = uuidv4()
    let dynamicStyle = `
        .controls {
            display: inline-flex;
            min-width: fit-content;
            height: fit-content;
            gap: var(--gap-less);
        }


        @media (max-width: ${breakpoint}px) {
            .controlsWithBreakpoint_${id} {
                flex-direction: column;
            }
        }
    `

    let existingStyleToApplyBreakpoint = document.querySelector("style")
    if (existingStyleToApplyBreakpoint) {
        existingStyleToApplyBreakpoint.appendChild(document.createTextNode(dynamicStyle))
    }
</script>

<div id={id} class="controls controlsWithBreakpoint_{id}">
    <slot></slot>
</div>

<style lang="scss">
    .controls {
        display: inline-flex;
        min-width: fit-content;
        height: fit-content;
        gap: var(--gap-less);
    }
</style>
