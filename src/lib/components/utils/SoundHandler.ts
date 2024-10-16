import { log } from "$lib/utils/Logger"
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
    public soundID: number = -1
    private muted: boolean = false

    constructor(sound: Howl, soundID: number) {
        this.sound = sound
        this.soundID = soundID
    }

    mute() {
        this.muted = !this.muted
        this.sound.mute(!this.muted, this.soundID)
    }

    isMuted(): boolean {
        return this.muted
    }

    pause() {
        this.sound.pause(this.soundID)
    }

    play() {
        this.sound.play(undefined, true)
    }

    paused(): boolean {
        return !this.sound.playing(this.soundID)
    }

    stop() {
        this.sound.stop(0, true)
        this.sound.unload()
    }
}

export async function playSound(src: string | Sounds, opt?: SoundOption): Promise<SoundHandler | undefined> {
    try {
        // Ask for permission to play sound
        if (Notification.permission !== "granted") {
            const permission = await Notification.requestPermission()
            if (permission !== "granted") {
                log.warn("Permission to play sound not granted")
                return undefined
            }
        }

        const sound = new Howl({
            src: [src.toString()],
            html5: opt?.large || false,
            volume: opt?.volume || 1,
            loop: opt?.loop || false,
        })

        let soundID = sound.play(undefined, false)

        return new SoundHandler(sound, soundID)
    } catch (error) {
        log.error("Error to play callsound:", error)
        return undefined
    }
}
