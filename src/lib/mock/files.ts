import type { FileInfo } from "$lib/types"


export let mock_files: FileInfo[] = [
    {id: "1", type: "file", source: "", name: "ExampleFile.mp4", size: 982199999},
    {id: "2", type: "folder", source: "", name: "Downloads", size: 9821999999999},
    {id: "3", type: "file",  source: "", name: "Test123.7z", size: 98299},
    {id: "4", type: "folder", source: "", name: "Temp", size: 98212999},
    {id: "5", type: "file",  source: "", name: "Cat.tar", size: 985678999999},
    {id: "6", type: "file",  source: "", name: "Dog.zip", size: 9821239999},
    {id: "7", type: "image",  source: "/assets/library.avif", name: "Stock.png", size: 1341234543}
];