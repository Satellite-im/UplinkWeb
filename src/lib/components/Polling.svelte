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
        await updateUsersOnChats()
        setTimeout(poll, rate)
    }

    onMount(() => {
        poll()
    })


    async function updateUsersOnChats() {
        let chatsUI = get(UIStore.state.chats)
        let chatsUIUpdated: Chat[] = []
        let activeChat = get(Store.state.activeChat)
        if (chatsUI.length !== 0) {

            for (let chat of chatsUI) {
                let usersUpdated: User[] = []
                
                for (let user of chat.users) {
                    let friend = await MultipassStoreInstance.identity_from_did(user.key)
                    let userUpdated: User = {
                            ...user,
                            name: friend?.name ?? user.name,
                            media: {
                            ...user.media
                        },
                        profile: {
                            ...user.profile,
                            status: friend?.profile.status ?? user.profile.status,
                            banner: {
                                ...user.profile.banner,
                                image: friend?.profile.banner.image ?? user.profile.banner.image
                            },
                            photo: {
                                ...user.profile.photo,
                                image: friend?.profile.photo.image ?? user.profile.photo.image
                            }
                        }
                    }
                    if (!friend?.profile.photo.image) {
                        userUpdated.profile.photo.image = user.profile.photo.image;
                    }
                    if (!friend?.profile.banner.image) {
                        userUpdated.profile.banner.image = user.profile.banner.image;
                    }
                    usersUpdated.push(userUpdated)
                }
        
                chat = {
                    ...chat,
                    users: usersUpdated
                }

                if (activeChat.id === chat.id) {
                    Store.state.activeChat.set(chat)
                    let conversation = ConversationStore.getConversation(activeChat)
                    conversation?.messages.forEach(message => {
                        message.messages.forEach(m => {
                            m.details.origin = chat.users.find(u => u.key === m.details.origin.key) ?? m.details.origin
                        })
                    })
                 
                }

                chatsUIUpdated.push(chat)
            }
            UIStore.state.chats.set(chatsUIUpdated)
        }
    }
</script>
