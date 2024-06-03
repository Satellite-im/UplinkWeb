<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import { createEventDispatcher } from "svelte"

    export let acceptableFiles: string = ".jpg, .jpeg, .png, .heic, .avif"
    export let appearance: Appearance = Appearance.Default
    export let small: boolean = false
    export let icon: boolean = false
    export let tooltip: string = ""

    const dispatch = createEventDispatcher()

    let avatar: string | undefined, fileinput: HTMLElement

    const onFileSelected = (e: any) => {
        let image = e.target.files[0]
        let reader = new FileReader()
        reader.readAsDataURL(image)
        reader.onload = e => {
            avatar = e.target?.result?.toString()
            dispatch("upload", avatar)
        }
    }
</script>

<Button hook="button-file-upload" appearance={appearance} small={small} icon={icon} tooltip={tooltip} on:click={() => fileinput.click()}>
    <Icon icon={Shape.Plus} />
</Button>
<input style="display:none" type="file" accept={acceptableFiles} on:change={e => onFileSelected(e)} bind:this={fileinput} />

<style lang="scss">
</style>
