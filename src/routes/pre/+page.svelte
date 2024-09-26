<script lang="ts">
    import { Route, Size } from "$lib/enums"
    import { Text } from "$lib/elements"
    import Logo from "$lib/elements/Logo.svelte"
    import { goto } from "$app/navigation"
    import { _ } from "svelte-i18n"

    let stepLabels: string[] = ["Fetching your friends from space.", "Aligning multiple satellites.", "Spinning up warp drives.", "Initializing forward shields for maximum safety.", "Almost ready, finalizing."]
    let step: number = 0
    let loadingTime: number = 1000

    const stepAhead = function () {
        if (step < stepLabels.length - 1) {
            step++
            loadingTime -= 200
            setTimeout(stepAhead, loadingTime)
        } else {
            goto(Route.Chat)
        }
    }

    setTimeout(stepAhead, loadingTime)
</script>

<div id="page">
    <Logo />
    <Text size={Size.Small}>{$_("generic.initializing")}</Text>
    <Text>{stepLabels[step]}</Text>
</div>

<style lang="scss">
    #page {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: var(--gap);
        height: 100%;
    }
</style>
