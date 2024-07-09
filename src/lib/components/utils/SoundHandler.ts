import { Howl } from "howler"

export enum Sounds {
    Disconnect = "/assets/mp3/disconnect.mp3",
    IncomingCall = "/assets/mp3/incoming-call.mp3",
    Joined = "/assets/mp3/joined.mp3",
    Notification = "/assets/mp3/notification.mp3",
    Off = "/assets/mp3/off.mp3",
    On = "/assets/mp3/on.mp3",
    OutgoingCall = "/assets/mp3/outgoing-call.mp3",
    Press = "/assets/mp3/press.mp3",
    Release = "/assets/mp3/release.mp3",
    Request = "/assets/mp3/request.mp3",
    Sample = "/assets/mp3/sample.mp3",
}

export type SoundOption = {
    // If the file is a large file and thus should be streamed
    large?: boolean
    volume?: number
    loop?: boolean
}

export class SoundHandler {
    private sound: Howl
    private muted: boolean = false

    constructor(sound: Howl) {
        this.sound = sound
    }

    mute() {
        this.muted = !this.muted
        this.sound.mute(!this.muted)
    }

    isMuted(): boolean {
        return this.muted
    }

    pause() {
        this.sound.pause()
    }

    play() {
        this.sound.play()
    }

    paused(): boolean {
        return !this.sound.playing()
    }

    stop() {
        this.sound.stop()
        this.sound.unload()
    }
}

export function playSound(src: string | Sounds, opt?: SoundOption): SoundHandler {
    var sound = new Howl({
        src: [src.toString()],
        html5: opt?.large,
        volume: opt?.volume ? opt?.volume : 1,
        loop: opt?.loop,
    })
    sound.play()
    return new SoundHandler(sound)
}
