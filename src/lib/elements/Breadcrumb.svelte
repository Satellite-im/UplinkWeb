<script lang="ts">
    import Icon from './Icon.svelte'
    import Button from './Button.svelte'
    import { Appearance, Shape } from '$lib/enums'
    import type { FileInfo } from '$lib/types'
    
    export let folder: FileInfo
    export let folderPath: FileInfo[] = []
    
    const currentFolder: FileInfo = {
      id: '',
      type: '',
      size: 0,
      name: '',
      source: ''
    }
    const handleClick = () => {
        console.log(folderPath)
        folderPath = [...folderPath, folder];
    };
  
    const handleCrumbClick = (index: number) => {
        folderPath = folderPath.slice(0, index);
    };
</script>
  
<div class="crumb">
    <Button
        icon
        small
        appearance={Appearance.Alt}
        on:click={(_) => handleClick()}
    >
        <Icon icon={Shape.FolderOpen} />
    </Button>
    {#each folderPath as folder, index (folder.id)}
        <div class="crumble" on:click={() => handleCrumbClick(index)}>
            {folder.name}
        </div>
    {/each}
</div>
      
<style lang="scss">
    .crumb {
        display: inline-flex;
        align-content: center;
        color: var(--text-color-muted);
        font-size: var(--text-size);
        padding: var(--gap-less) var(--gap);
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