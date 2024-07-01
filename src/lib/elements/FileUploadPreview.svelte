<script lang="ts">
    import { Button, Icon, Input, Text } from "$lib/elements"
    import { Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"

    initLocale()
    export let filesSelected: [File?, string?][] = []
    function removeFile(file: File | string) {
        filesSelected = filesSelected.filter(([f, p]) => f !== file && p !== file)
    }
</script>

<div class="files-selected">
    {#each filesSelected as [file, path]}
        <div class="selected-file">
            <div class="file-preview">
                {#if file && file.type.startsWith("image")}
                    <img class="file-preview-image" src={URL.createObjectURL(file)} alt="" />
                {:else}
                    <Icon icon={Shape.Document} />
                {/if}
            </div>
            <div class="details">
                <Text size={Size.Smallest}>{file ? file.name : path}</Text>
            </div>
            <div class="control">
                <Button
                    icon
                    on:click={_ => {
                        if (file) {
                            removeFile(file)
                        } else if (path) {
                            removeFile(path)
                        }
                    }}>
                    <Icon icon={Shape.Trash} />
                </Button>
            </div>
        </div>
    {/each}
</div>

<style lang="scss">
    .files-selected {
        display: flex;
        bottom: 100%;
        width: calc(100% - var(--gap) * 2);
        padding: var(--padding);
        gap: var(--gap);
        border-radius: var(--border-radius);
        height: fit-content;
        overflow-x: auto;
        overflow-y: hidden;
        background: var(--alt-color);

        .selected-file {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 150px;
            gap: var(--gap-less);
            background: var(--background-alt);

            .file-preview {
                height: 120px;

                .file-preview-image {
                    width: 100%;
                    height: 100%;
                }

                :global(svg) {
                    width: 100%;
                    height: 100%;
                }
            }

            .details {
                overflow: hidden;
                padding: var(--padding-minimal);
                :global(p) {
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: pre;
                }
            }
            .control {
                position: absolute;
                display: none;
                right: var(--padding-minimal);
                top: var(--padding-minimal);
            }
            &:hover {
                .control {
                    display: unset;
                }
            }
        }
    }
</style>
