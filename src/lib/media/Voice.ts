import Peer from "simple-peer"

type VoiceRTCOptions = {
    audio: boolean,
    video: boolean
}

class VoiceRTC {
    localPeer = new Peer({ initiator: true, stream: undefined })
    remotePeer = new Peer()

    constructor(options: VoiceRTCOptions) {
        navigator.mediaDevices.getUserMedia({
            video: options.video,
            audio: options.audio,
        })
        .then(this.bindStream)
        .catch(() => {})

        this.localPeer.on("signal", data => this.remotePeer.signal(data))
        this.localPeer.on("connect", () => this.connect())
        this.localPeer.on("error", (error: Error) => this.error(error))

        this.remotePeer.on("stream", (stream: MediaStream) => this.handleRemoteStream(stream))
    }

    connect() {
        // stub
    }

    handleRemoteStream(_stream: MediaStream) {
        // stub
    }

    bindStream(stream: MediaStream) {
        this.localPeer = new Peer({ initiator: true, stream })
    }

    error(error: Error) {
        console.error(error)
    }
}
