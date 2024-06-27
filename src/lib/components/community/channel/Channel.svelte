<script lang="ts">
    import Icon from "src/lib/elements/Icon.svelte"
    import Text from "src/lib/elements/Text.svelte"
    import { CommunityChannelKind, Shape } from "src/lib/enums"
    import type { CommunityChannel } from "src/lib/types"

    export let channel: CommunityChannel = {
        icon: Shape.Hashtag,
        name: "Default",
        kind: CommunityChannelKind.Text,
    }
</script>

<div class="community-channel">
    <Icon icon={channel.icon} />
    <Text>{channel.name}</Text>
</div>

<style lang="scss">
    .community-channel {
        display: inline-flex;
        flex-direction: row;
        gap: var(--gap);
        align-items: center;

        &:hover {
            cursor: pointer;
        }
    }
</style>
