<script lang="ts">
    import { ConversationStore } from "$lib/state/conversation"
    import { Store } from "$lib/state/Store.js"
    import { UIStore } from "$lib/state/ui"
    import type { Chat, User } from "$lib/types"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { onMount } from "svelte"
    import { get } from "svelte/store"

    export let rate: number = 5000

    async function poll() {
        // add processes here.
        await MultipassStoreInstance.fetchAllFriendsAndRequests()
        await updateUserOnChats()
        setTimeout(poll, rate)
    }

    onMount(() => {
        poll()
    })

    async function updateUserOnChats() {
        let chatsUI = get(UIStore.state.chats)
        let chatsUIUpdated: Chat[] = []
        let activeChat = get(Store.state.activeChat)
        let updateChats = false

        if (chatsUI.length !== 0) {
            for (let chat of chatsUI) {
                let usersUpdated: User[] = []

                for (let user of chat.users) {
                    let friend = await MultipassStoreInstance.identity_from_did(user.key)
                    let userUpdated: User = {
                        ...user,
                        name: friend?.name ?? user.name,
                        media: {
                            ...user.media,
                        },
                        profile: {
                            ...user.profile,
                            status: friend?.profile.status ?? user.profile.status,
                            status_message: friend?.profile.status_message ?? user.profile.status_message,
                            banner: {
                                ...user.profile.banner,
                                image: friend?.profile.banner.image ?? user.profile.banner.image,
                            },
                            photo: {
                                ...user.profile.photo,
                                image: friend?.profile.photo.image ?? user.profile.photo.image,
                            },
                        },
                    }

                    if (!friend?.profile.photo.image) {
                        userUpdated.profile.photo.image = user.profile.photo.image
                    }
                    if (!friend?.profile.banner.image) {
                        userUpdated.profile.banner.image = user.profile.banner.image
                    }

                    if (!isUserEqual(user, userUpdated)) {
                        updateChats = true
                        usersUpdated.push(userUpdated)
                    } else {
                        usersUpdated.push(user)
                    }
                }

                if (updateChats) {
                    chat = {
                        ...chat,
                        users: usersUpdated,
                    }

                    if (activeChat.id === chat.id) {
                        Store.state.activeChat.set(chat)
                        let conversation = get(ConversationStore.getConversation(activeChat))
                        conversation?.messages.forEach(message => {
                            message.messages.forEach(m => {
                                m.details.origin = chat.users.find(u => u.key === m.details.origin.key) ?? m.details.origin
                            })
                        })
                    }
                }
                chatsUIUpdated.push(chat)
            }
            UIStore.state.chats.set(chatsUIUpdated)
        }
    }

    function isUserEqual(user1: User, user2: User): boolean {
        return (
            user1.name === user2.name &&
            user1.profile.status === user2.profile.status &&
            user1.profile.status_message === user2.profile.status_message &&
            user1.profile.banner.image === user2.profile.banner.image &&
            user1.profile.photo.image === user2.profile.photo.image
        )
    }
</script>
