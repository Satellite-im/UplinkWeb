import type { MessageGroup, Chat, Message, PendingMessage, FileProgress } from "$lib/types"
import { derived, get, writable, type Writable } from "svelte/store"
import { v4 as uuidv4 } from "uuid"
import { getStateFromDB, setStateToDB } from ".."
import { mock_group, mock_dm1, mock_dm2, mock_dm3, mock_dm4, mock_dm5, mock_dm6, mock_dm7, mock_dm8, mock_dm9, mock_dm10 } from "$lib/mock/messages"
import { Appearance } from "$lib/enums"
import { Store } from "../Store"
import { UIStore } from "../ui"
import { mchats } from "$lib/mock/users"

type ConversationMessagesMap = { [id: string]: Writable<ConversationMessages> }

export type ConversationMessages = {
    id: string
    messages: MessageGroup[]
}

export type Unreads = {
    id: string
    count: number
}

class Conversations {
    /**
     * INTERNAL!
     * This is synced with #conversations and purely for saving to DB as DB cannot directly save Writable
     */
    private conversationsDB: ConversationMessages[]
    private conversations: Writable<ConversationMessagesMap>
    // We use a new writable so they dont get saved to db
    pendingMsgConversations: Writable<{ [conversation: string]: { [id: string]: PendingMessage } }>
    unreads: Writable<Unreads[]>

    constructor() {
        this.conversationsDB = []
        this.conversations = writable({})
        this.unreads = writable([])
        this.pendingMsgConversations = writable({})
        this.loadConversations()
        this.conversations.subscribe(async convsStore => {
            // Update the whole conversationsDB whenever the main store changes
            // as that indicates an addition/removal of conversations
            this.conversationsDB = Object.values(convsStore).map(msgStore => {
                return get(msgStore)
            })
            await setStateToDB("conversations", this.conversationsDB)
        })
    }

    async loadConversations() {
        // TODO: Instead of storing all conversations under one entry, we should store each conversation in it's own table row.
        const dbConversations = await getStateFromDB<ConversationMessages[]>("conversations", [])
        this.conversationsDB = dbConversations
        let convN = this.conversationsDB.reduce((map, conv) => {
            map[conv.id] = this.createConversation(conv)
            return map
        }, {} as ConversationMessagesMap)
        this.conversations.set(convN)
    }

    private createConversation(conv: ConversationMessages) {
        let wr = writable(conv)
        let init = true
        wr.subscribe(async conv => {
            if (init) {
                init = false
                return
            }
            const conversationIndex = this.conversationsDB.findIndex(c => c.id === conv.id)
            if (conversationIndex !== -1) {
                this.conversationsDB[conversationIndex] = conv
                await setStateToDB("conversations", this.conversationsDB)
            }
        })
        return wr
    }

    getConversation(chat: Chat | string) {
        let chatId = typeof chat === "string" ? chat : chat.id
        return get(this.conversations)[chatId]
    }

    addConversations(chats: string[]) {
        this.conversations.update(convs => {
            for (let chat of chats) {
                convs[chat] = this.createConversation({
                    id: chat,
                    messages: [],
                })
            }
            return convs
        })
    }

    removeConversation(chat: string) {
        this.conversations.update(convs => {
            delete convs[chat]
            return convs
        })
    }

    async addMessage(chat: Chat | string, message: Message) {
        let chatId = typeof chat === "string" ? chat : chat.id
        const conversations = get(this.conversations)
        const conversation = conversations[chatId]

        if (message.id === "") message.id = uuidv4()

        if (conversation) {
            conversation.update(conv => {
                const lastGroup = conv.messages[conv.messages.length - 1]
                const now = new Date()

                if (lastGroup && lastGroup.details.origin === message.details.origin && now.getTime() - new Date(lastGroup.details.at).getTime() < 60000) {
                    lastGroup.messages.push(message)
                } else {
                    const newMessageGroup: MessageGroup = {
                        details: message.details,
                        messages: [message],
                    }
                    conv.messages.push(newMessageGroup)
                }
                return conv
            })
        } else {
            const newConversation: ConversationMessages = {
                id: chatId,
                messages: [
                    {
                        details: message.details,
                        messages: [message],
                    },
                ],
            }
            conversations[chatId] = this.createConversation(newConversation)
            this.conversations.set(conversations)
        }
        UIStore.mutateChat(chatId, c => {
            if (message.details.at > c.last_message_at) {
                c.last_message_preview = message.text.join("\n")
                c.last_message_at = message.details.at
            }
        })
    }

    async editMessage(chat: Chat | string, messageId: string, editedContent: string) {
        let chatId = typeof chat === "string" ? chat : chat.id
        const conversations = get(this.conversations)
        const conversation = conversations[chatId]
        if (conversation) {
            conversation.update(conv => {
                conv.messages.forEach(group => {
                    const messageIndex = group.messages.findIndex(m => m.id === messageId)
                    if (messageIndex !== -1) {
                        group.messages[messageIndex] = {
                            ...group.messages[messageIndex],
                            text: [editedContent],
                        }
                    }
                })
                return conv
            })
        }
    }

    hasReaction(chat: Chat | string, messageId: string, emoji: string) {
        let chatId = typeof chat === "string" ? chat : chat.id
        const conversations = get(this.conversations)
        const conversationStore = conversations[chatId]
        const user = get(Store.state.user).key

        if (conversationStore) {
            const conversation = get(conversationStore)
            for (let group of conversation.messages) {
                const messageIndex = group.messages.findIndex(m => m.id === messageId)
                if (messageIndex !== -1) {
                    const reactions = group.messages[messageIndex].reactions
                    const reaction = reactions[emoji]
                    return reaction && reaction.reactors.has(user)
                }
            }
        }
        return false
    }

    async editReaction(chat: string, messageId: string, emoji: string, add: boolean, reactor?: string) {
        const conversations = get(this.conversations)
        const conversation = conversations[chat]
        const user = reactor ? reactor : get(Store.state.user).key

        if (conversation) {
            conversation.update(conv => {
                conv.messages.forEach(group => {
                    const messageIndex = group.messages.findIndex(m => m.id === messageId)
                    if (messageIndex !== -1) {
                        const reactions = group.messages[messageIndex].reactions
                        const reaction = reactions[emoji]
                        if (!add) {
                            if (reaction !== undefined) {
                                let reactors = reaction.reactors
                                reactors.delete(user)
                                if (reactors && reactors.size === 0) {
                                    delete reactions[emoji]
                                } else {
                                    reactions[emoji] = {
                                        ...reaction,
                                        reactors,
                                    }
                                }
                            }
                        } else {
                            if (reaction !== undefined) {
                                reactions[emoji] = {
                                    ...reaction,
                                    reactors: reaction.reactors.add(user),
                                }
                            } else {
                                reactions[emoji] = {
                                    reactors: new Set([user]),
                                    emoji: emoji,
                                    highlight: Appearance.Default, //TODO
                                    description: "", //TODO
                                }
                            }
                        }
                        group.messages[messageIndex] = {
                            ...group.messages[messageIndex],
                            reactions: reactions,
                        }
                    }
                })
                return conv
            })
        }
    }

    async removeMessage(chat: string, messageId: string) {
        const conversations = get(this.conversations)
        const conversation = conversations[chat]

        if (conversation) {
            conversation.update(conv => {
                conv.messages.forEach(group => {
                    const index = group.messages.findIndex(m => m.id === messageId)
                    if (index !== -1) {
                        group.messages.splice(index, 1)
                    }
                })
                conv.messages = conv.messages.filter(group => group.messages.length > 0)
                return conv
            })
        }
    }

    async pinMessage(chat: Chat | string, messageId: string, pin: boolean) {
        let chatId = typeof chat === "string" ? chat : chat.id
        const conversations = get(this.conversations)
        const conversation = conversations[chatId]
        if (conversation) {
            conversation.update(conv => {
                conv.messages.forEach(group => {
                    const messageIndex = group.messages.findIndex(m => m.id === messageId)
                    if (messageIndex !== -1) {
                        group.messages[messageIndex] = {
                            ...group.messages[messageIndex],
                            pinned: pin,
                        }
                    }
                })
                return conv
            })
        }
    }

    getMessage(chat: string, messageId: string): Message | null {
        const conversations = get(this.conversations)
        const conversation = conversations[chat]
        if (conversation) {
            get(conversation).messages.forEach(group => {
                const messageIndex = group.messages.findIndex(m => m.id === messageId)
                if (messageIndex !== -1) {
                    return group.messages[messageIndex]
                }
            })
        }
        return null
    }

    getPendingMessages(chat: Chat | string) {
        let chatId = typeof chat === "string" ? chat : chat.id
        return derived(this.pendingMsgConversations, res => {
            let msgs = res[chatId]
            return (msgs = msgs ? msgs : {})
        })
    }

    addPendingMessages(chat: string, messageId: string, message: string[]) {
        const conversations = get(this.pendingMsgConversations)
        const conversation = conversations[chat]

        if (conversation) {
            conversation[messageId] = {
                message: {
                    id: messageId,
                    at: new Date(),
                    text: message,
                },
                attachmentProgress: writable({}),
            }
            this.pendingMsgConversations.set(conversations)
        } else {
            conversations[chat] = {
                [messageId]: {
                    message: {
                        id: messageId,
                        at: new Date(),
                        text: message,
                    },
                    attachmentProgress: writable({}),
                },
            }
            this.pendingMsgConversations.set(conversations)
        }
    }

    updatePendingMessages(chat: string, messageId: string, file: string, update: (progress: FileProgress | undefined) => FileProgress | undefined) {
        const conversations = get(this.pendingMsgConversations)
        const conversation = conversations[chat]

        if (conversation) {
            let progresses = get(conversation[messageId].attachmentProgress)
            let current: FileProgress | undefined = update(progresses[file])
            if (current) {
                progresses[file] = current
            }
            conversation[messageId].attachmentProgress.set(progresses)
        }
    }

    removePendingMessages(chat: string, messageId: string) {
        const conversations = get(this.pendingMsgConversations)
        const conversation = conversations[chat]
        if (conversation) {
            delete conversation[messageId]
            this.pendingMsgConversations.set(conversations)
        }
    }

    async loadMockData() {
        const initialChatId = mchats[0].id
        const initialData: Writable<ConversationMessages> = this.createConversation({
            id: initialChatId,
            messages: mock_group,
        })
        this.conversations.update(currentConversations => {
            currentConversations[initialChatId] = initialData
            return currentConversations
        })
        const firstChatId = mchats[1].id
        const initialData2: Writable<ConversationMessages> = this.createConversation({
            id: firstChatId,
            messages: mock_dm1,
        })
        this.conversations.update(currentConversations => {
            currentConversations[firstChatId] = initialData2
            return currentConversations
        })
        const secondChatId = mchats[2].id
        const initialData3: Writable<ConversationMessages> = this.createConversation({
            id: secondChatId,
            messages: mock_dm2,
        })
        this.conversations.update(currentConversations => {
            currentConversations[secondChatId] = initialData3
            return currentConversations
        })
        const thirdChatId = mchats[3].id
        const initialData4: Writable<ConversationMessages> = this.createConversation({
            id: thirdChatId,
            messages: mock_dm3,
        })
        this.conversations.update(currentConversations => {
            currentConversations[thirdChatId] = initialData4
            return currentConversations
        })
        const fourthChatId = mchats[4].id
        const initialData5: Writable<ConversationMessages> = this.createConversation({
            id: fourthChatId,
            messages: mock_dm4,
        })
        this.conversations.update(currentConversations => {
            currentConversations[fourthChatId] = initialData5
            return currentConversations
        })
        const fifthChatId = mchats[5].id
        const initialData6: Writable<ConversationMessages> = this.createConversation({
            id: fifthChatId,
            messages: mock_dm5,
        })
        this.conversations.update(currentConversations => {
            currentConversations[fifthChatId] = initialData6
            return currentConversations
        })
        const sixthChatId = mchats[6].id
        const initialData7: Writable<ConversationMessages> = this.createConversation({
            id: sixthChatId,
            messages: mock_dm6,
        })
        this.conversations.update(currentConversations => {
            currentConversations[sixthChatId] = initialData7
            return currentConversations
        })
        const seventhChatId = mchats[7].id
        const initialData8: Writable<ConversationMessages> = this.createConversation({
            id: seventhChatId,
            messages: mock_dm7,
        })
        this.conversations.update(currentConversations => {
            currentConversations[seventhChatId] = initialData8
            return currentConversations
        })
        const eighthChatId = mchats[8].id
        const initialData9: Writable<ConversationMessages> = this.createConversation({
            id: eighthChatId,
            messages: mock_dm8,
        })
        this.conversations.update(currentConversations => {
            currentConversations[eighthChatId] = initialData9
            return currentConversations
        })
        const ninthChatId = mchats[9].id
        const initialData10: Writable<ConversationMessages> = this.createConversation({
            id: ninthChatId,
            messages: mock_dm9,
        })
        this.conversations.update(currentConversations => {
            currentConversations[ninthChatId] = initialData10
            return currentConversations
        })
        const tenthChatId = mchats[10].id
        const initialData11: Writable<ConversationMessages> = this.createConversation({
            id: tenthChatId,
            messages: mock_dm10,
        })
        this.conversations.update(currentConversations => {
            currentConversations[tenthChatId] = initialData11
            return currentConversations
        })
        // this.pendingMsgConversations.set({
        //     [firstChatId]: {
        //         mock_id: {
        //             message: {
        //                 id: "mock_id",
        //                 at: new Date(),
        //                 text: ["Hello, world!"],
        //             },
        //             attachmentProgress: writable({
        //                 test: {
        //                     name: "filea",
        //                     size: 5,
        //                     total: 10,
        //                 },
        //                 testa: {
        //                     name: "fileb",
        //                     size: 10,
        //                     total: 10,
        //                     done: true,
        //                 },
        //                 testb: {
        //                     name: "filec",
        //                     size: 10,
        //                     total: 10,
        //                     error: "upload failed",
        //                 },
        //             }),
        //         },
        //     },
        // })
    }

    addUnread(chat: string) {
        const unreads = get(this.unreads)
        const index = unreads.findIndex(u => u.id === chat)
        if (index !== -1) {
            unreads[index].count++
        } else {
            unreads.push({
                id: chat,
                count: 1,
            })
        }
        this.unreads.set(unreads)
    }

    clearUnreads(chat: string) {
        const unreads = get(this.unreads)
        const index = unreads.findIndex(u => u.id === chat)
        if (index !== -1) {
            unreads[index].count = 0
        }
        this.unreads.set(unreads)
    }
}

export const ConversationStore = new Conversations()
