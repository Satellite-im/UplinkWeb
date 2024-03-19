<script lang="ts">
    import { Appearance, Shape, Size } from "$lib/enums"
    import { Button, Icon, Text } from "$lib/elements"
    import { defaultUser, type User } from "$lib/types"
    import { Controls, ProfilePicture } from ".."
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'

    initLocale()
    
    export let friend: User = defaultUser
</script>

<div class="friend">
    <ProfilePicture 
        size={Size.Small} 
        image={friend.profile.photo.image} 
        status={friend.profile.status} />
    <Text class="username">
        {friend.name}
    </Text>
    <Controls>
        <Button 
            text={$_("chat.chat")}>
            <Icon icon={Shape.ChatBubble} />
        </Button>
        <Button 
            icon 
            appearance={Appearance.Alt} 
            tooltip={$_("generic.remove")}>
            <Icon icon={Shape.UserMinus} />
        </Button>
        <Button 
            icon 
            appearance={Appearance.Alt} 
            tooltip={$_("friends.block")}>
            <Icon icon={Shape.NoSymbol} />
        </Button>
    </Controls>
</div>

<style lang="scss">
    
</style>