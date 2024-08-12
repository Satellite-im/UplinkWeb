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

        if (this.localPeer === null) {
            this.localPeer = new Peer(peerId)
        }

        this.localPeer!.on("open", id => {
            log.debug(`My peer ID is: ${id}`)
        })

        this.localPeer!.on("connection", this.handlePeerConnection.bind(this))
        this.localPeer!.on("call", async call => {
            this.activeCall = call
            this.channel = call.metadata.channel
            if (!this.makingCall) {
                this.isReceivingCall = true
                Store.setPendingCall(Store.getCallingChat(this.channel)!, CallDirection.Inbound)
            }
            log.debug(`Incoming call: ${this.isReceivingCall}`)
        })
        this.localPeer!.on("error", this.handleError.bind(this))
    }

    private handlePeerConnection(conn: DataConnection) {
        this.remoteVoiceUser = {
            did: conn.metadata.did,
            videoEnabled: conn.metadata.videoEnabled,
            audioEnabled: conn.metadata.audioEnabled,
        }

        this.dataConnection = conn

        conn.on("open", () => {
            log.debug("Connection between peers established")
        })

        this.dataConnection?.send({
            type: VoiceRTCMessageType.IncomingCall,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio,
            },
        })

        conn.on("data", data => {
            let dataReceived = data as VoiceMessage
            log.debug(`Data received from user that received a call: ${dataReceived}`)
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
        // if (this.callOptions.audio) {
        //     // Se a track já foi removida ou parada, crie uma nova track de áudio
        //     if (!this.callOptions.audioTrack || this.callOptions.audioTrack.readyState === "ended") {
        //         const audioContext = new AudioContext()
        //         const newTrack = audioContext.createMediaStreamSource(this.localStream!).mediaStream.getAudioTracks()[0]

        //         this.callOptions.audioTrack = newTrack // Atualize a referência da track
        //     }
        //     this.localStream?.addTrack(this.callOptions.audioTrack!)
        // } else {
        //     // Remover a track de áudio do stream
        //     this.localStream?.removeTrack(this.callOptions.audioTrack!)
        // }
        if (this.callOptions.audio) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: this.callOptions.video.enabled }).then(stream => {
                const audioTrack = stream.getAudioTracks()[0]
                this.localStream?.addTrack(audioTrack)
                this.callOptions.audioTrack = audioTrack
            })
        } else {
            this.localStream?.getAudioTracks().forEach(track => track.stop())
            this.localStream?.removeTrack(this.callOptions.audioTrack!)
        }

        this.localStream?.getAudioTracks().forEach(track => {
            console.log("Track enabled: ", track)
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
        Store.updateMuted(!this.callOptions.audio)
        Store.setActiveCall(Store.getCallingChat(this.channel)!)
    }

    turnOnOffDeafened() {
        let isDeafened = false

        this.remoteStream?.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled
            if (!track.enabled) {
                isDeafened = true
            } else {
                isDeafened = false
            }
        })
        Store.updateDeafened(isDeafened)
    }

    async setVideoElements(remoteVideoElement: HTMLVideoElement, localVideoCurrentSrc: HTMLVideoElement) {
        this.remoteVideoElement = remoteVideoElement
        this.localVideoCurrentSrc = localVideoCurrentSrc
        new Promise(resolve => setTimeout(resolve, 500))
    }

    public async acceptIncomingCall() {
        this.callOptions.audio = false
        Store.updateMuted(true)
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

        this.activeCall!.on("stream", async remoteStream => {
            if (this.remoteVideoElement) {
                this.remoteVideoElement.srcObject = remoteStream
                this.remoteStream = remoteStream
                if (this.remoteVideoElement.readyState >= 2) {
                    await this.remoteVideoElement.play()
                }
            }
        })
    }

    public async makeVideoCall() {
        try {
            await this.setupPeerEvents()

            this.dataConnection = this.localPeer!.connect(this.remotePeerId!, {
                reliable: true,
                metadata: {
                    did: this.localPeer!.id,
                    videoEnabled: this.callOptions.video.enabled,
                    audioEnabled: this.callOptions.audio,
                },
            })

            console.log("Data connection established: ", this.dataConnection)

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
                log.debug(`Data received from user that made call: ${dataReceived}`)
                this.handleWithDataReceived(dataReceived)
            })

            await this.updateLocalStream()

            const call = this.localPeer!.call(this.remotePeerId!, this.localStream!, {
                metadata: {
                    channel: this.channel,
                    userInfo: {
                        did: this.localPeer!.id,
                        videoEnabled: this.callOptions.video.enabled,
                        audioEnabled: this.callOptions.audio,
                    },
                },
            })

            call.on("stream", async remoteStream => {
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
            console.error("Error making call: ", error)
        }
    }

    async startToMakeACall(remotePeerId: string, chatID: string) {
        this.callOptions.audio = false
        Store.updateMuted(true)

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
                audio: this.callOptions.video.enabled
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
            log.error("Error getting user media: ${error}")
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            })
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

        await this.improveAudioQuality()
        this.callOptions.audioTrack = this.localStream.getAudioTracks()[0]
        this.localStream.removeTrack(this.localStream.getAudioTracks()[0])
    }

    endCall() {
        this.dataConnection?.send({
            type: VoiceRTCMessageType.EndingCall,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio,
            },
        })

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
