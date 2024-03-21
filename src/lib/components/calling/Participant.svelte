<script lang="ts">
    import { Size } from "$lib/enums";
    import { defaultUser, type User } from "$lib/types"
    import { ProfilePicture } from ".."

    export let participant: User = defaultUser
</script>


<div class="participant">
    <ProfilePicture image={participant.profile.photo.image} size={Size.Larger}/>
</div>

<style lang="scss">
    .participant {
        width: fit-content;
        height: fit-content;
    }
</style>