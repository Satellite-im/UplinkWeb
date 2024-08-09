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

export class VoiceRTC {
    channel: string
    localPeer: Peer | null = null
    remotePeer: Peer | null = null
    localStream: MediaStream | null = null
    remoteVideoElement: any
    localVideoCurrentSrc: any
    callOptions: VoiceRTCOptions
    isReceivingCall: boolean = false
    acceptedIncomingCall: boolean = false
    dataConnection: DataConnection | null = null
    private _incomingCall: MediaConnection | null = null

    setChannel(channel: string) {
        this.channel = channel
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
            conn.on("open", () => {})

            conn.on("data", data => {
                this.dataConnection = conn
                if (data === VoiceRTCMessageType.EndingCall && this.localStream !== null) {
                    this.isReceivingCall = false
                    this.endCall()
                } else if (data === VoiceRTCMessageType.Calling) {
                    // this.dataConnection.on("data", data => {
                    //     if (data === VoiceRTCMessageType.IncomingCall) {
                    //         this.isReceivingCall = true
                    //     }
                    // })
                } else {
                    this.channel = data as string
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
            if (this.remoteVideoElement) {
                this.remoteVideoElement.srcObject = remoteStream
                this.remoteVideoElement.play()
            }
        })

        call.on("close", () => {})

        call.on("error", err => {
            console.error("Call error:", err)
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

    setVideoElements(remoteVideoElement: HTMLVideoElement, localVideoCurrentSrc: HTMLVideoElement) {
        this.remoteVideoElement = remoteVideoElement
        this.localVideoCurrentSrc = localVideoCurrentSrc
        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = this.localStream
            this.localVideoCurrentSrc.play()
        }
    }

    public async acceptIncomingCall() {
        this.acceptedIncomingCall = true
    }

    public async acceptCall() {
        if (this._incomingCall) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        aspectRatio: 16 / 9,
                        facingMode: this.callOptions.video.selfie ? "user" : "environment",
                        frameRate: 30,
                        height: { ideal: 1080 },
                        width: { ideal: 1920 },
                    },
                    audio: {
                        autoGainControl: false,
                        channelCount: 2,
                        echoCancellation: false,
                        noiseSuppression: false,
                        sampleRate: 48000,
                        sampleSize: 16,
                    },
                })

                this.localStream = stream

                this._incomingCall.answer(this.localStream)

                this.localStream?.getAudioTracks().forEach(track => {
                    track.enabled = false
                })

                this._incomingCall.on("stream", remoteStream => {
                    if (this.remoteVideoElement) {
                        this.remoteVideoElement.srcObject = remoteStream
                        this.remoteVideoElement.play()
                    }

                    if (this.localVideoCurrentSrc) {
                        this.localVideoCurrentSrc.srcObject = this.localStream
                        this.localVideoCurrentSrc.play()
                    }
                })

                this._incomingCall.on("close", () => {})
                this._incomingCall.on("error", err => {
                    console.error("Call error:", err)
                })

                this._incomingCall = null
            } catch (error) {
                console.error("Error accepting call:", error)
            }
        }
    }

    async makeVideoCall(remotePeerId: string, chatID: string) {
        try {
            this.channel = chatID
            this.dataConnection?.send(VoiceRTCMessageType.Calling)
            this.dataConnection?.send(chatID)

            const remotePeerIdEdited = remotePeerId.replace("did:key:", "")

            this.dataConnection = this.localPeer!.connect(remotePeerIdEdited)

            this.dataConnection.on("data", data => {
                if (data === VoiceRTCMessageType.EndingCall && this.localStream !== null) {
                    this.endCall()
                }
            })

            this.dataConnection.on("open", () => {
                this.dataConnection?.send(chatID)
            })

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    aspectRatio: 16 / 9,
                    facingMode: this.callOptions.video.selfie ? "user" : "environment",
                    frameRate: 30,
                    height: { ideal: 1080 },
                    width: { ideal: 1920 },
                },
                audio: {
                    autoGainControl: false,
                    channelCount: 2,
                    echoCancellation: false,
                    noiseSuppression: false,
                    sampleRate: 48000,
                    sampleSize: 16,
                },
            })

            const call = this.localPeer!.call(remotePeerIdEdited, stream)

            this.localStream = stream

            this.localStream?.getAudioTracks().forEach(track => {
                track.enabled = false
            })

            call.on("stream", remoteStream => {
                if (this.remoteVideoElement) {
                    this.remoteVideoElement.srcObject = remoteStream
                    this.remoteVideoElement.play()
                }

                if (this.localVideoCurrentSrc) {
                    this.localVideoCurrentSrc.srcObject = this.localStream
                    this.localVideoCurrentSrc.play()
                }
            })

            call.on("close", () => {})
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

        if (this.remoteVideoElement) {
            this.remoteVideoElement.srcObject = null
        }
        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = null
        }
        log.info("Call ended and resources cleaned up.")
        this.dataConnection?.send(VoiceRTCMessageType.None)
        Store.endCall()
        this.setupPeerEvents()
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
