<script lang="ts">
    import { Channel } from "src/lib/components"
    import { Button, Icon, Label } from "src/lib/elements"
    import { Appearance, Shape, Size } from "src/lib/enums"
    import type { CommunityChannelGroup } from "src/lib/types"

    export let group: CommunityChannelGroup = { name: "", channels: [] }
</script>

<div class="channel-group">
    <div class="channel-header">
        <Label text={group.name} />
        <div class="controls">
            <Button icon small appearance={Appearance.Alt}>
                <Icon icon={Shape.ChevronDown} size={Size.Small} />
            </Button>
            <Button icon small appearance={Appearance.Alt}>
                <Icon icon={Shape.Plus} size={Size.Small} />
            </Button>
        </div>
    </div>
    {#each group.channels as channel}
        <Channel channel={channel} />
    {/each}
</div>

<style lang="scss">
    .channel-group {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap-less);
        .channel-header {
            display: inline-flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
    }
</style>
