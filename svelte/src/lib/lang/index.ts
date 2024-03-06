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
                    }
                }
            },
        },
    });

    locale.set('en');
}