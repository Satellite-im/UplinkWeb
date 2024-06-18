import Peer from "simple-peer"

type VoiceRTCOptions = {
    audio: boolean
    video: {
        enabled: boolean
        selfie: boolean
    }
}

export class VoiceRTC {
    channel = ""
    localPeer = new Peer()
    remotePeer = new Peer()

    constructor(channel: string, options: VoiceRTCOptions) {
        navigator.mediaDevices
            .getUserMedia({
                video: options.video.selfie ? { facingMode: "user" } : options.video.enabled,
                audio: options.audio,
            })
            .then(this.localStream)
            .catch(() => {})

        this.localPeer = new Peer({ initiator: true, stream: undefined, channelName: channel })
        this.channel = channel

        this.localPeer.on("signal", (data: any) => this.remotePeer.signal(data))
        this.localPeer.on("connect", () => this.connect())
        this.localPeer.on("error", (error: Error) => this.error(error))

        this.remotePeer.on("stream", (stream: MediaStream) => this.remoteStream(stream))
    }

    get supported() {
        return Peer.WEBRTC_SUPPORT
    }

    get local() {
        return this.localPeer
    }

    get remote() {
        return this.remotePeer
    }

    setChannel(channel: string) {
        this.channel = channel
    }

    connect() {
        // stub
    }

    remoteStream(_stream: MediaStream) {
        // stub
    }

    localStream(stream: MediaStream) {
        this.localPeer = new Peer({ initiator: true, stream })
    }

    error(error: Error) {
        console.error(error)
    }
}
