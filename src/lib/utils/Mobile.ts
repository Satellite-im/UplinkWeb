export function checkMobile(): boolean {
    return window.matchMedia("screen and (max-width: 800px)").matches
}
