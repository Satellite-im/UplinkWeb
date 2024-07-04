export enum Sound {
    On = "/assets/mp3/on.mp3",
    Off = "/assets/mp3/off.mp3",
    Joined = "/assets/mp3/joined.mp3",
    Disconnect = "/assets/mp3/disconnect.mp3",
    Notification = "/assets/mp3/notification.mp3",
    OutgoingCall = "/assets/mp3/outgoing-call.mp3",
    IncomingCall = "/assets/mp3/incoming-call.mp3",
    Request = "/assets/mp3/request.mp3",
    Press = "/assets/mp3/press.mp3",
    Release = "/assets/mp3/release.mp3",
}

let on: HTMLAudioElement = new Audio(Sound.On)
let off: HTMLAudioElement = new Audio(Sound.Off)
let joined: HTMLAudioElement = new Audio(Sound.Joined)
let disconnect: HTMLAudioElement = new Audio(Sound.Disconnect)
let notification: HTMLAudioElement = new Audio(Sound.Notification)
let outgoingCall: HTMLAudioElement = new Audio(Sound.OutgoingCall)
let incomingCall: HTMLAudioElement = new Audio(Sound.IncomingCall)
let request: HTMLAudioElement = new Audio(Sound.Request)
let press: HTMLAudioElement = new Audio(Sound.Press)
let release: HTMLAudioElement = new Audio(Sound.Release)

export class Sounds {
    constructor() {}
    static play(sound: Sound) {
        switch (sound) {
            case Sound.On:
                this.on()
                break
            case Sound.Off:
                this.off()
                break
            case Sound.Joined:
                this.joined()
                break
            case Sound.Disconnect:
                this.disconnect()
                break
            case Sound.Notification:
                this.notification()
                break
            case Sound.OutgoingCall:
                this.outgoingCall()
                break
            case Sound.IncomingCall:
                this.incomingCall()
                break
            case Sound.Request:
                this.request()
                break
            case Sound.Press:
                this.press()
                break
            case Sound.Release:
                this.release()
                break
        }
    }

    static stopAll() {
        on.pause()
        off.pause()
        joined.pause()
        disconnect.pause()
        notification.pause()
        incomingCall.pause()
        outgoingCall.pause()
        request.pause()
        press.pause()
        release.pause()

        on.currentTime = 0
        off.currentTime = 0
        joined.currentTime = 0
        disconnect.currentTime = 0
        notification.currentTime = 0
        incomingCall.currentTime = 0
        outgoingCall.currentTime = 0
        request.currentTime = 0
        press.currentTime = 0
        release.currentTime = 0
    }

    static on() {
        this.stopAll()
        on.play()
    }

    static off() {
        this.stopAll()
        off.play()
    }

    static joined() {
        this.stopAll()
        joined.play()
    }

    static disconnect() {
        this.stopAll()
        disconnect.play()
    }

    static notification() {
        this.stopAll()
        notification.play()
    }

    static incomingCall() {
        this.stopAll()
        incomingCall.play()
    }

    static outgoingCall() {
        this.stopAll()
        outgoingCall.play()
    }

    static request() {
        this.stopAll()
        request.play()
    }

    static press() {
        this.stopAll()
        press.play()
    }

    static release() {
        this.stopAll()
        release.play()
    }
}
