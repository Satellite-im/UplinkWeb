<script>
    import { Icon } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import Controls from "$lib/layouts/Controls.svelte"
    import { mock_users } from "$lib/mock/users"
    import Participant from "./Participant.svelte"
</script>
<div id="call-screen">
    <div id="participants">
        {#each mock_users as user}
            <Participant participant={user} />
        {/each}
    </div>
    <Controls>
        <Button appearance={Appearance.Alt} icon tooltip="Stream">
            <Icon icon={Shape.Stream} />
        </Button>
        <Button appearance={Appearance.Alt} icon tooltip="Enable Video">
            <Icon icon={Shape.VideoCamera} />
        </Button>
        <Button appearance={Appearance.Error} icon tooltip="End">
            <Icon icon={Shape.PhoneXMark} />
        </Button>
        <Button appearance={Appearance.Alt} icon tooltip="Settings">
            <Icon icon={Shape.Cog} />
        </Button>
    </Controls>
</div>

<style lang="scss">
    #call-screen {
        background-color: var(--black);
        display: flex;
        width: 100%;
        min-height: var(--min-call-screen-height);
        padding: var(--padding);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        #participants {
            flex: 1;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: var(--gap);
            padding: var(--padding);
            align-items: center;
            justify-content: center;
        }
    }
</style>