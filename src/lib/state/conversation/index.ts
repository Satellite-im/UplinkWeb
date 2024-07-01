import type { MessageGroup, Chat, Message, Attachment, PendingMessage, FileProgress } from "$lib/types"
import { get, writable, type Writable } from "svelte/store"
import { v4 as uuidv4 } from "uuid"
import { getStateFromDB, setStateToDB } from ".."
import { mock_messages } from "$lib/mock/messages"
import { Appearance } from "$lib/enums"
import { Store } from "../Store"
import { UIStore } from "../ui"

export type ConversationMessages = {
    id: string
    messages: MessageGroup[]
}

class Conversations {
    conversations: Writable<ConversationMessages[]>
    // We use a new writable so they dont get saved to db
    pendingMsgConversations: Writable<{ [conversation: string]: { [id: string]: PendingMessage } }>

    constructor() {
        this.conversations = writable([])
        this.pendingMsgConversations = writable({})
        this.loadConversations()
    }

    async loadConversations() {
        // TODO: Instead of storing all conversations under one entry, we should store each conversation in it's own table row.
        const dbConversations = await getStateFromDB<ConversationMessages[]>("conversations", [])
        this.conversations.set(dbConversations)
    }

    getConversation(chat: Chat | string) {
        let chatId = typeof chat === "string" ? chat : chat.id
        return get(this.conversations).find(c => c.id === chatId)
    }

    async addMessage(chat: Chat | string, message: Message) {
        let chatId = typeof chat === "string" ? chat : chat.id
        const conversations = get(this.conversations)
        const conversationIndex = conversations.findIndex(c => c.id === chatId)

        if (message.id === "") message.id = uuidv4()

        if (conversationIndex !== -1) {
            const conversation = conversations[conversationIndex]
            const lastGroup = conversation.messages[conversation.messages.length - 1]
            const now = new Date()

            if (lastGroup && lastGroup.details.origin === message.details.origin && now.getTime() - new Date(lastGroup.details.at).getTime() < 60000) {
                lastGroup.messages.push(message)
            } else {
                const newMessageGroup: MessageGroup = {
                    details: message.details,
                    messages: [message],
                }
                conversation.messages.push(newMessageGroup)
            }
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
            conversations.push(newConversation)
        }
        this.conversations.set(conversations)
        UIStore.mutateChat(chatId, c => {
            c.last_message_preview = message.text.join("\n")
        })
        await setStateToDB("conversations", conversations)
    }

    async editMessage(chat: Chat | string, messageId: string, editedContent: string) {
        let chatId = typeof chat === "string" ? chat : chat.id
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chatId)
        if (conversation) {
            conversation.messages.forEach(group => {
                const messageIndex = group.messages.findIndex(m => m.id === messageId)
                if (messageIndex !== -1) {
                    group.messages[messageIndex] = {
                        ...group.messages[messageIndex],
                        text: [editedContent],
                    }
                }
            })

            this.conversations.set(conversations)
            await setStateToDB("conversations", conversations)
        }
    }

    hasReaction(chat: Chat | string, messageId: string, emoji: string) {
        let chatId = typeof chat === "string" ? chat : chat.id
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chatId)
        const user = get(Store.state.user).key

        if (conversation) {
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
        const conversation = conversations.find(c => c.id === chat)
        const user = reactor ? reactor : get(Store.state.user).key

        if (conversation) {
            conversation.messages.forEach(group => {
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

            this.conversations.set(conversations)
            await setStateToDB("conversations", conversations)
        }
    }

    async removeMessage(chat: string, messageId: string) {
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chat)

        if (conversation) {
            conversation.messages.forEach(group => {
                const index = group.messages.findIndex(m => m.id === messageId)
                if (index !== -1) {
                    group.messages.splice(index, 1)
                }
            })
            conversation.messages = conversation.messages.filter(group => group.messages.length > 0)
            this.conversations.set(conversations)
            await setStateToDB("conversations", conversations)
        }
    }

    async pinMessage(chat: Chat | string, messageId: string, pin: boolean) {
        let chatId = typeof chat === "string" ? chat : chat.id
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chatId)
        if (conversation) {
            conversation.messages.forEach(group => {
                const messageIndex = group.messages.findIndex(m => m.id === messageId)
                if (messageIndex !== -1) {
                    group.messages[messageIndex] = {
                        ...group.messages[messageIndex],
                        pinned: pin,
                    }
                }
            })

            this.conversations.set(conversations)
            await setStateToDB("conversations", conversations)
        }
    }

    getMessage(chat: string, messageId: string): Message | null {
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chat)
        if (conversation) {
            conversation.messages.forEach(group => {
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
        let msgs = get(this.pendingMsgConversations)[chatId]
        return msgs ? msgs : {}
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
        const firstChatId = get(this.conversations)[0].id
        const initialData: ConversationMessages = {
            id: firstChatId,
            messages: mock_messages,
        }
        this.conversations.update(currentConversations => {
            const index = currentConversations.findIndex(c => c.id === firstChatId)
            if (index !== -1) {
                currentConversations[index] = initialData
            } else {
                currentConversations.push(initialData)
            }
            return currentConversations
        })
        this.pendingMsgConversations.set({
            [firstChatId]: {
                mock_id: {
                    message: {
                        id: "mock_id",
                        at: new Date(),
                        text: ["Hello, world!"],
                    },
                    attachmentProgress: writable({
                        test: {
                            name: "filea",
                            size: 5,
                            total: 10,
                        },
                        testa: {
                            name: "fileb",
                            size: 10,
                            total: 10,
                            done: true,
                        },
                        testb: {
                            name: "filec",
                            size: 10,
                            total: 10,
                            error: "upload failed",
                        },
                    }),
                },
            },
        })
        await setStateToDB("conversations", get(this.conversations))
    }
}

export const ConversationStore = new Conversations()
