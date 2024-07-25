import { Store } from "$lib/state/Store"
import { failure, success, type Result } from "$lib/utils/Result"
import { Peer } from "peerjs"
import { get } from "svelte/store"

type VoiceRTCOptions = {
    audio: boolean
    video: {
        enabled: boolean
        selfie: boolean
    }
}

export class VoiceRTC {
    channel: string
    localPeer: Peer
    remotePeer: Peer
    localStream: MediaStream | null = null
    localVideoEl: any
    localVideoCurrentSrc: any

    base64EncodeDid(did: string): string {
        return btoa(did)
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(0, 20)
    }

    constructor(channel: string, options: VoiceRTCOptions) {
        let userId = get(Store.state.user).key
        const peerId = userId.replace("did:key:", "")
        console.log("Local User Peer: ", peerId)
        this.channel = channel
        this.localPeer = new Peer(peerId)
        this.remotePeer = new Peer()
        this.connectLocalPeer()
    }

    setVideoElements(localVideoEl: HTMLVideoElement, localVideoCurrentSrc: HTMLVideoElement) {
        this.localVideoEl = localVideoEl
        this.localVideoCurrentSrc = localVideoCurrentSrc
    }

    renderLocalWebcam = (stream: MediaStream) => {
        console.log(stream)
        this.localVideoEl.srcObject = stream
        this.localVideoEl.play()
    }

    connectLocalPeer() {
        this.localPeer.on("open", id => {
            console.log("My peer ID is: " + id)
        })

        this.localPeer.on("error", id => {
            console.log("error id " + id)
        })

        this.localPeer.on("connection", conn => {
            console.log("message....")
            conn.on("data", data => {
                console.log("new data " + data)
            })
            conn.on("open", () => {
                console.log("new message")
            })
        })

        this.localPeer.on("call", async call => {
            await navigator.mediaDevices
                .getUserMedia({
                    video: true,
                    audio: true,
                })
                .then(stream => {
                    call.answer(stream)
                    call.on("stream", this.renderLocalWebcam)
                    this.localVideoCurrentSrc.srcObject = stream
                    this.localVideoCurrentSrc.play()
                })
                .catch(err => console.log("err msg" + err))
        })

        this.localPeer.on("error", this.error)
    }

    // answerCall(call: Peer.MediaConnection) {
    //     if (this.localStream) {
    //         call.answer(this.localStream)
    //         call.on("stream", remoteStream => {
    //             this.remoteStream(remoteStream)
    //         })
    //     } else {
    //         console.error("Local stream not available")
    //     }
    // }

    async makeVoiceCall(remotePeerId: string) {
        if (this.localStream) {
            const call = this.localPeer.call(remotePeerId, this.localStream)
            call.on("stream", remoteStream => {
                this.remoteStream(remoteStream)
            })
        } else {
            console.error("Local stream not available")
        }
    }

    async makeVideoCall(remotePeerId: string) {
        try {
            let remotePeerIdEdited = remotePeerId.replace("did:key:", "")
            console.log("Remote user Peer: ", remotePeerIdEdited)
            var conn = this.localPeer.connect(remotePeerIdEdited)
            conn.on("data", data => {
                console.log("new data " + data)
            })
            conn.on("open", function () {
                conn.send("hi")
            })
            await navigator.mediaDevices
                .getUserMedia({
                    video: true,
                    audio: true,
                })
                .then(stream => {
                    let call = this.localPeer.call(remotePeerIdEdited, stream)
                    this.localVideoCurrentSrc.srcObject = stream
                    this.localVideoCurrentSrc.play()
                    call.on("stream", this.renderLocalWebcam)
                })
                .catch(err => console.log("have error " + err))
        } catch (error) {
            console.error("Error accessing media devices:", error)
        }
    }

    // get supported() {
    //     return Peer.WEBRTC_SUPPORT
    // }

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
        // stub for future implementation
    }

    remoteStream(_stream: MediaStream) {
        // Implement this to handle the remote stream, e.g., attach it to a video element
        console.log("Remote stream received:", _stream)
    }

    error(error: Error) {
        console.error("Error:", error)
    }
}
