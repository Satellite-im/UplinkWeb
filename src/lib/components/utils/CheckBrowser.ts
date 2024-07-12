export let notSupportedOn = "Not supported on this browser."

export function checkIfBrowserIsSafari(): boolean {
    var ua = navigator.userAgent.toLowerCase(); 
    return (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1);
}