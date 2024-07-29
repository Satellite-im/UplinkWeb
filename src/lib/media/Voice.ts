import { Store } from "$lib/state/Store"
import { log } from "$lib/utils/Logger"
import Peer, { DataConnection, MediaConnection } from "peerjs"
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

class VoiceRTC {
    channel: string
    localPeer: Peer | null = null
    remotePeer: Peer | null = null
    localStream: MediaStream | null = null
    localVideoEl: any
    localVideoCurrentSrc: any
    callOptions: VoiceRTCOptions
    isReceivingCall: boolean = false
    dataConnection: DataConnection | null = null
    private _incomingCall: MediaConnection | null = null

    get incomingCall(): MediaConnection | null {
        return this._incomingCall
    }

    constructor(channel: string, options: VoiceRTCOptions) {
        log.info("Initializing VoiceRTC")
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

    private async setupPeerEvents() {
        let userId = get(Store.state.user).key
        while (userId === "0x0") {
            userId = get(Store.state.user).key
            console.log("User ID: ", userId)
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        const peerId = userId.replace("did:key:", "")
        if (this.localPeer) {
            log.debug("Destroying existing peer")
            this.localPeer.destroy()
        }

        try {
            this.localPeer = new Peer(peerId)
        } catch (error) {
            log.error(`Error creating Peer: ${error}`)
            this.localPeer?.destroy()
            this.localPeer = new Peer(peerId)
        }

        this.localPeer!.on("open", id => {
            log.debug("My peer ID is: " + id)
        })

        this.localPeer!.on("connection", conn => {
            conn.on("open", () => {
                console.log("Connection Opened!")
            })

            conn.on("data", data => {
                if (data === VoiceRTCMessageType.EndingCall) {
                    this.endCall()
                }
            })
        })

        this.localPeer!.on("call", async call => {
            log.info(`Incoming call from: ${call.peer}`)
            this.isReceivingCall = true
            this._incomingCall = call
            this.handleIncomingCall(call)
        })

        this.localPeer!.on("error", this.error)
    }

    private handleIncomingCall(call: MediaConnection) {
        call.on("stream", remoteStream => {
            if (this.localVideoEl) {
                this.localVideoEl.srcObject = remoteStream
                this.localVideoEl.play()
            }
        })

        call.on("close", () => {
            console.log("Call closed by remote peer")
            this.endCall()
        })

        call.on("error", err => {
            console.error("Call error:", err)
            this.endCall()
        })
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
        if (this._incomingCall) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: this.callOptions.video.enabled,
                    audio: this.callOptions.audio,
                })
                this.localStream = stream
                this._incomingCall.answer(stream)

                if (this.localVideoCurrentSrc) {
                    this.localVideoCurrentSrc.srcObject = stream
                    this.localVideoCurrentSrc.play()
                }

                this._incomingCall.on("stream", remoteStream => {
                    if (this.localVideoEl) {
                        this.localVideoEl.srcObject = remoteStream
                        this.localVideoEl.play()
                    }
                })

                this._incomingCall.on("close", () => {
                    console.log("Call closed")
                    this.endCall()
                })
                this._incomingCall.on("error", err => {
                    console.error("Call error:", err)
                })

                this._incomingCall = null
            } catch (error) {
                console.error("Error accepting call:", error)
            }
        } else {
            console.log("No incoming call to accept")
        }
    }

    async makeVideoCall(remotePeerId: string) {
        try {
            this.dataConnection?.send(VoiceRTCMessageType.Calling)
            const remotePeerIdEdited = remotePeerId.replace("did:key:", "")
            console.log("Remote user Peer: ", remotePeerIdEdited)

            this.dataConnection = this.localPeer!.connect(remotePeerIdEdited)

            this.dataConnection.on("data", data => {
                console.log("new data " + data)
            })

            this.dataConnection.on("open", () => {
                this.dataConnection?.send("hi")
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
                console.log("Call closed by remote peer")
            })
            call.on("error", err => {
                console.error("Call error:", err)
            })
        } catch (error) {
            console.error("Error accessing media devices:", error)
        }
    }

    endCall() {
        this.dataConnection?.send(VoiceRTCMessageType.EndingCall)
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop()
            })
            this.localStream = null
        }

        if (this._incomingCall) {
            this._incomingCall.close()
            this._incomingCall = null
        }

        if (this.localVideoEl) {
            this.localVideoEl.srcObject = null
        }
        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = null
        }

        this.isReceivingCall = false
        Store.state.activeCall.set(null)
        log.info("Call ended and resources cleaned up.")
    }

    error(error: Error) {
        console.error("Error:", error)
    }
}

export const VoiceRTCInstance = new VoiceRTC("default", {
    audio: true,
    video: {
        enabled: true,
        selfie: true,
    },
})
