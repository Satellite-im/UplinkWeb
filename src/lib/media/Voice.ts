import { CallDirection } from "$lib/enums"
import { SettingsStore } from "$lib/state"
import { Store } from "$lib/state/Store"
import { log } from "$lib/utils/Logger"
import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
import { Peer, type DataConnection, type MediaConnection } from "peerjs"
import { _ } from "svelte-i18n"
import { get } from "svelte/store"

export enum VoiceRTCMessageType {
    Calling = "CALLING_USER",
    LeavingCall = "LEAVING_CALL",
    JoinedCall = "JOINED_CALL",
    SyncPeers = "SYNC_PEERS",
    EnabledVideo = "ENABLED_VIDEO",
    DisabledVideo = "DISABLED_VIDEO",
    EnabledAudio = "ENABLED_AUDIO",
    DisabledAudio = "DISABLED_AUDIO",
    None = "NONE",
}

export type RemoteStream = {
    user: VoiceRTCUser
    stream: MediaStream | null
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

export type VoiceRTCUser = {
    did: string
    username: string
    videoEnabled: boolean
    audioEnabled: boolean
    isDeafened: boolean
    joined: boolean
}

type VoiceMessage = {
    type: VoiceRTCMessageType
    channel: string | undefined
    userInfo: VoiceRTCUser
    peers: string[]
}

enum ToggleType {
    Video,
    Mute,
    Deafen,
}

type CallMeta = {
    channel: string
    userInfo: VoiceRTCUser
}

export type CallUpdater = {
    create: (stream: RemoteStream) => void
    update: (did: string, data: { user?: VoiceRTCUser; stream?: MediaStream }) => void
    delete: (user: string) => void
}

const AUDIO_WINDOW_SIZE = 256
const VOLUME_THRESHOLD = 10

export class PeerMesh {
    remotePeers: RemotePeer[] = []
    /**
     * List of peer ids which are already connected
     */
    connectedPeers: Set<string> = new Set()
    callStartTime: Date | null = null
    inCall: boolean = false

    init(recipients: string[]) {
        this.remotePeers = recipients.map(did => {
            return new RemotePeer(did)
        })
    }

    readyForCalling() {
        return this.remotePeers.find(p => p.did !== "") !== undefined
    }

    empty() {
        return this.connectedPeers.size === 0
    }

    /**
     * Joins this mesh. Will connect and call all peers that are not connected still
     */
    async join(options: { users?: string[] | VoiceRTCUser; connect?: boolean } = { connect: true }) {
        if (options.users) {
            let users = options.users
            let self = get(Store.state.user).key
            if (Array.isArray(users)) {
                users.forEach(did => {
                    if (self !== did && !this.remotePeers.find(p => p.did in users)) {
                        let peer = new RemotePeer(did)
                        this.remotePeers.push(peer)
                    }
                })
            } else if (self !== users.did && !this.remotePeers.find(p => p.did === users.did)) {
                let peer = new RemotePeer(users.did)
                peer.updateUserData(users)
                this.remotePeers.push(peer)
            }
        }
        if (options.connect) await this.connectWithRetry(VoiceRTCInstance.localPeer!, VoiceRTCInstance.channel!, VoiceRTCInstance.callOptions)
    }

    /**
     * Adds the user to this mesh
     * Will not attempt to connect to the user
     * Used when responding to an incoming call
     */
    async connect(user: VoiceRTCUser) {
        let peer = new RemotePeer(user.did)
        peer.updateUserData(user)
        if (!this.remotePeers.find(p => p.did === user.did)) {
            this.remotePeers.push(peer)
            this.connectedPeers.add(peer.remotePeerId)
        }
    }

    /**
     * Leave this mesh. Will disconnect from all peers
     */
    async leave(peerId?: string) {
        if (peerId) {
            this.connectedPeers.delete(peerId)
            this.remotePeers = this.remotePeers.filter(p => {
                if (p.remotePeerId !== peerId) {
                    return true
                }
                p.close()
                return false
            })
        } else {
            this.clear()
        }
    }

    async clear() {
        this.remotePeers.forEach(p => p.close())
        this.remotePeers = []
        this.connectedPeers = new Set()
        this.callStartTime = null
        this.inCall = false
    }

    private async connectWithRetry(localPeer: Peer, channel: string, callOptions: VoiceRTCOptions) {
        let connections = this.remotePeers.map(peer => this.connectWithRetryFor(localPeer, channel, callOptions, peer))
        let connected = await new Promise<boolean>((resolve, _) => {
            connections.map(p => {
                p.then(result => {
                    if (result === true) {
                        resolve(true)
                        return
                    }
                })
            })
            Promise.all(connections).then(() => {
                resolve(false)
            })
        })
        if (!connected) {
            log.error("Could not connect to anyone")
        }
    }

    private async connectWithRetryFor(localPeer: Peer, channel: string, callOptions: VoiceRTCOptions, peer: RemotePeer) {
        if (this.connectedPeers.has(peer.remotePeerId)) return true
        const maxRetries = 5 // TODO: Failing to connect after 2 attempts (or just throwing errors twice for the local peer?) breaks ALL connections...
        let attempts = 0
        let connected = false

        while (!connected && attempts < maxRetries) {
            try {
                peer.dataConnection = localPeer.connect(peer.remotePeerId!, {
                    reliable: true,
                    metadata: {
                        id: localPeer!.id,
                        username: get(Store.state.user).name,
                        videoEnabled: callOptions.video.enabled,
                        audioEnabled: callOptions.audio.enabled,
                        isDeafened: callOptions.audio.deafened,
                        channel: channel,
                        callStartTime: this.callStartTime,
                    },
                })

                peer.dataConnection.on("open", () => {
                    connected = true
                    this.connectedPeers.add(peer.remotePeerId!)
                    log.debug(`Connection established successfully.`)
                })
                peer.dataConnection.on("data", data => {
                    VoiceRTCInstance.handleWithDataReceived(data as VoiceMessage)
                })
                peer.dataConnection.on("close", () => {
                    this.leave(peer.remotePeerId)
                    if (this.empty()) {
                        VoiceRTCInstance.leaveCall(true)
                    }
                })
                await new Promise(resolve => setTimeout(resolve, 2000))
                if (!connected) {
                    if (attempts === maxRetries) {
                        log.error(`Connection to ${peer.remotePeerId} failed.`)
                        return false
                    }
                    log.debug(`Not possible to connect to ${peer.remotePeerId}, trying again. ${attempts}`)
                    attempts += 1
                    await new Promise(resolve => setTimeout(resolve, 5000))
                    continue
                }
                // Call after successfully connect. But dont wait for it
                new Promise(async () => {
                    let meta: CallMeta = {
                        channel: channel,
                        userInfo: {
                            did: get(Store.state.user).key,
                            username: get(Store.state.user).name,
                            joined: true,
                            videoEnabled: callOptions.video.enabled,
                            audioEnabled: callOptions.audio.enabled,
                            isDeafened: callOptions.audio.deafened,
                        },
                    }
                    peer.activeCall = VoiceRTCInstance.localPeer!.call(peer.remotePeerId!, await VoiceRTCInstance.getLocalStream(), {
                        metadata: meta,
                    })
                    peer.activeCall!.on("stream", async remoteStream => {
                        this.inCall = true
                        if (!this.callStartTime) this.callStartTime = new Date()
                        if (VoiceRTCInstance.remoteVideoCreator) {
                            VoiceRTCInstance.remoteVideoCreator.create({ user: peer.getUser(), stream: remoteStream })
                        }
                        await peer.handleRemoteStream(remoteStream)
                    })
                })
                return true
            } catch (error) {
                attempts += 1
                log.debug(`Attempt ${attempts} failed. Retrying...`)

                if (attempts >= maxRetries) {
                    log.error("Max retries reached. Connection failed.")
                    break
                }
            }
        }
        return false
    }

    async notify(type: VoiceRTCMessageType, to?: string) {
        let user = get(Store.state.user)
        let data: VoiceMessage = {
            type: type,
            channel: VoiceRTCInstance.channel,
            userInfo: {
                did: user.key,
                username: user.name,
                joined: VoiceRTCInstance.acceptedIncomingCall,
                videoEnabled: VoiceRTCInstance.callOptions.video.enabled,
                audioEnabled: VoiceRTCInstance.callOptions.audio.enabled,
                isDeafened: VoiceRTCInstance.callOptions.audio.deafened,
            },
            peers: this.remotePeers.filter(p => this.connectedPeers.has(p.remotePeerId)).map(p => p.did),
        }
        if (to) {
            let peer = this.remotePeers.find(p => p.remotePeerId === to)
            await peer?.dataConnection?.send(data)
        } else {
            await Promise.all(this.remotePeers.map(p => p.dataConnection?.send(data)))
        }
    }

    getPeer(predicate: (p: RemotePeer) => boolean) {
        return this.remotePeers.find(predicate)
    }

    mutatePeer(predicate: (p: RemotePeer) => boolean, action: (p: RemotePeer) => any) {
        let peer = this.getPeer(predicate)
        if (peer) action(peer)
    }
}

export class RemotePeer {
    did: string
    remotePeerId: string
    private remoteVoiceUser: VoiceRTCUser = {
        did: "",
        username: "unknown",
        videoEnabled: false,
        audioEnabled: false,
        isDeafened: false,
        joined: false,
    }
    activeCall: MediaConnection | null = null
    dataConnection: DataConnection | null = null

    stream: MediaStream | null = null
    streamHandler?: [ReturnType<typeof setInterval>, AnalyserNode]
    remove?: (user: string) => void

    constructor(id: string) {
        this.did = id
        this.remotePeerId = id.replace("did:key:", "")
        this.remoteVoiceUser = {
            ...this.remoteVoiceUser,
            did: this.did,
            audioEnabled: true,
        }
    }

    toggleStreams(state: boolean, type: ToggleType) {
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
    }

    updateUserData(userData: VoiceRTCUser) {
        this.remoteVoiceUser = userData
        VoiceRTCInstance.remoteVideoCreator?.update(this.did, { user: userData })
    }

    getUser(): VoiceRTCUser {
        return this.remoteVoiceUser
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

    async handleRemoteStream(stream: MediaStream) {
        this.handleStreamMeta(stream)
        this.stream = stream
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
        VoiceRTCInstance.remoteVideoCreator.delete(this.did)
    }
}

export class VoiceRTC {
    channel?: string
    localPeer: Peer | null = null
    localStream: MediaStream | null = null
    localVideoCurrentSrc: HTMLVideoElement | null = null
    remoteVideoCreator: CallUpdater

    // The other peers in the call
    peerMesh: PeerMesh = new PeerMesh()

    callOptions: VoiceRTCOptions
    incomingCall: MediaConnection | null = null
    // A tracker for incoming connections before a call has been established
    incomingConnections: DataConnection[] = []
    makingCall = false
    acceptedIncomingCall = false

    constructor(options: VoiceRTCOptions) {
        this.callOptions = { ...options }
        this.setupLocalPeer()
        this.remoteVideoCreator = {
            create: stream => {
                Store.state.activeCallMeta.update(s => {
                    s[stream.user.did] = stream
                    return s
                })
            },
            delete: user => {
                Store.state.activeCallMeta.update(s => {
                    if (s[user]) s[user].stream = null
                    return s
                })
            },
            update: (did: string, data: { user?: VoiceRTCUser; stream?: MediaStream }) => {
                Store.state.activeCallMeta.update(s => {
                    if (s[did]) {
                        if (data.user) s[did].user = data.user
                        if (data.stream) s[did].stream = data.stream
                    }
                    return s
                })
            },
        }
        this.subscribe()
    }

    subscribe() {
        Store.state.devices.muted.subscribe(async value => this.toggleMute(value))
        Store.state.devices.cameraEnabled.subscribe(async value => this.toggleVideo(value))
        Store.state.devices.deafened.subscribe(async value => this.toggleDeafen(value))
    }

    async toggleVideo(state: boolean) {
        this.callOptions.video.enabled = state
        if (this.localStream) await this.getLocalStream(true)

        this.peerMesh.remotePeers.forEach(p => p.toggleStreams(state, ToggleType.Video))
        this.peerMesh.notify(this.callOptions.video.enabled ? VoiceRTCMessageType.EnabledVideo : VoiceRTCMessageType.DisabledVideo)
    }

    async toggleMute(state: boolean) {
        this.callOptions.audio.enabled = state
        if (this.localStream) await this.getLocalStream(true)

        this.peerMesh.remotePeers.forEach(p => p.toggleStreams(state, ToggleType.Mute))
        this.peerMesh.notify(this.callOptions.video.enabled ? VoiceRTCMessageType.EnabledVideo : VoiceRTCMessageType.DisabledVideo)
    }

    async toggleDeafen(state: boolean) {
        // TODO: This isn't perfect because if you mute yourself, and then deafen yourself, un-deafaning will also unmute you which could be unexpected
        this.callOptions.audio.enabled = state

        this.peerMesh.remotePeers.forEach(p => p.toggleStreams(state, ToggleType.Deafen))
        this.peerMesh.notify(this.callOptions.video.enabled ? VoiceRTCMessageType.EnabledVideo : VoiceRTCMessageType.DisabledVideo)
    }

    async setVideoElements(localVideoCurrentSrc: HTMLVideoElement) {
        this.localVideoCurrentSrc = localVideoCurrentSrc
        new Promise(resolve => setTimeout(resolve, 500))
    }

    private async setupLocalPeer(reset?: boolean) {
        if ((reset && this.localPeer) || this.localPeer?.disconnected || this.localPeer?.destroyed) {
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

            // Handle incoming connections
            this.localPeer!.on("connection", conn => {
                conn.on("open", () => {
                    /// It will appear to user that is receiving the call
                    log.info(`Receiving connection on channel: ${conn.metadata.channel} from ${conn.metadata.id}, username: ${conn.metadata.username}`)
                    let peer = this.peerMesh.getPeer(p => p.remotePeerId === conn.metadata.id)
                    if (peer) peer.dataConnection = conn
                    else if (!this.incomingCall) {
                        this.incomingConnections.push(conn)
                    }
                })
                conn.on("data", data => {
                    this.handleWithDataReceived(data as VoiceMessage)
                })
            })
            // Handle incoming calls
            this.localPeer!.on("call", async call => {
                let meta: CallMeta = call.metadata
                call.on("close", () => {
                    this.peerMesh.connectedPeers.delete(call.peer)
                    this.peerMesh.remotePeers = this.peerMesh.remotePeers.filter(p => {
                        if (p.remotePeerId !== call.peer) {
                            return true
                        }
                        p.close()
                        return false
                    })
                    if (this.peerMesh.empty()) {
                        this.leaveCall(false)
                    }
                })
                // If channel is not defined or channels dont match its a new call. Otherwise they come from peers in the same call
                if (!this.channel || meta.channel !== this.channel) {
                    this.incomingCall = call
                    this.channel = meta.channel
                    Store.setPendingCall(Store.getCallingChat(this.channel!)!, CallDirection.Inbound)
                } else if (this.channel) {
                    this.acceptCallInternal(call)
                }
            })
            this.localPeer!.on("error", this.handleError.bind(this))
        }
    }

    /**
     * Setup a call to make
     * @param recipients users to call
     * @param chatID the chat to make the call in
     * @param onlyAudioCall
     */
    startToMakeACall(recipients: string[], chatID: string, onlyAudioCall: boolean = false) {
        let own = get(Store.state.user).key
        recipients = recipients.filter(r => r !== own)
        this.callOptions.video.enabled = !onlyAudioCall
        Store.state.devices.cameraEnabled.set(!onlyAudioCall)
        this.callOptions.call.onlyAudioCall = onlyAudioCall
        this.callOptions.audio.enabled = true

        this.channel = chatID
        this.makingCall = true
        this.peerMesh.init(recipients)
    }

    /**
     * Actually making the call
     */
    async makeCall() {
        if (!this.makingCall) {
            log.error("Calling not setup")
            return
        }
        try {
            await this.setupLocalPeer()
            // Joins and calls all peers. The mesh contains the to calling peers from #startToMakeACall
            this.peerMesh.join()
            setTimeout(() => {
                if (this.peerMesh.callStartTime === null) {
                    this.leaveCall(true)
                }
            }, 100000)
            Store.setActiveCall(Store.getCallingChat(this.channel!)!, CallDirection.Outbound)
        } catch (error) {
            log.error(`Error making call: ${error}`)
        }
        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = await this.getLocalStream()!
            await this.localVideoCurrentSrc.play()
        }
    }

    async inviteToCall(dids: string[]) {
        if (this.peerMesh.callStartTime == null) {
            log.error("Not in a call")
            return
        }
        try {
            await this.setupLocalPeer()
            // Joins and calls all peers. The mesh contains the to calling peers from #startToMakeACall
            this.peerMesh.join({ users: dids, connect: true })
            setTimeout(() => {
                if (this.peerMesh.callStartTime === null) {
                    this.leaveCall(true)
                }
            }, 100000)
        } catch (error) {
            log.error(`Error making call: ${error}`)
        }
    }

    /**
     * Accept an incoming call with the options
     */
    async acceptCall(audioOnly: boolean = false) {
        if (!this.incomingCall) {
            log.error("No call to accept")
            return
        }
        this.callOptions.audio.enabled = audioOnly
        this.callOptions.video.enabled = !audioOnly
        Store.state.devices.cameraEnabled.set(!audioOnly)
        this.callOptions.call.onlyAudioCall = audioOnly
        // If in a existing call leave it first
        this.peerMesh.leave()
        let meta: CallMeta = this.incomingCall.metadata
        this.peerMesh.init([meta.userInfo.did])
        this.acceptCallInternal(this.incomingCall)
        this.incomingConnections.forEach(conn => {
            let peer = this.peerMesh.getPeer(p => p.remotePeerId === conn.metadata.id)
            if (peer) peer.dataConnection = conn
            else conn.close()
        })
        this.incomingConnections = []
        this.incomingCall = null
        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.srcObject = await this.getLocalStream()!
            await this.localVideoCurrentSrc.play()
        }
    }

    private async acceptCallInternal(call: MediaConnection) {
        let meta: CallMeta = call.metadata
        console.log(`accepting call from ${meta}`)
        this.peerMesh.connect(meta.userInfo)
        this.channel = meta.channel
        call.answer!(await this.getLocalStream()!)
        this.peerMesh.mutatePeer(
            p => p.remotePeerId === call.peer,
            peer => {
                peer.updateUserData(meta.userInfo)
                peer.activeCall = call
            }
        )
        call.on("stream", async remoteStream => {
            let peer = this.peerMesh.getPeer(p => p.remotePeerId === call.peer)
            if (peer) {
                if (this.remoteVideoCreator) this.remoteVideoCreator.create({ user: peer.getUser(), stream: remoteStream })
                await peer.handleRemoteStream(remoteStream)
            }
        })
        this.acceptedIncomingCall = true
        // Tell the mesh that you successfully joined the call
        await this.peerMesh.join()
        this.peerMesh.notify(VoiceRTCMessageType.JoinedCall, call.peer)
    }

    async leaveCall(sendEndCallMessage = true) {
        console.error("leaving call")
        await this.peerMesh.notify(VoiceRTCMessageType.LeavingCall)
        sendEndCallMessage = sendEndCallMessage && this.channel !== undefined
        if (sendEndCallMessage && this.peerMesh.callStartTime) {
            const now = new Date()
            const duration = this.getDuration(now)
            const formattedEndTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
            const endText = get(_)("settings.calling.endCallMessage", { values: { formattedEndTime: formattedEndTime, duration: duration } })
            await RaygunStoreInstance.send(this.channel!, endText.split("\n"), [])
        } else if (sendEndCallMessage && this.peerMesh.callStartTime === null) {
            const text = get(_)("settings.calling.callMissed")
            await RaygunStoreInstance.send(this.channel!, text.split("\n"), [])
        }

        this.clearResources()

        if (get(Store.state.activeCall)) {
            Store.endCall()
        }

        if (get(Store.state.pendingCall)) {
            Store.denyCall()
        }

        log.error("Call ended and resources cleaned up.")
        this.setupLocalPeer()
    }

    async getLocalStream(replace = false) {
        if (!this.localStream || replace) {
            this.localStream = await this.createLocalStream(replace)
        }
        return this.localStream
    }

    async createLocalStream(updatingCallSetting = false) {
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
        if (updatingCallSetting) {
            this.peerMesh.remotePeers.forEach(peer => {
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
        return this.peerMesh.remotePeers.find(p => p.activeCall !== null) !== undefined
    }

    handleWithDataReceived(dataReceived: VoiceMessage) {
        log.debug(`Data received from ${dataReceived.userInfo.username}: ${dataReceived.type}`)
        switch (dataReceived.type) {
            case VoiceRTCMessageType.Calling:
                this.peerMesh.mutatePeer(
                    p => p.getUser().did === dataReceived.userInfo.did,
                    peer => peer.updateUserData(dataReceived.userInfo)
                )
                this.channel = dataReceived.channel
                break
            case VoiceRTCMessageType.LeavingCall:
                this.peerMesh.leave(new RemotePeer(dataReceived.userInfo.did).remotePeerId)
                if (this.peerMesh.empty()) this.leaveCall(false)
                break
            case VoiceRTCMessageType.JoinedCall:
                this.peerMesh.join({ users: dataReceived.userInfo })
                this.peerMesh.join({ users: dataReceived.peers, connect: true })
                this.peerMesh.notify(VoiceRTCMessageType.SyncPeers)
                break
            case VoiceRTCMessageType.SyncPeers:
                this.peerMesh.join({ users: dataReceived.userInfo })
                this.peerMesh.join({ users: dataReceived.peers, connect: true })
                break
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
        this.peerMesh.mutatePeer(
            p => p.remotePeerId === dataReceived.userInfo.did,
            peer => peer.updateUserData(dataReceived.userInfo)
        )
        Store.setActiveCall(Store.getCallingChat(this.channel!)!)
    }

    private getDuration(endTime: Date): string {
        if (!this.peerMesh.callStartTime) return "0:00"

        const durationMs = endTime.getTime() - this.peerMesh.callStartTime.getTime()
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

    private clearResources() {
        this.channel = undefined
        this.makingCall = false
        this.acceptedIncomingCall = false
        this.incomingCall = null
        if (this.localVideoCurrentSrc) {
            this.localVideoCurrentSrc.pause()
            this.localVideoCurrentSrc.srcObject = null
            this.localVideoCurrentSrc = null
        }
        if (this.localStream) this.localStream.getTracks().forEach(track => track.stop())
        this.localStream = null
        this.peerMesh.clear()
        Store.state.activeCallMeta.set({})
    }

    handleError(error: Error) {
        log.error(`Error: ${error}`)
    }
}

export const VoiceRTCInstance = new VoiceRTC({
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
