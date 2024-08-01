<script lang="ts">
    import Icon from "$lib/elements/Icon.svelte"
    import Text from "$lib/elements/Text.svelte"
    import { CommunityChannelKind, Shape } from "$lib/enums"
    import type { CommunityChannel } from "$lib/types"
    import { _ } from "svelte-i18n"

    export let channel: CommunityChannel = {
        icon: Shape.Hashtag,
        name: $_("community.channel.default"),
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
