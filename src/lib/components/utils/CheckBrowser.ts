export let notSupportedOn = "Not supported on this browser."

export function checkIfBrowserIsSupported(): boolean {
    const userAgent = navigator.userAgent.toLowerCase()

    const isSafari = userAgent.indexOf("safari") !== -1 && userAgent.indexOf("chrome") === -1
    const isFirefox = userAgent.indexOf("firefox") !== -1

    if (!isSafari && !isFirefox) {
        return true
    } else {
        return false
    }
}
