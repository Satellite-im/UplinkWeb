import { CallDirection } from "$lib/enums"
import { SettingsStore } from "$lib/state"
import { Store } from "$lib/state/Store"
import { log } from "$lib/utils/Logger"
import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
import Peer, { DataConnection, MediaConnection } from "peerjs"
import { get } from "svelte/store"
import { _ } from "svelte-i18n"
import { string } from "three/examples/jsm/nodes/Nodes.js"

export enum VoiceRTCMessageType {
    Calling = "CALLING_USER",
    EndingCall = "ENDING_CALL",
    IncomingCall = "INCOMING_CALL",
    AcceptedCall = "ACCEPTED_CALL",
    EnabledVideo = "ENABLED_VIDEO",
    DisabledVideo = "DISABLED_VIDEO",
    EnabledAudio = "ENABLED_AUDIO",
    DisabledAudio = "DISABLED_AUDIO",
    Connect = "CONNECT_WITH",
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
    call: {
        onlyAudioCall: boolean
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
    other?: any
}

enum ToggleType {
    Video,
    Mute,
    Deafen,
}

const AUDIO_WINDOW_SIZE = 256
const VOLUME_THRESHOLD = 10

export class RemotePeers {
    remotePeers: RemotePeer[] = []
    connectedPeers: string[] = []
    inCall: boolean = false

    init(recipients: string[]) {
        this.inCall = false
        this.remotePeers = recipients.map(did => {
            return new RemotePeer(did)
        })
    }

    join(call: MediaConnection) {
        call.on("stream", async stream => {})
    }

    leave() {}

    clear() {
        this.remotePeers.forEach(p => p.close())
        this.remotePeers = []
        this.inCall = false
    }

    getPeer(predicate: (p: RemotePeer) => boolean) {
        return this.remotePeers.find(predicate)
    }

    mutatePeer(predicate: (p: RemotePeer) => boolean, action: (p: RemotePeer) => any) {
        let peer = this.getPeer(predicate)
        if (peer) action(peer)
    }

    get(): VoiceRTCUser {
        return {
            did: "",
            username: "unknown",
            videoEnabled: false,
            audioEnabled: false,
            isDeafened: false,
        }
    }
}

export class RemotePeer {
    did: string
    remotePeerId: string | null = null
    remoteVoiceUser: VoiceRTCUser = {
        did: "",
        username: "unknown",
        videoEnabled: false,
        audioEnabled: false,
        isDeafened: false,
    }
    activeCall: MediaConnection | null = null
    dataConnection: DataConnection | null = null

    streamHandler?: [ReturnType<typeof setInterval>, AnalyserNode]

    constructor(id: string) {
        this.did = id
        this.remotePeerId = id.replace("did:key:", "")
    }

    toggleStreams(state: boolean, did: string, options: VoiceRTCOptions, channel: string, type: ToggleType) {
        switch (type) {
            case ToggleType.Video: {
                if (state) {
                    this.activeCall?.localStream?.getVideoTracks().forEach(track => (track.enabled = true))
                } else {
                    this.activeCall?.localStream?.getVideoTracks().forEach(track => (track.enabled = false))
                }
                break
            }
            case ToggleType.Mute: {
                if (state) {
                    this.activeCall?.localStream.getAudioTracks().forEach(track => (track.enabled = false))
                } else {
                    this.activeCall?.localStream.getAudioTracks().forEach(track => (track.enabled = true))
                }
                break
            }
            case ToggleType.Deafen: {
                if (state) {
                    this.activeCall?.remoteStream.getAudioTracks().forEach(track => (track.enabled = false))
                    this.activeCall?.localStream.getAudioTracks().forEach(track => (track.enabled = false))
                } else {
                    this.activeCall?.remoteStream.getAudioTracks().forEach(track => (track.enabled = true))
                    this.activeCall?.localStream.getAudioTracks().forEach(track => (track.enabled = true))
                }
                break
            }
        }

        this.dataConnection?.send({
            type: options.video.enabled ? VoiceRTCMessageType.EnabledVideo : VoiceRTCMessageType.DisabledVideo,
            channel: channel,
            userInfo: {
                did: did,
                videoEnabled: options.video.enabled,
                audioEnabled: options.audio,
            },
        })
    }

    private async handleStreamMeta(stream: MediaStream) {
        if (this.streamHandler) {
            this.streamHandler[1].disconnect()
            clearInterval(this.streamHandler[0] as any) // IDE is complaining for some reason
        }
        const audioContext = new window.AudioContext()
        const mediaStreamSource = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = AUDIO_WINDOW_SIZE
        mediaStreamSource.connect(analyser)
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        function volume() {
            analyser.getByteFrequencyData(dataArray)
            return dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        }

        function updateMeta(did: string) {
            let muted = stream.getTracks().find(track => !track.enabled || track.readyState === "ended") !== undefined
            let speaking = false
            let user = Store.getUser(did)
            let current = get(user)
            if (!muted && volume() < VOLUME_THRESHOLD) {
                speaking = true
            }
            if (current.media.is_muted !== muted || current.media.is_playing_audio !== speaking) {
                user.update(u => {
                    return {
                        ...u,
                        media: {
                            ...u.media,
                            is_muted: muted,
                            is_playing_audio: speaking,
                        },
                    }
                })
            }
        }
        const checker = setInterval(() => updateMeta(this.did), 3000)
        this.streamHandler = [checker, analyser]
    }

    async handleRemoteStream(stream: MediaStream, remoteVideoElement: HTMLVideoElement | null) {
        this.handleStreamMeta(stream)
        /// Here will receive data from user that made the call
        // TODO: decide which video to play?
        if (remoteVideoElement) {
            if (remoteVideoElement.srcObject) {
                stream.getTracks().forEach(track => (remoteVideoElement.srcObject as MediaStream).addTrack(track))
            } else {
                const mergedStream = new MediaStream()
                stream.getTracks().forEach(track => mergedStream.addTrack(track))
                remoteVideoElement.srcObject = mergedStream
                if (remoteVideoElement.readyState >= 2) {
                    await remoteVideoElement.play()
                }
            }
        }
    }

    close() {
        this.activeCall?.localStream?.getTracks().forEach(track => track.stop())
        this.activeCall?.remoteStream?.getTracks().forEach(track => track.stop())

        if (this.streamHandler) {
            this.streamHandler[1].disconnect()
            clearInterval(this.streamHandler[0] as any) // IDE is complaining for some reason
        }
        if (this.activeCall) this.activeCall.close()
        if (this.dataConnection) this.dataConnection.close()
    }
}

// User call -> send call to all peers
// Peer accept -> update on user
// Peer accept -> fetch peers from other end -> join mesh -> get other peers and connect
//

export class VoiceRTC {
    channel: string
    localPeer: Peer | null = null
    remoteVideoElement: HTMLVideoElement | null = null
    localVideoCurrentSrc: HTMLVideoElement | null = null

    // The other peers in the call
    remotePeersHolder: RemotePeers = new RemotePeers()

    callOptions: VoiceRTCOptions
    private callStartTime: Date | null = null
    isReceivingCall = false
    makingCall = false
    acceptedIncomingCall = false

    constructor(channel: string, options: VoiceRTCOptions) {
        this.channel = channel
        this.callOptions = { ...options }
        this.setupLocalPeer()

        this.subscribe()
    }

    subscribe() {
        Store.state.devices.muted.subscribe(async value => this.toggleMute(value))
        Store.state.devices.cameraEnabled.subscribe(async value => this.toggleVideo(value))
        Store.state.devices.deafened.subscribe(async value => this.toggleDeafen(value))
    }

    toggleVideo(state: boolean) {
        this.callOptions.video.enabled = state

        this.remotePeersHolder.remotePeers.forEach(p => p.toggleStreams(state, this.localPeer!.id, this.callOptions, this.channel, ToggleType.Video))
    }

    toggleMute(state: boolean) {
        this.callOptions.audio.enabled = state

        this.remotePeersHolder.remotePeers.forEach(p => p.toggleStreams(state, this.localPeer!.id, this.callOptions, this.channel, ToggleType.Mute))
    }

    toggleDeafen(state: boolean) {
        // TODO: This isn't perfect because if you mute yourself, and then deafen yourself, un-deafaning will also unmute you which could be unexpected
        this.callOptions.audio.enabled = state

        this.remotePeersHolder.remotePeers.forEach(p => p.toggleStreams(state, this.localPeer!.id, this.callOptions, this.channel, ToggleType.Deafen))
    }

    async setVideoElements(remoteVideoElement: HTMLVideoElement, localVideoCurrentSrc: HTMLVideoElement) {
        this.remoteVideoElement = remoteVideoElement
        this.localVideoCurrentSrc = localVideoCurrentSrc
        new Promise(resolve => setTimeout(resolve, 500))
    }

    private async setupLocalPeer(reset?: boolean) {
        if (reset && this.localPeer) {
            this.localPeer.destroy()
            this.localPeer = null
        }
        if (this.localPeer === null) {
            let userId = get(Store.state.user).key
            while (userId === "0x0") {
                userId = get(Store.state.user).key
                await new Promise(resolve => setTimeout(resolve, 500))
            }
            const peerId = userId.replace("did:key:", "")
            this.localPeer = new Peer(peerId)

            this.localPeer!.on("open", id => {
                log.debug(`My peer ID is: ${id}`)
            })

            this.localPeer!.on("connection", this.handlePeerConnection.bind(this))
            this.localPeer!.on("call", async call => {
                if (!this.remotePeersHolder.inCall) {
                    this.channel = call.metadata.channel
                }
                this.remotePeersHolder.mutatePeer(
                    p => p.remotePeerId === call.peer,
                    peer => (peer.activeCall = call)
                )
            })
            this.localPeer!.on("error", this.handleError.bind(this))
        }
    }

    private handlePeerConnection(conn: DataConnection) {
        let inCall = this.remotePeersHolder.inCall
        this.remotePeersHolder.mutatePeer(
            p => p.remotePeerId === conn.peer,
            peer => {
                peer.remoteVoiceUser = {
                    did: conn.metadata.did,
                    username: conn.metadata.username,
                    videoEnabled: conn.metadata.videoEnabled,
                    audioEnabled: conn.metadata.audioEnabled,
                    isDeafened: conn.metadata.isDeafened,
                }
                peer.dataConnection = conn
            }
        )

        if (!inCall) {
            this.callOptions.call.onlyAudioCall = conn.metadata.onlyAudioCall
            this.callOptions.video.enabled = !conn.metadata.onlyAudioCall && this.callOptions.video.enabled

            this.channel = conn.metadata.channel
            this.callStartTime = conn.metadata.callStartTim ? new Date(conn.metadata.callStartTime) : null
        }

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
            this.handleWithDataReceived(data as VoiceMessage)
        })
    }

    updateRemoteUserInfo(dataReceived: VoiceMessage) {
        this.channel = dataReceived.channel
        this.remotePeersHolder.mutatePeer(
            p => p.remotePeerId === dataReceived.userInfo.did,
            peer => (peer.remoteVoiceUser = dataReceived.userInfo)
        )
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

        this.remotePeersHolder.remotePeers.forEach(peer => {
            peer.activeCall!.answer(localStream!)

            peer.activeCall!.on("stream", async remoteStream => {
                await peer.handleRemoteStream(remoteStream, this.remoteVideoElement)
            })
        })
    }

    async startToMakeACall(recipients: string[], chatID: string, onlyAudioCall: boolean = false) {
        this.callOptions.video.enabled = !onlyAudioCall
        this.callOptions.call.onlyAudioCall = onlyAudioCall
        this.callOptions.audio.enabled = true

        this.channel = chatID
        this.makingCall = true
        this.remotePeersHolder.init(recipients)
    }

    private async sendMessageCallStarted(chatID: string) {
        const now = new Date()
        this.callStartTime = now
        const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
        const text = get(_)("settings.calling.startCallMessage", { values: { value: formattedTime } })
        this.channel = chatID
        await RaygunStoreInstance.send(chatID, text.split("\n"), [])
    }

    public async makeCall() {
        let localStream: MediaStream
        try {
            await this.setupLocalPeer()
            await this.connectWithRetry()

            setTimeout(() => {
                if (this.callStartTime === null) {
                    this.endCall(true)
                }
            }, 10000)

            await this.sendData(VoiceRTCMessageType.Calling)

            localStream = await this.updateLocalStream()

            this.remotePeersHolder.remotePeers.forEach(peer => {
                peer.activeCall = this.localPeer!.call(peer.remotePeerId!, localStream!, {
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

                peer.activeCall!.on("stream", async remoteStream => {
                    await peer.handleRemoteStream(remoteStream, this.remoteVideoElement)
                })
            })
            Store.setActiveCall(Store.getCallingChat(this.channel)!)
        } catch (error) {
            log.error(`Error making call: ${error}`)
        }

        this.remotePeersHolder.remotePeers.forEach(peer => {
            peer.dataConnection?.send({
                type: VoiceRTCMessageType.Calling,
                channel: this.channel,
                userInfo: {
                    did: this.localPeer!.id,
                    videoEnabled: this.callOptions.video.enabled,
                    audioEnabled: this.callOptions.audio.enabled,
                    isDeafened: this.callOptions.audio.deafened,
                },
            })
        })

        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = localStream!
            await this.localVideoCurrentSrc.play()
        }
        /// Let it commented for now.
        // await this.improveAudioQuality()
    }

    async connectWithRetry() {
        const maxRetries = 5
        let attempts = 0
        let connected: string[] = []

        while (connected.length < this.remotePeersHolder.remotePeers.length && attempts < maxRetries) {
            try {
                this.remotePeersHolder.remotePeers.forEach(peer => {
                    if (!(peer.remotePeerId! in connected)) {
                        peer.dataConnection = this.localPeer!.connect(peer.remotePeerId!, {
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
                        peer.dataConnection.on("open", () => {
                            connected.push(peer.remotePeerId!)
                            log.debug("Connection established successfully.")
                        })
                    }
                })

                await new Promise(resolve => setTimeout(resolve, 2000))
                log.debug("Not possible to connect, trying again.")

                if (connected.length === 0 && attempts === maxRetries) {
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

        if (updatingCallSetting) {
            this.remotePeersHolder.remotePeers.forEach(peer => {
                if (peer.activeCall !== null) {
                    peer.activeCall?.peerConnection.getSenders().forEach(sender => {
                        if (sender.track?.kind === "video") {
                            sender.replaceTrack(localStream.getVideoTracks()[0])
                        } else if (sender.track?.kind === "audio") {
                            sender.replaceTrack(localStream.getAudioTracks()[0])
                        }
                    })
                }
            })
        }

        return localStream
        /// Let it commented for now.
        // await this.improveAudioQuality()
    }

    // private async improveAudioQuality() {
    //     const audioContext = new window.AudioContext()
    //     const source = audioContext.createMediaStreamSource(this.activeCall?.localStream!)
    //     const destination = audioContext.createMediaStreamDestination()

    //     const gainNode = audioContext.createGain()
    //     const echoCancellation = audioContext.createBiquadFilter()
    //     const noiseSuppression = audioContext.createBiquadFilter()

    //     echoCancellation.type = "lowshelf"
    //     echoCancellation.frequency.setValueAtTime(1000, audioContext.currentTime)
    //     echoCancellation.gain.setValueAtTime(-40, audioContext.currentTime)

    //     noiseSuppression.type = "highpass"
    //     noiseSuppression.frequency.setValueAtTime(2000, audioContext.currentTime)
    //     noiseSuppression.gain.setValueAtTime(-30, audioContext.currentTime)

    //     source.connect(echoCancellation)
    //     echoCancellation.connect(noiseSuppression)
    //     noiseSuppression.connect(gainNode)
    //     gainNode.connect(destination)

    //     const processedStream = new MediaStream()
    //     processedStream.addTrack(destination.stream.getAudioTracks()[0])
    //     processedStream.addTrack(this.activeCall?.localStream!.getVideoTracks()[0]!)
    //     this.activeCall?.localStream!.getVideoTracks().forEach(track => processedStream.addTrack(track))
    // }

    get isInCall(): boolean {
        return this.remotePeersHolder.remotePeers.find(p => p.activeCall !== null) !== undefined
    }

    handleWithDataReceived(dataReceived: VoiceMessage) {
        log.debug(`Data received from ${dataReceived.userInfo.username}: ${dataReceived.type}`)
        switch (dataReceived.type) {
            case VoiceRTCMessageType.EndingCall:
                this.endCall(false)
                break
            case VoiceRTCMessageType.Calling:
                if (!this.makingCall) {
                    this.isReceivingCall = true
                }
                this.remotePeersHolder.mutatePeer(
                    p => p.remoteVoiceUser.did === dataReceived.userInfo.did,
                    peer => (peer.remoteVoiceUser = dataReceived.userInfo)
                )
                this.channel = dataReceived.channel
                break
            case VoiceRTCMessageType.AcceptedCall:
                this.sendMessageCallStarted(this.channel)
                this.updateRemoteUserInfo(dataReceived)
                this.sendData(
                    VoiceRTCMessageType.Connect,
                    this.remotePeersHolder.remotePeers.map(p => p.remotePeerId)
                )
                break
            case VoiceRTCMessageType.IncomingCall:
            case VoiceRTCMessageType.EnabledVideo:
            case VoiceRTCMessageType.DisabledVideo:
            case VoiceRTCMessageType.EnabledAudio:
            case VoiceRTCMessageType.DisabledAudio:
                this.updateRemoteUserInfo(dataReceived)
                break
            case VoiceRTCMessageType.Connect:
                let peers: string[] = dataReceived.other
                peers.forEach(peer => this.localPeer?.call(peer, this.localVideoCurrentSrc!.srcObject as any))
                break
            case VoiceRTCMessageType.None:
                break
            default:
                log.debug(`Unknown message type: ${dataReceived.type}`)
        }
    }

    async sendData(type: VoiceRTCMessageType, other?: any) {
        await Promise.all(
            this.remotePeersHolder.remotePeers.map(p =>
                p.dataConnection?.send({
                    type: type,
                    channel: this.channel,
                    userInfo: {
                        did: this.localPeer!.id,
                        username: get(Store.state.user).name,
                        videoEnabled: this.callOptions.video.enabled,
                        audioEnabled: this.callOptions.audio.enabled,
                        isDeafened: this.callOptions.audio.deafened,
                    },
                    other,
                })
            )
        )
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
        this.setupLocalPeer()
    }

    private clearResources() {
        this.channel = ""
        this.makingCall = false
        this.acceptedIncomingCall = false
        this.isReceivingCall = false
        this.callStartTime = null
        this.remotePeersHolder.clear()

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
    call: {
        onlyAudioCall: false,
    },
})
