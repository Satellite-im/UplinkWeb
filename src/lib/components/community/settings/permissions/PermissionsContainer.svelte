<script lang="ts">
    import PermissionSwitch from "$lib/elements/PermissionSwitch.svelte"
    import type { Permission } from "$lib/types"

    export let permissions: Permission[] = []
</script>

<div class="permissions-container">
    {#each permissions as permission}
        <div class="permission">
            <div class="permission-description">{permission.description}</div>
            <div class="permission-switch">
                <PermissionSwitch state={permission.state} />
            </div>
        </div>
    {/each}
</div>

<style lang="scss">
    .permissions-container {
        display: flex;
        flex-direction: column;
        gap: var(--gap);
        background-color: var(--opaque-color);
        border-radius: var(--border-radius);
        padding: var(--padding);

        .permission {
            display: flex;
            flex-direction: row;
            gap: var(--gap);
            align-items: center;
            justify-content: space-between;

            .permission-description {
                flex: 1;
            }

            .permission-switch {
                flex: 0;
            }
        }
    }
</style>
