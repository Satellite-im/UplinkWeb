import { dictionary, locale } from 'svelte-i18n';


export function initLocale() {
    dictionary.set({
        en: {
            generic: {
                loading: "Loading",
                username: "Username",
                status_message: "Status Message",
                enter_pin: "Enter Pin",
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
        },
    });

    locale.set('en');
}