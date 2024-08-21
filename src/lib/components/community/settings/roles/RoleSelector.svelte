<script lang="ts">
    import Label from "$lib/elements/Label.svelte"
    import Select from "$lib/elements/Select.svelte"
    import { mockRoles } from "$lib/mock/community"
    import type { Role } from "$lib/types"

    export let roles: Role[] = mockRoles

    let options = roles.map(role => {
        return {
            value: role.id,
            text: role.name,
        }
    })
</script>

<div class="role-selector">
    <Label text="Select Role"></Label>
    <Select options={options} alt />
</div>

<style lang="scss"></style>
