<script lang="ts">
    import { onMount } from 'svelte'
    import { createEventDispatcher } from 'svelte'
    import Button from './Button.svelte'
    import Icon from './Icon.svelte'
    import { Appearance, Shape } from '$lib/enums'
    import type { FileInfo } from '$lib/types'
    import { Store } from '$lib/state/store'

    export const folderRoot: FileInfo[] = []
    export let folder: FileInfo
    export let folderPath: FileInfo[] = []

    let folderTree: FileInfo[] = []

    const dispatch = createEventDispatcher()

    const handleClick = () => {
        folderTree = [...folderTree, folder]
        folderPath = [...folderTree];
    };

    const goHomeClick = () => {
        console.log("Go Home", folderRoot)
        folderTree = []
        folderPath = []
        Store.updateFileOrder(folderRoot)
    }

    const handleCrumbClick = (index: number) => {
    console.log("Crumb clicked, index:", index)
    folderPath = folderPath.slice(0, index + 1);
    folderTree = folderPath.slice();
    if (folderPath.length > 0) {
        const currentFolder = folderPath[folderPath.length - 1];
        if (currentFolder && currentFolder.items) {
            Store.updateFileOrder(currentFolder.items);
        }
    } else {
        // If the breadcrumb is empty, show the root files
        Store.updateFileOrder(folderRoot); // Update with the root files or initial files
    }
};

    $: {
        if (folder) {
            handleClick()
        }
    }

    onMount(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            if ((event.target as HTMLElement).classList.contains('crumb')) {
            console.log("full click area")
                const index = Array.from(document.querySelectorAll('.crumble')).indexOf(event.target as HTMLElement)
                handleCrumbClick(index)
            }
        };

        document.body.addEventListener('click', handleDocumentClick)

        return () => {
            document.body.removeEventListener('click', handleDocumentClick)
        };
    });
</script>

<div class="crumb">
    <Button
        icon
        small
        appearance={Appearance.Alt}
        on:click={goHomeClick}
    >
        <Icon icon={Shape.FolderOpen} />
    </Button>
    {#each folderPath as folder, index}
    <button class="crumble">
        {folder.name}
    </button>
    {/each}
</div>

<style lang="scss">
    .crumb {
        display: inline-flex;
        align-content: center;
        color: var(--text-color-muted);
        font-size: var(--text-size);
        padding: var(--gap-less) var(--gap);
        width: fit-content;
        align-items: center;
        position: relative;

        .crumble {
            pointer-events: all;
            min-height: var(--input-height);
            min-width: fit-content;
            color: var(--color);
            border: var(--border-width) solid var(--border-color);
            background-color: var(--alt-color);
            border-radius: 0.25rem;
            padding: var(--padding-less) var(--padding);
            font-size: var(--font-size-smaller);
            display: inline-flex;
            justify-content: center;
            z-index: -1;
            border-color: var(--primary-color);
            margin-left: -12px;
            align-items: center;
            min-height: calc(var(--input-height) / 1.5);
            max-height: calc(var(--input-height) / 1.5);
            transition: background-color var(--animation-speed) var(--animation-style),
                        color var(--animation-speed) var(--animation-style),
                        border-color var(--animation-speed) var(--animation-style),
                        all var(--animation-speed);
        }

        &:nth-child(1) {
            border-top-left-radius: var(--border-radius);
            border-bottom-left-radius: var(--border-radius);
            background: var(--secondary);
            color: var(--text-color-bright);
            margin-top: 20px;
            &:hover {
                background-color: var(--secondary-light);
                cursor: pointer;
            }
        }

        &:last-child {
            border-top-right-radius: var(--border-radius);
            border-bottom-right-radius: var(--border-radius);
        }
    }
</style>
