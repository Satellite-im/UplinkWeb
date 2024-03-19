<script lang="ts">
    import { Text } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import { Appearance, Shape, Size } from "$lib/enums"
    import type { FileInfo } from "$lib/types"
    import prettyBytes from "pretty-bytes"

    export let fileInfo: FileInfo = {
        name: "unknown",
        size: 9999999999999999999,
        icon: Shape.Document,
        type: "unknown/unknown"
    }
</script>


<div class="file-embed">
    <Icon icon={fileInfo.icon} size={Size.Larger} />
    <div class="body">
        <div class="details">
            <Text>{fileInfo.name}</Text>
            <Text size={Size.Smaller} singleLine>
                {prettyBytes(fileInfo.size)}
            </Text>
        </div>
        <div class="controls">
            <Button icon tooltip="Download">
                <Icon icon={Shape.Download} />
            </Button>
            <Button icon appearance={Appearance.Alt} tooltip="Share">
                <Icon icon={Shape.Share} />
            </Button>
            <Button icon appearance={Appearance.Alt} tooltip="Add to Files">
                <Icon icon={Shape.Plus} />
            </Button>
        </div>
    </div>
</div>

<style lang="scss">
    .file-embed {
        min-width: var(--min-component-width);
        max-width: var(--max-component-width);
        width: fit-content;
        display: inline-flex;
        padding: var(--padding-less);
        background-color: var(--background-alt);
        border-radius: var(--border-radius);

        .body {
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap);
            flex: 1;
            
            .details {
                display: inline-flex;
                flex-direction: column;
                flex: 1;
            }

            .controls {
                width: fit-content;
            }
        }
    }
</style>