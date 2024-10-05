<script lang="ts">
    import { Button, Icon, Text } from "$lib/elements"
    import { Shape, Size } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import type { Chat, FileInfo } from "$lib/types"
    import { createEventDispatcher } from "svelte"

    import { _ } from "svelte-i18n"
    import { derived } from "svelte/store"

    export let activeChat: Chat

    let chatAttachmentsToSend = Store.state.chatAttachmentsToSend

    let filesSelectedFromStorage = derived(chatAttachmentsToSend, $chatAttachmentsToSend => {
        return $chatAttachmentsToSend[activeChat.id]?.storageFiles || []
    })

    let filesSelected = derived(chatAttachmentsToSend, $chatAttachmentsToSend => {
        return $chatAttachmentsToSend[activeChat.id]?.localFiles || []
    })
    const dispatcher = createEventDispatcher()
    function removeFile(file: File | string) {
        dispatcher("remove", file)
    }
    function removeFileFromStorage(file: FileInfo) {
        dispatcher("removeFileFromStorage", file)
    }
</script>

{#if $filesSelected.length > 0 || $filesSelectedFromStorage.length > 0}
    <div class="files-selected">
        {#if $filesSelected.length > 0}
            {#each $filesSelected as [file, path]}
                <div class="selected-file">
                    <div class="file-preview">
                        {#if file && typeof file === "object" && file.type.startsWith("image")}
                            <img class="file-preview-image" src={URL.createObjectURL(file)} alt="" />
                        {:else}
                            <Icon icon={Shape.Document} />
                        {/if}
                    </div>
                    <div class="details">
                        <Text size={Size.Smallest}>{file && typeof file === "object" ? file.name : path}</Text>
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
        {/if}

        {#each $filesSelectedFromStorage as remoteFile (remoteFile.remotePath)}
            <div class="selected-file">
                <div class="file-preview">
                    {#if remoteFile && remoteFile.imageThumbnail?.startsWith("data:image")}
                        <img class="file-preview-image" src={remoteFile.imageThumbnail} alt="" />
                    {:else}
                        <Icon icon={Shape.Document} />
                    {/if}
                </div>
                <div class="details">
                    <Text size={Size.Smallest}>{remoteFile.displayName ?? remoteFile.name}</Text>
                </div>
                <div class="control">
                    <Button
                        icon
                        on:click={_ => {
                            removeFileFromStorage(remoteFile)
                        }}>
                        <Icon icon={Shape.Trash} />
                    </Button>
                </div>
            </div>
        {/each}
    </div>
{/if}

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
    @media (max-width: 400px) {
        .files-selected {
            width: unset;
            margin-left: 10px;
            margin-right: 10px;
        }
    }
</style>
