<script lang="ts">
    import { goto } from "$app/navigation"
    import { page } from "$app/stores"
    import { Route } from "$lib/enums"
    import { PageState } from "$lib/state/page/PageStates"
    import { onMount } from "svelte"

    let { user } = $page.params

    onMount(() => {
        PageState.addFriend.set(user)
        goto(Route.Friends)
    })
</script>

<div></div>

<style lang="scss">
</style>
