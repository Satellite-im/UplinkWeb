import { CallDirection } from "$lib/enums"
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
    audioTrack: MediaStreamTrack | null
    video: {
        enabled: boolean
        selfie: boolean
    }
}

type VoiceRTCUser = {
    did: string
    username: string
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
    remoteVoiceUser: VoiceRTCUser = {
        did: "",
        username: "unknown",
        videoEnabled: false,
        audioEnabled: false,
    }
    activeCall: MediaConnection | null = null
    callOptions: VoiceRTCOptions
    isReceivingCall = false
    makingCall = false
    acceptedIncomingCall = false
    dataConnection: DataConnection | null = null

    constructor(channel: string, options: VoiceRTCOptions) {
        this.channel = channel
        this.callOptions = { ...options }
        this.setupPeerEvents()
    }

    async setVideoElements(remoteVideoElement: HTMLVideoElement, localVideoCurrentSrc: HTMLVideoElement) {
        this.remoteVideoElement = remoteVideoElement
        this.localVideoCurrentSrc = localVideoCurrentSrc
        new Promise(resolve => setTimeout(resolve, 500))
    }

    private async setupPeerEvents() {
        let userId = get(Store.state.user).key
        while (userId === "0x0") {
            userId = get(Store.state.user).key
            await new Promise(resolve => setTimeout(resolve, 500))
        }
        const peerId = userId.replace("did:key:", "")

        if (this.localPeer === null) {
            this.localPeer = new Peer(peerId)
        }

        this.localPeer!.on("open", id => {
            log.debug(`My peer ID is: ${id}`)
        })

        this.localPeer!.on("connection", this.handlePeerConnection.bind(this))

        this.localPeer!.on("connection", this.handlePeerConnection.bind(this))
        this.localPeer!.on("call", async call => {
            this.activeCall = call
            this.channel = call.metadata.channel
        })
        this.localPeer!.on("error", this.handleError.bind(this))
    }

    private handlePeerConnection(conn: DataConnection) {
        this.remoteVoiceUser = {
            did: conn.metadata.did,
            username: conn.metadata.username,
            videoEnabled: conn.metadata.videoEnabled,
            audioEnabled: conn.metadata.audioEnabled,
        }

        this.channel = conn.metadata.channel
        this.dataConnection = conn

        conn.on("open", () => {
            /// It will appear to user that is receiving the call
            if (!this.makingCall) {
                log.info(`Receiving call on channel: ${conn.metadata.channel} from ${conn.metadata.did}, username: ${conn.metadata.username}`)
                this.isReceivingCall = true
                Store.setPendingCall(Store.getCallingChat(this.channel)!, CallDirection.Inbound)
            }
        })

        this.sendData(VoiceRTCMessageType.IncomingCall)

        conn.on("data", data => {
            let dataReceived = data as VoiceMessage
            this.handleWithDataReceived(dataReceived)
        })

        conn.on("data", data => {
            let dataReceived = data as VoiceMessage
            log.debug(`Data received from user that received a call: ${dataReceived}`)
            this.handleWithDataReceived(dataReceived)
        })
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

        this.sendData(this.callOptions.video.enabled ? VoiceRTCMessageType.EnabledVideo : VoiceRTCMessageType.DisabledVideo)

        Store.setActiveCall(Store.getCallingChat(this.channel)!)
    }

    turnOnOffMicrophone() {
        this.callOptions.audio = !this.callOptions.audio

        if (this.localStream) {
            this.localStream?.getAudioTracks().forEach(track => {
                track.enabled = this.callOptions.audio
            })

            this.localStream.getTracks().forEach(track => {
                if (track.kind === "audio") {
                    track.enabled = this.callOptions.audio
                }
            })

            this.sendData(this.callOptions.audio ? VoiceRTCMessageType.EnabledAudio : VoiceRTCMessageType.DisabledAudio)

            Store.setActiveCall(Store.getCallingChat(this.channel)!)
        }
    }

    turnOnOffDeafened() {
        try {
            if (!this.remoteStream) {
                log.error("Remote stream is not available")
                return
            }

            this.remoteStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled
            })
        } catch (error) {
            log.error(`Error turning on/off deafened: ${error}`)
        }
    }

    public async acceptIncomingCall() {
        this.callOptions.audio = false
        Store.updateMuted(true)
        this.acceptedIncomingCall = true
    }

    public async acceptCall() {
        await this.updateLocalStream()

        await this.sendData(VoiceRTCMessageType.AcceptedCall)

        this.activeCall!.answer(this.localStream!)

        this.activeCall!.on("stream", async remoteStream => {
            /// Here will receive data from user that made the call
            if (this.remoteVideoElement) {
                this.remoteVideoElement.srcObject = remoteStream
                this.remoteStream = remoteStream
                if (this.remoteVideoElement.readyState >= 2) {
                    await this.remoteVideoElement.play()
                }
            }
        })
    }

    async startToMakeACall(remotePeerId: string, chatID: string) {
        this.channel = chatID
        const remotePeerIdEdited = remotePeerId.replace("did:key:", "")
        this.remotePeerId = remotePeerIdEdited
        this.makingCall = true
    }

    public async makeVideoCall() {
        try {
            await this.setupPeerEvents()

            this.dataConnection = this.localPeer!.connect(this.remotePeerId!, {
                reliable: true,
                metadata: {
                    did: this.localPeer!.id,
                    username: get(Store.state.user).name,
                    videoEnabled: this.callOptions.video.enabled,
                    audioEnabled: this.callOptions.audio,
                    channel: this.channel,
                },
            })

            await this.sendData(VoiceRTCMessageType.Calling)

            this.dataConnection.on("data", data => {
                let dataReceived = data as VoiceMessage
                this.handleWithDataReceived(dataReceived)
            })

            await this.updateLocalStream()

            const call = this.localPeer!.call(this.remotePeerId!, this.localStream!, {
                metadata: {
                    channel: this.channel,
                    userInfo: {
                        did: this.localPeer!.id,
                        username: get(Store.state.user).name,
                        videoEnabled: this.callOptions.video.enabled,
                        audioEnabled: this.callOptions.audio,
                    },
                },
            })

            call.on("stream", async remoteStream => {
                /// Here will receive data from user that accepted the call
                if (this.remoteVideoElement) {
                    this.remoteVideoElement.srcObject = remoteStream
                    this.remoteStream = remoteStream
                    if (this.remoteVideoElement.readyState >= 2) {
                        await this.remoteVideoElement.play()
                    }
                }
            })
            Store.setActiveCall(Store.getCallingChat(this.channel)!)
        } catch (error) {
            log.error(`Error making call: ${error}`)
        }

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
            await this.localVideoCurrentSrc.play()
        }
        /// Let it commented for now.
        // await this.improveAudioQuality()
    }

    async updateLocalStream() {
        try {
            let videoInputDevice = get(Store.state.devices.video)
            let audioInputDevice = get(Store.state.devices.input)
            let settingsStore = get(SettingsStore.state)

            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: this.callOptions.video.enabled
                    ? {
                          aspectRatio: 16 / 9,
                          facingMode: this.callOptions.video.selfie ? "user" : "environment",
                          frameRate: 30,
                          height: { ideal: 1080 },
                          width: { ideal: 1920 },
                          deviceId: videoInputDevice ? { exact: videoInputDevice } : undefined,
                      }
                    : false,
                audio: this.callOptions.audio
                    ? {
                          echoCancellation: settingsStore.calling.echoCancellation ?? true,
                          noiseSuppression: settingsStore.calling.noiseSuppression ?? true,
                          autoGainControl: settingsStore.calling.automaticGainControl ?? true,
                          sampleRate: settingsStore.calling.bitrate ?? 48000,
                          sampleSize: settingsStore.calling.sampleSize ?? 16,
                          channelCount: settingsStore.calling.channels ?? 2,
                          deviceId: audioInputDevice ? { exact: audioInputDevice } : undefined,
                      }
                    : false,
            })
        } catch (error) {
            log.error(`Error getting user media: ${error}`)
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            })
        }
        await this.sendData(VoiceRTCMessageType.Calling)

        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = this.localStream
            await this.localVideoCurrentSrc.play()
        }
        /// Let it commented for now.
        // await this.improveAudioQuality()
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

    handleWithDataReceived(dataReceived: VoiceMessage) {
        log.debug(`Data received: ${dataReceived.type}`)
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

    async sendData(type: VoiceRTCMessageType) {
        await this.dataConnection?.send({
            type: type,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                username: get(Store.state.user).name,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio,
            },
        })
    }

    async endCall() {
        await this.sendData(VoiceRTCMessageType.EndingCall)

        this.channel = ""
        this.localStream?.getTracks().forEach(track => track.stop())
        this.localStream = null
        this.makingCall = false
        this.acceptedIncomingCall = false
        this.isReceivingCall = false

        this.remoteStream?.getTracks().forEach(track => track.stop())
        this.remoteStream = null

        if (this.activeCall) {
            this.activeCall.close()
            this.activeCall = null
        }

        if (this.dataConnection) {
            this.dataConnection.close()
            this.dataConnection = null
        }

        this.remoteVoiceUser = {
            did: "",
            username: "unknown",
            videoEnabled: false,
            audioEnabled: false,
        }

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

        if (get(Store.state.activeCall)) {
            Store.endCall()
            Store.denyCall()
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
    audioTrack: null,
    video: {
        enabled: true,
        selfie: true,
    },
})
