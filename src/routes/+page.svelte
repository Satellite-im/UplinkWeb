<script lang="ts">
    import { page } from "$app/stores"
    import { checkIfUserIsLogged } from "$lib/state/auth"
    import "$lib/lang"

    checkIfUserIsLogged($page.route.id, true)
</script>
