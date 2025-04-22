import { writable, type Writable } from "svelte/store"

export enum FriendPage {
    ALL,
    ACTIVE,
    BLOCKED,
}

export type PageStateStruct = {
    friends: Writable<FriendPage>
    addFriend: Writable<string>
}

export const PageState: PageStateStruct = {
    friends: writable(FriendPage.ALL),
    addFriend: writable(""),
}
