import { log } from "$lib/utils/Logger"
import { register, init, getLocaleFromNavigator } from "svelte-i18n"

register("en", () => import("./en.json"))

export async function initializeLocale() {
    register("en", () => import("./en.json"))

    await init({
        fallbackLocale: "en",
        initialLocale: getLocaleFromNavigator(),
    })

    log.debug("Locale initialized")
}
