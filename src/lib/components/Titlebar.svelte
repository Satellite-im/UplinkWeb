<script lang="ts">
    import Button from "$lib/elements/Button.svelte";
import Icon from "$lib/elements/Icon.svelte";
    import Logo from "$lib/elements/Logo.svelte";
import Text from "$lib/elements/Text.svelte"
    import { Appearance, Shape, Size } from "$lib/enums";

    export let title: string = "Uplink"
</script>

<div id="titlebar" data-tauri-drag-region>
    <div class="about">
        <Logo size={Size.Small} />
        <Text class="title">{title}</Text>
    </div>
    <div class="controls">
        <Button small icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Plus} />
        </Button>
        <Button small icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Minus} />
        </Button>
        <Button small icon appearance={Appearance.Alt}>
            <Icon icon={Shape.XMark} />
        </Button>
    </div>
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
            font-family: "Secondary";
            color: var(--color);
        }
        
        .controls {
            width: fit-content;
        }
    }
</style>