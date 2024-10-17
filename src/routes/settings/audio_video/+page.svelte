<script lang="ts">
    import { _ } from "svelte-i18n"
    import { SettingSection } from "$lib/layouts"
    import { Button, Switch, Select } from "$lib/elements"
    import { Meter, VideoTest } from "$lib/components"
    import { Appearance } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import { onDestroy, onMount } from "svelte"
    import { get } from "svelte/store"
    import { SettingsStore, type ISettingsState } from "$lib/state"

    let inputDevices: MediaDeviceInfo[] = []
    let videoInputDevices: MediaDeviceInfo[] = []
    let outputDevices: MediaDeviceInfo[] = []

    $: inputOptions = inputDevices.length > 0 ? inputDevices.map(d => ({ text: d.label, value: d.deviceId })) : [{ text: "Default", value: "Default" }]
    $: videoInputOptions = inputDevices.length > 0 ? videoInputDevices.map(d => ({ text: d.label, value: d.deviceId })) : [{ text: "Default", value: "Default" }]
    $: outputOptions = outputDevices.length > 0 ? outputDevices.map(d => ({ text: d.label, value: d.deviceId })) : [{ text: "Default", value: "default" }]

    let getDevices = async () => {
        try {
            let stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            let devices = await navigator.mediaDevices.enumerateDevices()
            inputDevices = devices.filter(device => device.kind === "audioinput")
            videoInputDevices = devices.filter(device => device.kind === "videoinput")
            outputDevices = devices.filter(device => device.kind === "audiooutput")
            stream?.getTracks().forEach(t => t.stop())
        } catch (error) {
            console.error("Error accessing media devices:", error)
        }
    }

    let selectedInput: string = "default"
    let selectedOutput: string = "default"
    let selectedVideoInput: string = "default"

    Store.state.devices.input.subscribe(d => {
        selectedInput = d
    })
    Store.state.devices.video.subscribe(d => {
        selectedVideoInput = d
    })

    let settings: ISettingsState = get(SettingsStore.state)
    SettingsStore.state.subscribe((s: ISettingsState) => {
        settings = s
    })

    getDevices()

    let audioLevel = 0
    let stream: MediaStream

    async function startAudioMonitoring() {
        // Check for user media support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("MediaDevices API or getUserMedia is not supported in your browser.")
            return
        }

        try {
            // Request access to the microphone
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            const audioContext = new AudioContext()
            const analyser = audioContext.createAnalyser()
            const microphone = audioContext.createMediaStreamSource(stream)
            const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1)

            // Connect the microphone to the analyser and the script processor
            microphone.connect(analyser)
            analyser.connect(javascriptNode)
            javascriptNode.connect(audioContext.destination)

            // Set up the analyser
            analyser.smoothingTimeConstant = 0.8
            analyser.fftSize = 1024

            javascriptNode.onaudioprocess = () => {
                const array = new Uint8Array(analyser.frequencyBinCount)
                analyser.getByteFrequencyData(array)
                let values = 0

                const length = array.length
                for (let i = 0; i < length; i++) {
                    values += array[i]
                }

                const average = values / length
                audioLevel = Math.round((average / 220) * 100)
            }
        } catch (err) {
            console.error("Accessing the microphone failed:", err)
        }
    }

    let audioOutputLevel = 0

    function startAudioOutputMonitoring() {
        const audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1)

        // Assuming you have an audio element or audio source in your app
        const audio = new Audio("/assets/mp3/sample.mp3")
        const source = audioContext.createMediaElementSource(audio)

        // Connect the audio source to the analyser and then to the destination
        source.connect(analyser)
        analyser.connect(javascriptNode)
        javascriptNode.connect(audioContext.destination)
        analyser.connect(audioContext.destination)

        // Set up the analyser
        analyser.smoothingTimeConstant = 0.8
        analyser.fftSize = 1024

        javascriptNode.onaudioprocess = () => {
            const array = new Uint8Array(analyser.frequencyBinCount)
            analyser.getByteFrequencyData(array)
            let values = 0

            const length = array.length
            for (let i = 0; i < length; i++) {
                values += array[i]
            }

            const average = values / length
            audioOutputLevel = Math.round((average / 255) * 100)
        }

        // Start playing the audio
        audio.play().catch(error => console.error("Error playing audio:", error))
    }

    onMount(() => {
        startAudioMonitoring()
    })

    onDestroy(() => {
        stream?.getTracks().forEach(t => t.stop())
    })
</script>

<div id="page">
    <SettingSection hook="section-input-device" name={$_("settings.audio.inputDevice")} description={$_("settings.audio.inputDeviceDescription")}>
        <Select
            hook="selector-input-device"
            selected={selectedInput}
            options={inputOptions}
            alt
            on:change={v => {
                Store.setInputDevice(v.detail)
            }} />
    </SettingSection>

    <div class="flex-row">
        <Meter percent={audioLevel} />
    </div>

    <SettingSection hook="section-output-device" name={$_("settings.audio.outputDevice")} description={$_("settings.audio.outputDeviceDescription")}>
        <Select
            hook="selector-output-device"
            selected={selectedOutput}
            options={outputOptions}
            alt
            on:change={v => {
                Store.setOutputDevice(v.detail)
            }} />
    </SettingSection>

    <div class="flex-row">
        <Button hook="button-output-device-test" small text={$_("settings.audio.test")} appearance={Appearance.Alt} on:click={startAudioOutputMonitoring} />
        <Meter percent={audioOutputLevel} />
    </div>

    <SettingSection hook="section-video-device" name={$_("settings.audio.videoDevice")} description={$_("settings.audio.videoDeviceDescription")}>
        <Select
            hook="selector-video-device"
            selected={selectedVideoInput}
            options={videoInputOptions}
            alt
            on:change={v => {
                console.log("Video input device:", v.detail)
                Store.setVideoInputDevice(v.detail)
            }} />
    </SettingSection>
    <div class="flex-row">
        <VideoTest audioInput={selectedInput} videoInput={undefined} />
    </div>

    <SettingSection hook="section-echo-cancellation" name={$_("settings.audio.echoCancellation")} description={$_("settings.audio.echoCancellationDescription")}>
        <Switch
            hook="switch-echo-cancellation"
            on={settings ? settings.calling.echoCancellation : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, calling: { ...settings.calling, echoCancellation: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-interface-sounds" name={$_("settings.audio.interfaceSounds")} description={$_("settings.audio.interfaceSoundsDescription")}>
        <Switch
            hook="switch-interface-sounds"
            on={settings ? settings.audio.interfaceSounds : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, audio: { ...settings.audio, interfaceSounds: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-control-sounds" name={$_("settings.audio.controlSounds")} description={$_("settings.audio.controlSoundsDescription")}>
        <Switch
            hook="switch-control-sounds"
            on={settings ? settings.audio.controlSounds : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, audio: { ...settings.audio, controlSounds: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-message-sounds" name={$_("settings.audio.messageSounds")} description={$_("settings.audio.messageSoundsDescription")}>
        <Switch
            hook="switch-message-sounds"
            on={settings ? settings.audio.messageSounds : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, audio: { ...settings.audio, messageSounds: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-call-timer" name={$_("settings.audio.callTimer")} description={$_("settings.audio.callTimerDescription")}>
        <Switch
            hook="switch-call-timer"
            on={settings ? settings.audio.callTimer : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, audio: { ...settings.audio, callTimer: on.detail } })
            }} />
    </SettingSection>
</div>

<style lang="scss">
    #page {
        flex: 1;
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        padding: var(--padding);
    }
</style>
