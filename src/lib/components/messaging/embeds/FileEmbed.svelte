<script lang="ts">
    import Controls from "$lib/layouts/Controls.svelte"
    import { Text } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { OperationState, type FileInfo } from "$lib/types"
    import prettyBytes from "pretty-bytes"
    import { createEventDispatcher } from "svelte"

    const dispatch = createEventDispatcher()

    export let fileInfo: FileInfo = {
        id: "1",
        isRenaming: OperationState.Initial,
        source: "unknown",
        name: "unknown",
        size: 999999999999999,
        icon: Shape.Document,
        type: "unknown/unknown",
        remotePath: "",
    }

    function download() {
        dispatch("download")
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
        <Controls>
            <Button icon tooltip="Download" on:click={download}>
                <Icon icon={Shape.Download} />
            </Button>
            <Button icon appearance={Appearance.Alt} tooltip="Share">
                <Icon icon={Shape.Share} />
            </Button>
            <Button appearance={Appearance.Alt} text="Add to Files">
                <Icon icon={Shape.Plus} />
            </Button>
        </Controls>
    </div>
</div>

<style lang="scss">
    .file-embed {
        min-width: var(--min-component-width);
        max-width: var(--max-component-width);
        width: 100%;
        display: inline-flex;
        padding: var(--padding);
        background-color: var(--background-alt);
        border-radius: var(--border-radius-medium);

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
        }
    }
</style>
