import { dictionary, locale } from 'svelte-i18n';


export function initLocale() {
    dictionary.set({
        en: {
            generic: {
                loading: "Loading",
            },
            pages: {
                auth: {
                    unlock: {
                        enter_pin: "Enter your pin to unlock.",
                        choose_pin: "Choose a new pin.",
                        scramble_pin: "Scramble keypad?"
                    },
                    recovery: {
                        save_warning: "Please ensure you write down this message with all words recorded in the order they appear. It can be helpful to write down the numbers along with the words."
                    }
                }
            },
        },
    });

    locale.set('en');
}