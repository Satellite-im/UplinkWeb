import { Store } from "$lib/state/Store"
import { log } from "$lib/utils/Logger"
import Peer, { MediaConnection } from "peerjs"
import { get } from "svelte/store"

export enum VoiceRTCMessageType {
    Calling = "CALLING_USER",
    EndingCall = "ENDING_CALL",
    IncomingCall = "INCOMING_CALL",
    None = "NONE",
}

type VoiceRTCOptions = {
    audio: boolean
    video: {
        enabled: boolean
        selfie: boolean
    }
}

export class VoiceRTC {
    channel: string
    localPeer: Peer | null = null
    remotePeer: Peer | null = null
    localStream: MediaStream | null = null
    localVideoEl: any
    localVideoCurrentSrc: any
    callOptions: VoiceRTCOptions
    incomingCall: MediaConnection | null = null

    constructor(channel: string, options: VoiceRTCOptions) {
        this.callOptions = {
            audio: options.audio,
            video: {
                enabled: options.video.enabled,
                selfie: options.video.selfie,
            },
        }
        this.channel = channel
        this.setupPeerEvents()
    }

    private setupPeerEvents() {
        let userId = get(Store.state.user).key
        const peerId = userId.replace("did:key:", "")
        console.log("Local User Peer: ", peerId)
        this.localPeer = new Peer(peerId)

        this.localPeer!.on("open", id => {
            console.log("My peer ID is: " + id)
        })

        this.localPeer!.on("connection", conn => {
            console.log("message....")
            conn.on("data", data => {
                console.log("new data " + data)
            })
            conn.on("open", () => {
                console.log("new message")
            })
        })

        this.localPeer!.on("call", async call => {
            console.log("Incoming call from:", call.peer)
            this.incomingCall = call
        })

        this.localPeer!.on("error", this.error)
    }

    turnOnOffCamera() {
        this.callOptions.video.enabled = !this.callOptions.video.enabled
        this.localStream?.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled
        })
    }

    turnOnOffMicrophone() {
        this.callOptions.audio = !this.callOptions.audio
        this.localStream?.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled
        })
    }

    setVideoElements(localVideoEl: HTMLVideoElement, localVideoCurrentSrc: HTMLVideoElement) {
        this.localVideoEl = localVideoEl
        this.localVideoCurrentSrc = localVideoCurrentSrc
    }

    public async acceptCall() {
        if (this.incomingCall) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: this.callOptions.video.enabled,
                    audio: this.callOptions.audio,
                })
                this.localStream = stream
                this.incomingCall.answer(stream)

                if (this.localVideoCurrentSrc) {
                    this.localVideoCurrentSrc.srcObject = stream
                    this.localVideoCurrentSrc.play()
                }

                this.incomingCall.on("stream", remoteStream => {
                    if (this.localVideoEl) {
                        this.localVideoEl.srcObject = remoteStream
                        this.localVideoEl.play()
                    }
                })

                this.incomingCall.on("close", () => {
                    console.log("Call closed")
                })
                this.incomingCall.on("error", err => {
                    console.error("Call error:", err)
                })

                this.incomingCall = null
            } catch (error) {
                console.error("Error accepting call:", error)
            }
        } else {
            console.log("No incoming call to accept")
        }
    }

    async makeVideoCall(remotePeerId: string) {
        try {
            const remotePeerIdEdited = remotePeerId.replace("did:key:", "")
            console.log("Remote user Peer: ", remotePeerIdEdited)

            const conn = this.localPeer!.connect(remotePeerIdEdited)

            conn.on("data", data => {
                console.log("new data " + data)
            })
            conn.on("open", () => {
                conn.send("hi")
            })

            const stream = await navigator.mediaDevices.getUserMedia({
                video: this.callOptions.video.enabled,
                audio: this.callOptions.audio,
            })

            const call = this.localPeer!.call(remotePeerIdEdited, stream)

            this.localStream = stream

            if (this.localVideoCurrentSrc) {
                this.localVideoCurrentSrc.srcObject = stream
                this.localVideoCurrentSrc.play()
            }

            call.on("stream", remoteStream => {
                if (this.localVideoEl) {
                    this.localVideoEl.srcObject = remoteStream
                    this.localVideoEl.play()
                }
            })

            call.on("close", () => {
                console.log("Call closed")
            })
            call.on("error", err => {
                console.error("Call error:", err)
            })
        } catch (error) {
            console.error("Error accessing media devices:", error)
        }
    }

    endCall() {
        // Stop and release all media tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop()
            })
            this.localStream = null
        }

        // Close any active incoming calls
        if (this.incomingCall) {
            this.incomingCall.close()
            this.incomingCall = null
        }

        // Clear video elements
        if (this.localVideoEl) {
            this.localVideoEl.srcObject = null
        }
        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = null
        }

        // Log and reset state
        log.info("Call ended and resources cleaned up.")
    }

    error(error: Error) {
        console.error("Error:", error)
    }
}
