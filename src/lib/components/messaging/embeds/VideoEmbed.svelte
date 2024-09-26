<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import Text from "$lib/elements/Text.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import prettyBytes from "pretty-bytes"
    import { _ } from "svelte-i18n"

    export let location: string = ""
    export let name: string = ""
    export let size: number = 0
</script>

<div class="video-embed">
    <!-- svelte-ignore a11y-media-has-caption -->
    <video controls width="500">
        <source src={location} type="video/mp4" />
    </video>
    <div class="details">
        <Text size={Size.Smaller}>{name} ({prettyBytes(size)})</Text>
        <Button text={$_("files.download")} appearance={Appearance.Alt}>
            <Icon icon={Shape.ArrowDown} />
        </Button>
    </div>
</div>

<style lang="scss">
    .video-embed {
        background-color: var(--background-alt);
        padding: var(--padding);
        min-width: var(--min-component-width);
        max-width: var(--max-component-width);
        width: fit-content;
        display: inline-flex;
        gap: var(--gap);
        flex-direction: column;
        border-radius: var(--border-radius-medium);

        video {
            border-radius: var(--border-radius);
            overflow: hidden;
        }
        .details {
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap);
            justify-content: space-between;
            align-items: center;
        }
    }
</style>
