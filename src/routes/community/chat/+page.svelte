<script lang="ts">
    import { Button, Icon, Text } from "$lib/elements"
    import Label from "$lib/elements/Label.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import Topbar from "$lib/layouts/Topbar.svelte"
</script>

<div id="community">
    <Topbar>
        <div slot="before">
            <div class="topbar-details">
                <Text>Satellite Community - General</Text>
                <Label text="Message of the day" />
            </div>
        </div>
        <svelte:fragment slot="controls">
            <Button appearance={Appearance.Alt} icon>
                <Icon icon={Shape.UserPlus} />
            </Button>
            <Button appearance={Appearance.Alt} icon>
                <Icon icon={Shape.Users} />
            </Button>
            <Button appearance={Appearance.Alt} icon>
                <Icon icon={Shape.Cog} />
            </Button>
        </svelte:fragment>
    </Topbar>
</div>

<style lang="scss">
    #community {
        width: 100%;
        .topbar-details {
            display: column;
            align-items: center;
            gap: var(--gap);
        }
    }
</style>
