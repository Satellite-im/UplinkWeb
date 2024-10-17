<script lang="ts">
    import Controls from "$lib/layouts/Controls.svelte"
    import { Text } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { OperationState, type FileInfo } from "$lib/types"
    import prettyBytes from "pretty-bytes"
    import { createEventDispatcher } from "svelte"
    import { _ } from "svelte-i18n"

    export let altBackgroundColor: boolean = false

    const dispatch = createEventDispatcher()

    export let fileInfo: FileInfo = {
        id: "1",
        isRenaming: OperationState.Initial,
        displayName: "",
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

    function share() {
        dispatch("share")
    }
</script>

<div class="file-embed {altBackgroundColor ? 'alt-bg' : ''}" data-cy="file-embed">
    <Icon icon={fileInfo.icon} size={Size.Larger} />
    <div class="body">
        <div class="details">
            <Text hook="file-embed-name">{fileInfo.name}</Text>
            <Text hook="file-embed-size" size={Size.Smaller} singleLine>
                {prettyBytes(fileInfo.size)}
            </Text>
        </div>
        <Controls>
            <Button hook="file-embed-download-button" icon tooltip={$_("files.download")} on:click={download}>
                <Icon icon={Shape.Download} />
            </Button>
            <Button hook="file-embed-share-button" icon appearance={Appearance.Alt} tooltip={$_("files.share")} on:click={share}>
                <Icon icon={Shape.Share} />
            </Button>
            <!-- TODO: Needs implementation 
            <Button hook="file-embed-add-to-files-button" appearance={Appearance.Alt} text={$_("files.addFiles")}>
                <Icon icon={Shape.Plus} />
            </Button> -->
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
        background-color: var(--background);
        border-radius: var(--border-radius-medium);

        &.alt-bg {
            background: var(--alt-color);
        }

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
