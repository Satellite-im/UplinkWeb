<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import { createEventDispatcher } from "svelte"
    import { compressImageToUpload, MAX_SIZE_IMAGE_TO_UPLOAD_ON_PROFILE } from "../utils/CompressImage"
    import heic2any from "heic2any"

    export let acceptableFiles: string = ".jpg, .jpeg, .png, .heic, .avif, .webp"
    export let appearance: Appearance = Appearance.Default
    export let disabled: boolean = false
    export let small: boolean = false
    export let icon: boolean = false
    export let tooltip: string = ""

    const dispatch = createEventDispatcher()

    let avatar: string | undefined, fileinput: HTMLElement

    async function convertHeicToJpg(file: File): Promise<File> {
        try {
            const conversionResult = await heic2any({
                blob: file,
                toType: "image/jpeg",
            })
            const convertedFile = new File([conversionResult as Blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" })
            return convertedFile
        } catch (error) {
            console.error("Error converting HEIC to JPG:", error)
            throw new Error("Conversion failed")
        }
    }

    const onFileSelected = async (e: any) => {
        let image = e.target.files[0]
        if (!image.type || image.type == "image/heic") {
            image = await convertHeicToJpg(image)
        }
        let quality = 0.9
        while (true) {
            let compressedImage = await compressImageToUpload(image, quality)
            if (compressedImage!.size <= MAX_SIZE_IMAGE_TO_UPLOAD_ON_PROFILE || quality <= 0.1) {
                let reader = new FileReader()
                reader.readAsDataURL(compressedImage!)
                reader.onload = async e => {
                    avatar = e.target?.result?.toString()
                    dispatch("upload", avatar)
                }
                break
            }
            quality -= 0.1
        }
        e.target.value = ""
    }
</script>

<Button
    hook="button-file-upload"
    disabled={disabled}
    appearance={appearance}
    small={small}
    icon={icon}
    tooltip={tooltip}
    on:click={() => {
        if (!disabled) {
            fileinput.click()
        }
    }}>
    <Icon icon={Shape.Plus} />
</Button>
<input data-cy="input-file-upload" style="display:none" type="file" accept={acceptableFiles} on:change={e => onFileSelected(e)} bind:this={fileinput} />

<style lang="scss">
</style>
