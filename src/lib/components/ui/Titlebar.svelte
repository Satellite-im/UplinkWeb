<script lang="ts">
    import { Button, Icon, Logo, Text } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import Controls from "../../layouts/Controls.svelte"

    export let title: string = "Uplink"
</script>

<div id="titlebar" data-tauri-drag-region>
    <div class="about">
        <Logo size={Size.Small} />
        <Text class="title">{title}</Text>
    </div>
    <Controls>
        <Button small icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Plus} />
        </Button>
        <Button small icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Minus} />
        </Button>
        <Button small icon appearance={Appearance.Alt}>
            <Icon icon={Shape.XMark} />
        </Button>
    </Controls>
</div>

<style lang="scss">
    #titlebar {
        cursor: default;
        border-bottom: var(--border-width) solid var(--border-color);
        display: inline-flex;
        flex-direction: row;
        gap: var(--gap);
        justify-content: space-between;
        padding: var(--padding-minimal) var(--padding-less);
        align-items: center;

        .about {
            display: inline-flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: var(--gap);
        }

        :global(.title) {
            flex: 1;
            text-transform: uppercase;
            color: var(--color);
        }
    }
</style>
