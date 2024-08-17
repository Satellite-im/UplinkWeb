<script lang="ts">
    import { corePermissions } from "$lib/defaults/community/Permissions"
    import Label from "$lib/elements/Label.svelte"
    import { PermissionCategory } from "$lib/enums/community"
    import type { Permission } from "$lib/types"
    import PermissionsContainer from "./PermissionsContainer.svelte"

    let permissions: Permission[] = corePermissions
    let permissionCategories: PermissionCategory[] = Object.values(PermissionCategory)
</script>

<div id="community-permissions">
    <Label text=" Set Permissions"></Label>
    {#each permissionCategories as category}
        <Label text={category.toUpperCase()}></Label>
        <PermissionsContainer permissions={permissions.filter(permission => permission.category === category)} />
    {/each}
</div>

<style lang="scss">
    #community-permissions {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        flex: 1;
        height: fit-content;
    }
</style>
