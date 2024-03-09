<script lang="ts">
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import Label from "$lib/elements/Label.svelte";
    import Text from "$lib/elements/Text.svelte";
    import { Appearance, Shape } from "$lib/enums";

    export let loading: boolean = false;
</script>

<div class="call-controls">
    <div class="info">
        <Label text="In Call" />
        <Text appearance={Appearance.Success} loading={loading}>3h:40m:34s</Text>
    </div>

    <div class="controls">
        <Button icon appearance={Appearance.Alt} tooltip="Mute" loading={loading} >
            <Icon icon={Shape.Microphone} />
        </Button>
        <Button icon appearance={Appearance.Alt} tooltip="Stream" loading={loading}>
            <Icon icon={Shape.Stream} />
        </Button>
        <Button text="End" outline appearance={Appearance.Error} tooltip="End" loading={loading}>
            <Icon icon={Shape.PhoneXMark} />
        </Button>
    </div>
</div>

<style lang="scss">
    .call-controls {
        width: 100%;
        background-color: var(--background-alt);
        border: var(--border-width) solid var(--success-color);
        border-radius: var(--border-radius);
        padding: var(--padding);
        display: inline-flex;
        gap: var(--gap);
        min-width: var(--min-component-width);
        align-items: center;

        .controls {
            min-width: fit-content;
        }

        .info {
            flex: 1;
        }
    }
</style>