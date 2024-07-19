export const MAX_SIZE_IMAGE_TO_UPLOAD_ON_PROFILE = 2097152

export const compressImageToUpload = async (image: any, quality: number): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)

            canvas.toBlob(
                blob => {
                    resolve(blob)
                },
                "image/jpeg",
                quality
            )
        }

        img.onerror = error => reject(error)
        img.src = URL.createObjectURL(image)
    })
}
