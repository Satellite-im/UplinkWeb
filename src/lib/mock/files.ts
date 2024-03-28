import { Shape } from "$lib/enums"
import type { FileInfo } from "$lib/types"


export let mock_files: FileInfo[] = [
    {id: 1, type: "file",  icon: Shape.Document, name: "new wallpaper", size: 982199999},
    {id: 2, type: "folder",  icon: Shape.Folder, name: "mongaloid", size: 9821999999999},
    {id: 3, type: "file",  icon: Shape.Document, name: "docs", size: 98299},
    {id: 4, type: "folder",  icon: Shape.Folder, name: "item4", size: 98212999},
    {id: 5, type: "file",  icon: Shape.Document, name: "item4", size: 985678999999},
    {id: 6, type: "file",  icon: Shape.Document, name: "item4", size: 9821239999}
];