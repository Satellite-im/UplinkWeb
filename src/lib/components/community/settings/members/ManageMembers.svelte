<script lang="ts">
    import { mockRoles } from "$lib/mock/community"
    import { mock_users } from "$lib/mock/users"
    import type { Member } from "$lib/types"

    let memebers: Member[] = [
        {
            user: mock_users[0],
            roles: [mockRoles[0]],
            permissions: [],
        },
        {
            user: mock_users[1],
            roles: [mockRoles[1]],
            permissions: [],
        },
    ]
</script>

<div class="manage-memebers"></div>

<style lang="scss"></style>
