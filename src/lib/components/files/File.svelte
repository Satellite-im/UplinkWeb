<script lang="ts">
    import { Icon, Text } from "$lib/elements"
    import { Shape, Size } from "$lib/enums"
    import prettyBytes from "pretty-bytes"

    export let name: string = "UNKNOWN"
    export let filesize: number = 9821239999999999999999 // Intentionally alarming to signify error
</script>

<div class="file">
    <Icon icon={Shape.Document} />
    <input type="text" value={name} />
    <Text size={Size.Smallest} muted>{prettyBytes(filesize)}</Text>
</div>

<style lang="scss">
    .file {
        height: var(--file-folder-size);
        width: var(--file-folder-size);
        border-radius: var(--border-radius);
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: background-color var(--animation-speed);
        padding: var(--padding-less);

        &:hover {
            background: var(--background-alt);
        }

        input {
            background-color: transparent;
            border: none;
            color: var(--color);
            text-align: center;
            width: 100%;
            border-radius: var(--border-radius-less);
            border: var(--border-width) solid transparent;
            text-overflow: ellipsis;

            &:focus {
                border: var(--border-width) solid var(--border-color);
                background-color: var(--alt-color);
                outline: none;
            }
        }

        :global(.svg-icon) {
            color: var(--warning-color);
            width: var(--icon-size-largest);
            height: var(--icon-size-largest);
        }
    }
</style>