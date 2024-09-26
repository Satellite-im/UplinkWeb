<script lang="ts">
    import { Button, Icon, Text, Label } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { CommunitySettings } from "$lib/components"
    import Topbar from "$lib/layouts/Topbar.svelte"
    import { _ } from "svelte-i18n"
    import Modal from "$lib/components/ui/Modal.svelte"

    let showSettings: boolean = false
</script>

<div id="community">
    {#if showSettings}
        <Modal on:close={() => (showSettings = false)}>
            <CommunitySettings />
        </Modal>
    {/if}

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
            <Button
                appearance={Appearance.Alt}
                icon
                on:click={() => {
                    showSettings = !showSettings
                }}>
                <Icon icon={Shape.Cog} />
            </Button>
        </svelte:fragment>
    </Topbar>
    <div class="content">asdf</div>
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
