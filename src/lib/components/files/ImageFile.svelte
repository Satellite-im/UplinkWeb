<script lang="ts">
    import { Spacer, Text } from "$lib/elements"
    import prettyBytes from "pretty-bytes"
    import { Size } from "$lib/enums"
    import { createEventDispatcher } from "svelte"
    import { _ } from "svelte-i18n"

    const dispatch = createEventDispatcher()
    function onClick(event: MouseEvent) {
        dispatch("click", event)
    }
    export let ImgSource: string = ""
    export let name: string = $_("files.unknown")
    export let filesize: number = 9821239
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="image-file" on:click={onClick}>
    <img class="preview" src={ImgSource} alt="preview" />
    <Spacer less />
    <input class="img_text" value={name} />
    <Text size={Size.Smallest} muted class="name">{prettyBytes(filesize)}</Text>
</div>

<style lang="scss">
    .image-file {
        height: var(--file-folder-size);
        width: var(--file-folder-size);
        overflow: hidden;
        border-radius: var(--border-radius);
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        white-space: nowrap;
        transition: background-color var(--animation-speed);
        padding: var(--padding-less);

        .preview {
            max-height: 58.52px;
            max-width: 100%;
            border-radius: var(--border-radius-minimal);
        }

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
        .img_text {
            height: 21px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        :global(.svg-icon) {
            color: var(--warning-color);
            width: var(--icon-size-largest);
            height: var(--icon-size-largest);
        }

        :global(.name) {
            overflow: hidden;
            max-width: 100%;
            text-overflow: ellipsis;
            line-clamp: 1;
        }
    }
</style>
