import { CallDirection } from "$lib/enums"
import { SettingsStore } from "$lib/state"
import { Store } from "$lib/state/Store"
import { log } from "$lib/utils/Logger"
import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
import Peer, { DataConnection, MediaConnection } from "peerjs"
import { get } from "svelte/store"
import { _ } from "svelte-i18n"

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
    audio: {
        enabled: boolean
        deafened: boolean
    }
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
    isDeafened: boolean
}

type VoiceMessage = {
    type: VoiceRTCMessageType
    channel: string
    userInfo: VoiceRTCUser
}

export class VoiceRTC {
    channel: string
    localPeer: Peer | null = null
    remoteVideoElement: HTMLVideoElement | null = null
    localVideoCurrentSrc: HTMLVideoElement | null = null
    remotePeerId: string | null = null
    remoteVoiceUser: VoiceRTCUser = {
        did: "",
        username: "unknown",
        videoEnabled: false,
        audioEnabled: false,
        isDeafened: false,
    }
    activeCall: MediaConnection | null = null
    callOptions: VoiceRTCOptions
    private callStartTime: Date | null = null
    isReceivingCall = false
    makingCall = false
    acceptedIncomingCall = false
    dataConnection: DataConnection | null = null

    constructor(channel: string, options: VoiceRTCOptions) {
        this.channel = channel
        this.callOptions = { ...options }
        this.setupPeerEvents()

        this.subscribe()
    }

    subscribe() {
        Store.state.devices.muted.subscribe(async value => this.toggleMute(value))
        Store.state.devices.cameraEnabled.subscribe(async value => this.toggleVideo(value))
        Store.state.devices.deafened.subscribe(async value => this.toggleDeafen(value))
    }

    toggleVideo(state: boolean) {
        this.callOptions.video.enabled = state

        if (state) {
            this.activeCall?.localStream?.getVideoTracks().forEach(track => (track.enabled = true))
        } else {
            this.activeCall?.localStream?.getVideoTracks().forEach(track => (track.enabled = false))
        }

        this.dataConnection?.send({
            type: this.callOptions.video.enabled ? VoiceRTCMessageType.EnabledVideo : VoiceRTCMessageType.DisabledVideo,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio,
            },
        })
    }

    toggleMute(state: boolean) {
        this.callOptions.audio.enabled = state

        if (state) {
            this.activeCall?.localStream.getAudioTracks().forEach(track => (track.enabled = false))
        } else {
            this.activeCall?.localStream.getAudioTracks().forEach(track => (track.enabled = true))
        }

        this.dataConnection?.send({
            type: this.callOptions.audio.enabled ? VoiceRTCMessageType.EnabledAudio : VoiceRTCMessageType.DisabledAudio,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio.enabled,
                isDeafened: this.callOptions.audio.deafened,
            },
        })
    }

    toggleDeafen(state: boolean) {
        // TODO: This isn't perfect because if you mute yourself, and then deafen yourself, un-deafaning will also unmute you which could be unexpected
        this.callOptions.audio.enabled = state

        if (state) {
            this.activeCall?.remoteStream.getAudioTracks().forEach(track => (track.enabled = false))
            this.activeCall?.localStream.getAudioTracks().forEach(track => (track.enabled = false))
        } else {
            this.activeCall?.remoteStream.getAudioTracks().forEach(track => (track.enabled = true))
            this.activeCall?.localStream.getAudioTracks().forEach(track => (track.enabled = true))
        }

        this.dataConnection?.send({
            type: this.callOptions.audio.enabled ? VoiceRTCMessageType.EnabledAudio : VoiceRTCMessageType.DisabledAudio,
            channel: this.channel,
            userInfo: {
                did: this.localPeer!.id,
                videoEnabled: this.callOptions.video.enabled,
                audioEnabled: this.callOptions.audio.enabled,
                isDeafened: this.callOptions.audio.deafened,
            },
        })
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
            isDeafened: conn.metadata.isDeafened,
        }

        this.channel = conn.metadata.channel
        this.callStartTime = conn.metadata.callStartTime ? new Date(conn.metadata.callStartTime) : null
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
    }

    updateRemoteUserInfo(dataReceived: VoiceMessage) {
        this.channel = dataReceived.channel
        this.remoteVoiceUser = dataReceived.userInfo
        Store.setActiveCall(Store.getCallingChat(this.channel)!)
    }

    public async acceptIncomingCall() {
        this.callOptions.audio.enabled = true
        Store.updateMuted(false)
        this.acceptedIncomingCall = true
    }

    public async acceptCall() {
        let localStream = await this.updateLocalStream()

        await this.sendData(VoiceRTCMessageType.AcceptedCall)

        this.activeCall!.answer(localStream!)

        this.activeCall!.on("stream", async remoteStream => {
            /// Here will receive data from user that made the call
            if (this.remoteVideoElement) {
                this.remoteVideoElement.srcObject = remoteStream
                if (this.remoteVideoElement.readyState >= 2) {
                    await this.remoteVideoElement.play()
                }
            }
        })
    }

    async startToMakeACall(remotePeerId: string, chatID: string) {
        this.channel = chatID
        this.makingCall = true
        const remotePeerIdEdited = remotePeerId.replace("did:key:", "")
        this.remotePeerId = remotePeerIdEdited
    }

    private async sendMessageCallStarted(chatID: string) {
        const now = new Date()
        this.callStartTime = now
        const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
        const text = get(_)("settings.calling.startCallMessage", { values: { value: formattedTime } })
        this.channel = chatID
        await RaygunStoreInstance.send(chatID, text.split("\n"), [])
    }

    public async makeVideoCall() {
        try {
            await this.setupPeerEvents()

            await this.connectWithRetry()

            setTimeout(() => {
                if (this.callStartTime === null) {
                    this.endCall(true)
                }
            }, 10000)

            await this.sendData(VoiceRTCMessageType.Calling)

            if (this.dataConnection) {
                this.dataConnection.on("data", data => {
                    let dataReceived = data as VoiceMessage
                    this.handleWithDataReceived(dataReceived)
                })
            }

            let localStream = await this.updateLocalStream()

            this.activeCall = this.localPeer!.call(this.remotePeerId!, localStream!, {
                metadata: {
                    channel: this.channel,
                    userInfo: {
                        did: this.localPeer!.id,
                        username: get(Store.state.user).name,
                        videoEnabled: this.callOptions.video.enabled,
                        audioEnabled: this.callOptions.audio.enabled,
                    },
                },
            })

            this.activeCall!.on("stream", async remoteStream => {
                /// Here will receive data from user that accepted the call
                if (this.remoteVideoElement) {
                    this.remoteVideoElement.srcObject = remoteStream
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
                audioEnabled: this.callOptions.audio.enabled,
                isDeafened: this.callOptions.audio.deafened,
            },
        })

        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = this.activeCall?.localStream!
            await this.localVideoCurrentSrc.play()
        }
        /// Let it commented for now.
        // await this.improveAudioQuality()
    }

    async connectWithRetry() {
        const maxRetries = 5
        let attempts = 0
        let connected = false

        while (!connected && attempts < maxRetries) {
            try {
                this.dataConnection = this.localPeer!.connect(this.remotePeerId!, {
                    reliable: true,
                    metadata: {
                        did: this.localPeer!.id,
                        username: get(Store.state.user).name,
                        videoEnabled: this.callOptions.video.enabled,
                        audioEnabled: this.callOptions.audio.enabled,
                        isDeafened: this.callOptions.audio.deafened,
                        channel: this.channel,
                        callStartTime: this.callStartTime,
                    },
                })

                this.dataConnection.on("open", () => {
                    connected = true
                    log.debug("Connection established successfully.")
                })

                await new Promise(resolve => setTimeout(resolve, 2000))
                log.debug("Not possible to connect, trying again.")

                if (!connected && attempts === maxRetries) {
                    log.error("Connection attempt failed. Ending call.")
                    this.endCall(false)
                }
            } catch (error) {
                attempts += 1
                log.debug(`Attempt ${attempts} failed. Retrying...`)

                if (attempts >= maxRetries) {
                    log.error("Max retries reached. Connection failed.")
                    break
                }
            }
        }
    }

    async updateLocalStream(updatingCallSetting = false) {
        let localStream
        try {
            let videoInputDevice = get(Store.state.devices.video)
            let audioInputDevice = get(Store.state.devices.input)
            let settingsStore = get(SettingsStore.state)

            localStream = await navigator.mediaDevices.getUserMedia({
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
                audio: this.callOptions.audio.enabled
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
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            })
        }
        await this.sendData(VoiceRTCMessageType.Calling)

        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = localStream!
            await this.localVideoCurrentSrc.play()
        }

        if (this.activeCall !== null && updatingCallSetting) {
            this.activeCall?.peerConnection.getSenders().forEach(sender => {
                if (sender.track?.kind === "video") {
                    sender.replaceTrack(localStream.getVideoTracks()[0])
                } else if (sender.track?.kind === "audio") {
                    sender.replaceTrack(localStream.getAudioTracks()[0])
                }
            })
        }

        return localStream
        /// Let it commented for now.
        // await this.improveAudioQuality()
    }

    private async improveAudioQuality() {
        const audioContext = new window.AudioContext()
        const source = audioContext.createMediaStreamSource(this.activeCall?.localStream!)
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
        processedStream.addTrack(this.activeCall?.localStream!.getVideoTracks()[0]!)
        this.activeCall?.localStream!.getVideoTracks().forEach(track => processedStream.addTrack(track))
    }

    handleWithDataReceived(dataReceived: VoiceMessage) {
        log.debug(`Data received: ${dataReceived.type}`)
        switch (dataReceived.type) {
            case VoiceRTCMessageType.EndingCall:
                this.endCall(false)
                break
            case VoiceRTCMessageType.Calling:
                if (!this.makingCall) {
                    this.isReceivingCall = true
                }
                this.remoteVoiceUser = dataReceived.userInfo
                this.channel = dataReceived.channel
                break
            case VoiceRTCMessageType.AcceptedCall:
                this.sendMessageCallStarted(this.channel)
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
                audioEnabled: this.callOptions.audio.enabled,
                isDeafened: this.callOptions.audio.deafened,
            },
        })
    }

    private getDuration(endTime: Date): string {
        if (!this.callStartTime) return "0:00"

        const durationMs = endTime.getTime() - this.callStartTime.getTime()
        const totalSeconds = Math.floor(durationMs / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60

        if (minutes === 0) {
            const fractionalSeconds = (durationMs / 1000).toFixed(2)
            return `${fractionalSeconds} seconds`
        } else {
            const minutesFormatted = minutes.toString().padStart(2, "0")
            return `${minutesFormatted}min`
        }
    }

    async endCall(sendEndCallMessage = true) {
        await this.sendData(VoiceRTCMessageType.EndingCall)

        if (sendEndCallMessage && this.callStartTime) {
            const now = new Date()
            const duration = this.getDuration(now)
            const formattedEndTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
            const endText = get(_)("settings.calling.endCallMessage", { values: { formattedEndTime: formattedEndTime, duration: duration } })
            await RaygunStoreInstance.send(this.channel, endText.split("\n"), [])
        } else if (sendEndCallMessage && this.callStartTime === null) {
            const text = get(_)("settings.calling.callMissed")
            await RaygunStoreInstance.send(this.channel, text.split("\n"), [])
        }

        this.clearResources()

        if (get(Store.state.activeCall)) {
            Store.endCall()
        }

        if (get(Store.state.pendingCall)) {
            Store.denyCall()
        }

        log.info("Call ended and resources cleaned up.")
        this.setupPeerEvents()
    }

    private clearResources() {
        this.channel = ""
        this.activeCall?.localStream?.getTracks().forEach(track => track.stop())
        this.makingCall = false
        this.acceptedIncomingCall = false
        this.isReceivingCall = false
        this.callStartTime = null

        this.activeCall?.remoteStream?.getTracks().forEach(track => track.stop())

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
            isDeafened: false,
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
    }

    handleError(error: Error) {
        log.error(`Error: ${error}`)
    }
}

export const VoiceRTCInstance = new VoiceRTC("default", {
    audio: {
        enabled: get(Store.state.devices.muted),
        deafened: false,
    },
    video: {
        enabled: get(Store.state.devices.cameraEnabled),
        selfie: true,
    },
})
