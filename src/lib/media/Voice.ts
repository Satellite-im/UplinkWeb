import { Store } from "$lib/state/Store"
import { log } from "$lib/utils/Logger"
import Peer, { DataConnection, MediaConnection } from "peerjs"
import { t } from "svelte-i18n"
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
    localStream: MediaStream | null = null
    remoteStream: MediaStream | null = null
    remoteVideoElement: HTMLVideoElement | null = null
    localVideoCurrentSrc: HTMLVideoElement | null = null
    remotePeerId: string | null = null
    activeCall: MediaConnection | null = null
    callOptions: VoiceRTCOptions
    isReceivingCall = false
    makingCall = false
    acceptedIncomingCall = false
    dataConnection: DataConnection | null = null

    constructor(channel: string, options: VoiceRTCOptions) {
        log.info("Initializing VoiceRTC")
        this.channel = channel
        this.callOptions = { ...options }
        this.setupPeerEvents()
    }

    setChannel(channel: string) {
        this.channel = channel
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
            this.localPeer = null
        }

        try {
            this.localPeer = new Peer(peerId)
        } catch (error) {
            log.error(`Error creating Peer: ${error}`)
            this.localPeer?.destroy()
            this.localPeer = null
            this.localPeer = new Peer(peerId)
        }

        this.localPeer!.on("open", id => {
            log.debug(`My peer ID is: ${id}`)
        })

        this.localPeer!.on("connection", this.handlePeerConnection.bind(this))
        this.localPeer!.on("call", async call => {
            this.activeCall = call
            if (!this.makingCall) {
                this.isReceivingCall = true
            }
            console.log("Incoming call", this.isReceivingCall)
        })
        this.localPeer!.on("error", this.handleError.bind(this))
    }

    private handlePeerConnection(conn: DataConnection) {
        this.dataConnection = conn
        conn.on("open", () => {
            log.debug("Connection between peers established")
        })

        conn.on("data", data => {
            console.log("Data received from user that received a call: ", data)
            switch (data) {
                case VoiceRTCMessageType.EndingCall:
                    this.endCall()
                    break
                case VoiceRTCMessageType.Calling:
                    this.isReceivingCall = true
                    break
                case VoiceRTCMessageType.None:
                    break
                default:
                    this.channel = data as string
            }
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
    }

    public async acceptIncomingCall() {
        this.acceptedIncomingCall = true
    }

    private async improveAudioQuality() {
        const audioContext = new window.AudioContext()
        const source = audioContext.createMediaStreamSource(this.localStream!)
        const destination = audioContext.createMediaStreamDestination()

        const gainNode = audioContext.createGain()
        const echoCancellation = audioContext.createBiquadFilter()
        const noiseSuppression = audioContext.createBiquadFilter()

        echoCancellation.type = "lowshelf"
        echoCancellation.frequency.setValueAtTime(1000, audioContext.currentTime)
        echoCancellation.gain.setValueAtTime(-40, audioContext.currentTime)

        noiseSuppression.type = "highpass"
        noiseSuppression.frequency.setValueAtTime(2000, audioContext.currentTime)
        noiseSuppression.gain.setValueAtTime(-30, audioContext.currentTime)

        source.connect(echoCancellation)
        echoCancellation.connect(noiseSuppression)
        noiseSuppression.connect(gainNode)
        gainNode.connect(destination)

        const processedStream = new MediaStream()
        processedStream.addTrack(destination.stream.getAudioTracks()[0])
        processedStream.addTrack(this.localStream!.getVideoTracks()[0])
        this.localStream!.getVideoTracks().forEach(track => processedStream.addTrack(track))
    }

    public async acceptCall() {
        this.localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                aspectRatio: 16 / 9,
                facingMode: this.callOptions.video.selfie ? "user" : "environment",
                frameRate: 30,
                height: { ideal: 1080 },
                width: { ideal: 1920 },
            },
            audio: {
                echoCancellation: { ideal: true },
                noiseSuppression: { ideal: true },
                autoGainControl: { ideal: true },
                sampleRate: 48000,
                sampleSize: 16,
                channelCount: 2,
            },
        })

        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = this.localStream
            this.localVideoCurrentSrc.play()
        }

        await this.improveAudioQuality()

        this.activeCall!.answer(this.localStream)

        this.activeCall!.on("stream", remoteStream => {
            if (this.remoteVideoElement) {
                this.remoteVideoElement.srcObject = remoteStream
                this.remoteVideoElement.play()
            }
        })
    }

    public async makeVideoCall() {
        this.dataConnection = this.localPeer!.connect(this.remotePeerId!)

        this.dataConnection.send(VoiceRTCMessageType.Calling)
        this.dataConnection.send(this.channel)

        this.dataConnection.on("data", data => {
            console.log("Data received from user that made call: ", data)
            switch (data) {
                case VoiceRTCMessageType.EndingCall:
                    this.endCall()
                    break
                case VoiceRTCMessageType.Calling:
                    this.isReceivingCall = true
                    break
                case VoiceRTCMessageType.None:
                    break
                default:
                    this.channel = data as string
            }
        })

        this.makingCall = true

        this.localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                aspectRatio: 16 / 9,
                facingMode: this.callOptions.video.selfie ? "user" : "environment",
                frameRate: 30,
                height: { ideal: 1080 },
                width: { ideal: 1920 },
            },
            audio: {
                echoCancellation: { ideal: true },
                noiseSuppression: { ideal: true },
                autoGainControl: { ideal: true },
                sampleRate: 48000,
                sampleSize: 16,
                channelCount: 2,
            },
        })

        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = this.localStream
            this.localVideoCurrentSrc.play()
        }

        await this.improveAudioQuality()

        const call = this.localPeer!.call(this.remotePeerId!, this.localStream)

        call.on("stream", remoteStream => {
            if (this.remoteVideoElement) {
                this.remoteVideoElement.srcObject = remoteStream
                this.remoteVideoElement.play()
            }
        })
    }

    async startToMakeACall(remotePeerId: string, chatID: string) {
        this.channel = chatID
        const remotePeerIdEdited = remotePeerId.replace("did:key:", "")
        this.remotePeerId = remotePeerIdEdited
        this.makingCall = true
    }

    endCall() {
        this.dataConnection!.send(VoiceRTCMessageType.EndingCall)
        this.localStream?.getTracks().forEach(track => track.stop())
        this.localStream = null
        this.makingCall = false
        this.acceptedIncomingCall = false
        this.isReceivingCall = false

        this.remoteStream?.getTracks().forEach(track => track.stop())
        this.remoteStream = null

        this.activeCall?.close()
        this.activeCall = null

        if (this.remoteVideoElement) {
            this.remoteVideoElement.pause()
            this.remoteVideoElement.srcObject = null
            this.remoteVideoElement = null
        }
        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.pause()
            this.localVideoCurrentSrc.srcObject = null
            this.localVideoCurrentSrc = null
        }

        log.info("Call ended and resources cleaned up.")
        this.setupPeerEvents()
    }

    handleError(error: Error) {
        log.error(`Error: ${error}`)
    }
}

export const VoiceRTCInstance = new VoiceRTC("default", {
    audio: true,
    video: {
        enabled: true,
        selfie: true,
    },
})
