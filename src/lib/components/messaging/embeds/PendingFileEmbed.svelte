<script lang="ts">
    import { Text } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Shape, Size } from "$lib/enums"
    import { type FileProgress } from "$lib/types"
    import prettyBytes from "pretty-bytes"
    import { _ } from "svelte-i18n"

    export let fileInfo: FileProgress
    export let onCancel: () => void = () => {}

    function getPercentage(fileInfo: FileProgress) {
        return fileInfo.total ? `${(fileInfo.size / fileInfo.total) * 100}` : 0
    }

    function getSizeString(fileInfo: FileProgress) {
        if (fileInfo.error) return fileInfo.error
        if (fileInfo.total) return `${prettyBytes(fileInfo.total)}`
        return ""
    }
</script>

<div class="pending-file-embed" data-cy="pending-file-embed">
    <Icon icon={Shape.Document} size={Size.Larger} />
    <div class="body">
        <div class="details">
            <Text hook="pending-file-name">{fileInfo.name}</Text>
            <Text hook="pending-file-size" size={Size.Smaller} singleLine>
                {`${getSizeString(fileInfo)}`}
            </Text>
        </div>
        <div class={"upload-bar"}>
            <div data-cy="pending-file-upload-progress" class={"upload-progress"} style="width: {getPercentage(fileInfo)}%" />
        </div>
        {#if fileInfo.error}
            <div class="controls">
                <Button hook="button-pending-file-cancel" icon small tooltip={$_("generic.download")} on:click={onCancel}>
                    <Icon icon={Shape.Trash} />
                </Button>
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .pending-file-embed {
        min-width: var(--min-component-width);
        max-width: var(--max-component-width);
        width: 100%;
        display: inline-flex;
        position: relative;
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
                min-width: 100px;
                flex: 1;
            }
        }

        .upload-bar {
            position: relative;
            margin-top: 5px;
            width: 200px;
            height: 10px;
            background-color: var(--alt-color-alt);
            border-radius: var(--border-radius-more);

            .upload-progress {
                position: absolute;
                top: 0;
                height: 100%;
                width: width;
                background-color: var(--primary-color);
                border-radius: var(--border-radius-more);
                transition: 1s;
            }
        }

        .controls {
            position: absolute;
            display: flex;
            right: var(--padding);
            gap: var(--gap-less);
            bottom: var(--padding);
        }
    }
</style>
