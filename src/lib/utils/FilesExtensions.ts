const imageFilesExtension = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];

const videoFileExtension = ['mp4', 'webm', 'ogg'];


export const isImageFile = (fileName: string): boolean => {
  return imageFilesExtension.includes(fileName.split('.').pop()!.toLowerCase());
}


export const getFileNameAndExtension = (fileName: string): { name: string; extension: string } => {
    const lastDotIndex = fileName.lastIndexOf(".")
    if (lastDotIndex === -1) {
        return { name: fileName, extension: "" }
    }
    const name = fileName.substring(0, lastDotIndex)
    const extension = fileName.substring(lastDotIndex + 1)
    return { name, extension }
}