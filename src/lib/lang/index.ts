import { dictionary, locale } from 'svelte-i18n'


export function initLocale() {
    dictionary.set({
        en: {
            generic: {
                accept: "Accept",
                deny: "Deny",
                add: "Add",
                remove: "Remove",
                save: "Save",
                cancel: "Cancel",
                copy: "Copy",
                loading: "Loading",
                username: "Username",
                status_message: "Status Message",
                enter_pin: "Enter Pin",
                placeholder: "Type something ...",
                search_placeholder: "Search ...",
                no_results: "No results found.",
                search_results: "Search results"
            },
            market: {
                market: "Marketplace",
            },
            call: {
                end: "End",
                mute: "Mute",
                stream: "Stream",
                in_call: "In Call",
            },
            chat: {
                chat: "Chat",
                chat_plural: "Chats",
                create: "Create Chat",
                add_attachment: "Add attachment",
                emoji: "Emoji",
                send: "Send",
            },
            friends: {
                copy_did: "Copy ID",
                block: "Block",
                blocked: "Blocked",
                blocked_users: "Blocked Users",
                unblock: "Unblock",
                all: "All",
                active: "Active",
                add: "Add",
                add_someone: "Add Someone",
                search_friends_placeholder: "Search friends",
                find_placeholder: "Find Username#xxxxxx ...",
                incoming_requests: "Incoming Requests",
                outgoing_requests: "Outgoing Requests",
            },
            files: {
                file_plural: "Files",
                new_folder: "New Folder",
                upload: "Upload",
            },
            payments: {
                send_coin: "Send Coin"
            },
            controls: {
                go_back: "Go Back",
            },
            pages: {
                auth: {
                    unlock: {
                        enter_pin: "Enter your pin to unlock.",
                        choose_pin: "Choose a new pin.",
                        scramble_pin: "Scramble keypad?"
                    },
                    recovery: {
                        title: "Backup your seed!",
                        save_warning: "Please ensure you write down this message with all words recorded in the order they appear. It can be helpful to write down the numbers along with the words.",
                        download: "Download Backup",
                        next_step: "Saved It, Next Step"
                    },
                    new_account: {
                        title: "Make It Yours",
                        subtext: "Let's setup your new account. Please choose a username below.",
                        enter_username: "Enter username . . .",
                        set_status: "Set status message . . .",
                        create: "Create Account"
                    }
                }
            },
            user: {
                status: {
                    label: "Status",
                    online: "Online",
                    offline: "Offline",
                    idle: "Idle",
                    do_not_disturb: "Do Not Disturb"
                },
                status_message: "Status message",
                set_status_message: "Set a status message",
                set_status: "Set status appearance",
            },
            settings: {
                profile: {
                    change_profile_photo: "Change profile photo",
                    reveal_phrase: {
                        label: "Reveal recovery phrase",
                        description: "Click the button to reveal your recovery seed, please do not share this with anybody, it is the master-key for your account.",
                        show: "Reveal Phrase",
                        hide: "Hide Phrase",
                    },
                    should_store: "Store recovery seed on account (disable for increased security, irriversable)"
                }
            }
        },
    })

    locale.set('en')
}