<script lang="ts">
    import { Button, Icon, Text } from "$lib/elements"
    import Label from "$lib/elements/Label.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import Chatbar from "$lib/layouts/Chatbar.svelte"
    import Topbar from "$lib/layouts/Topbar.svelte"
    import { _ } from "svelte-i18n"
</script>

<div id="community">
    <Topbar>
        <div slot="before">
            <div class="topbar-details">
                <Text>{$_("community.title")}</Text>
                <Label text={$_("community.titleSub")} />
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
    <div class="content">asdf</div>
    <Chatbar />
</div>

<style lang="scss">
    #community {
        height: 100%;
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        .topbar-details {
            display: column;
            align-items: center;
            gap: var(--gap);
        }

        .content {
            flex: 1;
        }
    }
</style>
