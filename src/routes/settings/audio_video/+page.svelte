<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { SettingSection } from "$lib/layouts"
    import { Button, Switch, Select } from "$lib/elements"
    import { Meter } from "$lib/components"
    import { Appearance } from "$lib/enums"
    import { Store, type ISettingsState, defaultSettings } from "$lib/state/Store"
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    initLocale()

    let inputDevices: MediaDeviceInfo[] = []
    let outputDevices: MediaDeviceInfo[] = []

    $: inputOptions = inputDevices.length > 0
        ? inputDevices.map(d => ({ text: d.label, value: d.deviceId }))
        : [{ text: "Default", value: "Default" }]

    $: outputOptions = outputDevices.length > 0
        ? outputDevices.map(d => ({ text: d.label, value: d.deviceId }))
        : [{ text: "Default", value: "default" }]

    let getDevices = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true })
            let devices = await navigator.mediaDevices.enumerateDevices()
            inputDevices = devices.filter(device => device.kind === "audioinput")
            outputDevices = devices.filter(device => device.kind === "audiooutput")
        } catch (error) {
            console.error("Error accessing media devices:", error)
        }
    }

    let selectedInput: string = "default"
    let selectedOutput: string = "default"
    Store.state.devices.input.subscribe((d) => {
        selectedInput = d
    })
    Store.state.devices.input.subscribe((d) => {
        selectedInput = d
    })

    let settings: ISettingsState = get(Store.state.settings)
    Store.state.settings.subscribe((s: ISettingsState) => {
        settings = s
    })

    getDevices()

    let audioLevel = 0

    async function startAudioMonitoring() {
        // Check for user media support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("MediaDevices API or getUserMedia is not supported in your browser.")
            return
        }

        try {
            // Request access to the microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
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

</script>

<div id="page">
    <SettingSection name="Input Device" description="Select your input device, this is usually your microphone.">
        <Select selected={selectedInput} options={inputOptions} alt on:change={(v) => {
            Store.setInputDevice(v.detail)
        }} />
    </SettingSection>
    <div class="flex-row">
        <Meter percent={audioLevel} />
    </div>
    <SettingSection name="Output Device" description="Select your output device, this is usually your headphones or speakers.">
        <Select selected={selectedOutput} options={outputOptions} alt on:change={(v) => {
            Store.setOutputDevice(v.detail)
        }} />
    </SettingSection>
    <div class="flex-row">
        <Button small text="Test" appearance={Appearance.Alt} on:click={startAudioOutputMonitoring}/>
        <Meter percent={audioOutputLevel} />
    </div>
    <SettingSection name="Echo Cancellation" description="Helps minimize feedback from your headphones/speakers into your microphone.">
        <Switch on={(settings) ? settings.audio.echoCancellation : true} on:toggle={(on) => {
            Store.updateSettings({...settings, audio: {...settings.audio, echoCancellation: on.detail }})
        }} />
    </SettingSection>
    <SettingSection name="Interface Sounds" description="Play sounds when interacting with UI elements.">
        <Switch on={(settings) ? settings.audio.interfaceSounds : true} on:toggle={(on) => {
            Store.updateSettings({...settings, audio: {...settings.audio, interfaceSounds: on.detail }})
        }} />
    </SettingSection>
    <SettingSection name="Control Sounds" description="When enabled you will hear a sound when turning controls on or off, such as muting and unmuting.">
        <Switch on={(settings) ? settings.audio.controlSounds : true} on:toggle={(on) => {
            Store.updateSettings({...settings, audio: {...settings.audio, controlSounds: on.detail }})
        }} />
    </SettingSection>
    <SettingSection name="Message Sounds" description="Play a notification sound when a new message is recieved.">
        <Switch on={(settings) ? settings.audio.messageSounds : true} on:toggle={(on) => {
            Store.updateSettings({...settings, audio: {...settings.audio, messageSounds: on.detail }})
        }} />
    </SettingSection>
    <SettingSection name="Call Timer" description="Show the duration of an active call in the UI.">
        <Switch on={(settings) ? settings.audio.callTimer : true} on:toggle={(on) => {
            Store.updateSettings({...settings, audio: {...settings.audio, callTimer: on.detail }})
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
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        padding-right: var(--padding);
        
    }
</style>