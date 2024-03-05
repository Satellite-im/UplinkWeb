import { dictionary, locale } from 'svelte-i18n';


export function initLocale() {
    dictionary.set({
        en: {
            pages: {
                auth: {
                    unlock: {
                        enter_pin: "Enter pin to unlock Uplink.",
                        choose_pin: "Choose a pin to protect your account."
                    }
                }
            },
        },
    });

    locale.set('en');
}