import { SettingsStore } from "$lib/state"
import { Store } from "$lib/state/Store"
import { log } from "$lib/utils/Logger"
import Peer, { DataConnection, MediaConnection } from "peerjs"
import { c } from "svelte-highlight/languages"
import { t } from "svelte-i18n"
import { get } from "svelte/store"

export enum VoiceRTCMessageType {
    Calling = "CALLING_USER",
    EndingCall = "ENDING_CALL",
    IncomingCall = "INCOMING_CALL",
    AcceptedCall = "ACCEPTED_CALL",
    EnabledVideo = "ENABLED_VIDEO",
    DisabledVideo = "DISABLED_VIDEO",
    EnabledAudio = "ENABLED_AUDIO",
    DisabledAudio = "DISABLED_AUDIO",
    None = "NONE",
}

type VoiceRTCOptions = {
    audio: boolean
    video: {
        enabled: boolean
        selfie: boolean
    }
}

type VoiceRTCUser = {
    did: string
    videoEnabled: boolean
    audioEnabled: boolean
}

type VoiceMessage = {
    type: VoiceRTCMessageType
    channel: string
    userInfo: VoiceRTCUser
}

export class VoiceRTC {
    channel: string
    localPeer: Peer | null = null
    localStream: MediaStream | null = null
    remoteStream: MediaStream | null = null
    remoteVideoElement: HTMLVideoElement | null = null
    localVideoCurrentSrc: HTMLVideoElement | null = null
    remotePeerId: string | null = null
    remoteVoiceUser: VoiceRTCUser | null = null
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
            if (this.localPeer.destroyed) {
                log.debug("Creating a new peer since the old one was destroyed")
                this.localPeer = new Peer(peerId)
            } else if (this.localPeer.disconnected) {
                this.localPeer.reconnect()
            }
        } else {
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
        this.dataConnection?.send({
            type: VoiceRTCMessageType.IncomingCall,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio,
            },
        })
        conn.on("open", () => {
            log.debug("Connection between peers established")
        })

        conn.on("data", data => {
            let dataReceived = data as VoiceMessage
            console.log("Data received from user that received a call: ", dataReceived)
            this.handleWithDataReceived(dataReceived)
        })
    }

    handleWithDataReceived(dataReceived: VoiceMessage) {
        switch (dataReceived.type) {
            case VoiceRTCMessageType.EndingCall:
                this.endCall()
                break
            case VoiceRTCMessageType.Calling:
                if (!this.makingCall) {
                    this.isReceivingCall = true
                }
                this.remoteVoiceUser = dataReceived.userInfo
                this.channel = dataReceived.channel
                break
            case VoiceRTCMessageType.AcceptedCall:
            case VoiceRTCMessageType.IncomingCall:
            case VoiceRTCMessageType.EnabledVideo:
            case VoiceRTCMessageType.DisabledVideo:
            case VoiceRTCMessageType.EnabledAudio:
            case VoiceRTCMessageType.DisabledAudio:
                this.updateRemoteUserInfo(dataReceived)
                break
            case VoiceRTCMessageType.None:
                break
            default:
                log.debug(`Unknown message type: ${dataReceived.type}`)
        }
    }

    updateRemoteUserInfo(dataReceived: VoiceMessage) {
        this.channel = dataReceived.channel
        this.remoteVoiceUser = dataReceived.userInfo
        Store.setActiveCall(Store.getCallingChat(this.channel)!)
    }

    turnOnOffCamera() {
        this.callOptions.video.enabled = !this.callOptions.video.enabled
        this.localStream?.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled
        })
        this.dataConnection?.send({
            type: this.callOptions.video.enabled ? VoiceRTCMessageType.EnabledVideo : VoiceRTCMessageType.DisabledVideo,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio,
            },
        })
        Store.setActiveCall(Store.getCallingChat(this.channel)!)
    }

    turnOnOffMicrophone() {
        this.callOptions.audio = !this.callOptions.audio
        this.localStream?.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled
        })
        this.dataConnection?.send({
            type: this.callOptions.audio ? VoiceRTCMessageType.EnabledAudio : VoiceRTCMessageType.DisabledAudio,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio,
            },
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
        await this.updateLocalStream()

        this.dataConnection?.send({
            type: VoiceRTCMessageType.AcceptedCall,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio,
            },
        })

        this.activeCall!.answer(this.localStream!)

        this.activeCall!.on("stream", remoteStream => {
            if (this.remoteVideoElement) {
                this.remoteVideoElement.srcObject = remoteStream
                this.remoteStream = remoteStream
                this.remoteVideoElement.play()
            }
        })
    }

    public async makeVideoCall() {
        await this.setupPeerEvents()

        this.dataConnection = this.localPeer!.connect(this.remotePeerId!)

        this.dataConnection.send({
            type: VoiceRTCMessageType.Calling,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio,
            },
        })

        this.dataConnection.on("data", data => {
            let dataReceived = data as VoiceMessage
            console.log("Data received from user that made call: ", dataReceived)
            this.handleWithDataReceived(dataReceived)
        })

        this.makingCall = true

        await this.updateLocalStream()

        const call = this.localPeer!.call(this.remotePeerId!, this.localStream!)

        call.on("stream", remoteStream => {
            if (this.remoteVideoElement) {
                this.remoteVideoElement.srcObject = remoteStream
                this.remoteStream = remoteStream
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

    async updateLocalStream() {
        try {
            let videoInputDevice = get(Store.state.devices.video)
            let audioInputDevice = get(Store.state.devices.input)
            let settingsStore = get(SettingsStore.state)

            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    aspectRatio: 16 / 9,
                    facingMode: this.callOptions.video.selfie ? "user" : "environment",
                    frameRate: 30,
                    height: { ideal: 1080 },
                    width: { ideal: 1920 },
                    deviceId: videoInputDevice ? { exact: videoInputDevice } : undefined,
                },
                audio: {
                    echoCancellation: settingsStore.calling.echoCancellation ?? true,
                    noiseSuppression: settingsStore.calling.noiseSuppression ?? true,
                    autoGainControl: settingsStore.calling.automaticGainControl ?? true,
                    sampleRate: settingsStore.calling.bitrate ?? 48000,
                    sampleSize: settingsStore.calling.sampleSize ?? 16,
                    channelCount: settingsStore.calling.channels ?? 2,
                    deviceId: audioInputDevice ? { exact: audioInputDevice } : undefined,
                },
            })
        } catch (_) {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            })
        }

        this.callOptions.video.enabled = true
        this.callOptions.audio = true

        this.dataConnection?.send({
            type: VoiceRTCMessageType.Calling,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio,
            },
        })

        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = this.localStream
            this.localVideoCurrentSrc.play()
        }

        await this.improveAudioQuality()
    }

    endCall() {
        this.dataConnection!.send({
            type: VoiceRTCMessageType.EndingCall,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio,
            },
        })
        this.localStream?.getTracks().forEach(track => track.stop())
        this.localStream = null
        this.makingCall = false
        this.acceptedIncomingCall = false
        this.isReceivingCall = false

        this.remoteStream?.getTracks().forEach(track => track.stop())
        this.remoteStream = null

        this.activeCall?.close()
        this.activeCall = null

        if (this.localPeer) {
            this.localPeer?.disconnect()
            this.localPeer?.destroy()
            this.localPeer = null
        }

        if (this.dataConnection) {
            this.dataConnection.close()
            this.dataConnection = null
        }

        this.remoteVoiceUser = null

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
