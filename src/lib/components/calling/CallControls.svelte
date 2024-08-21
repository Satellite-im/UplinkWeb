<script lang="ts">
    import { Text, Button, Icon, Label } from "$lib/elements"
    import { Appearance, Route, SettingsRoute, Shape } from "$lib/enums"

    import { _ } from "svelte-i18n"
    import Controls from "../../layouts/Controls.svelte"
    import { get } from "svelte/store"
    import { SettingsStore, type ISettingsState } from "$lib/state"
    import { Store } from "$lib/state/Store"

    export let loading: boolean = false
    export let duration: Date = get(Store.state.activeCall)?.startedAt || new Date()
    export let muted: boolean = get(Store.state.devices.muted)
    export let deafened: boolean = get(Store.state.devices.deafened)
    export let settings: ISettingsState = get(SettingsStore.state)
    export let activeRoute: Route | SettingsRoute = Route.Chat

    let elapsedTime: string = "00:00:00"

    function updateElapsedTime() {
        const now = new Date()
        const diff = now.getTime() - new Date(duration).getTime()

        const hours = Math.floor(diff / (1000 * 60 * 60))
            .toString()
            .padStart(2, "0")
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            .toString()
            .padStart(2, "0")
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
            .toString()
            .padStart(2, "0")

        elapsedTime = `${hours}:${minutes}:${seconds}`
    }

    const interval = setInterval(updateElapsedTime, 1000)

    // Cleanup interval on destroy
    import { onDestroy } from "svelte"
    import { goto } from "$app/navigation"
    import { VoiceRTCInstance } from "$lib/media/Voice"
    onDestroy(() => {
        clearInterval(interval)
    })

    Store.state.devices.muted.subscribe(state => (muted = state))
    Store.state.devices.deafened.subscribe(state => (deafened = state))
    SettingsStore.state.subscribe(state => (settings = state))

    $: activeCall = Store.state.activeCall
    $: activeChat = Store.state.activeChat
    $: pending = settings.calling.minimalCallingAlerts && VoiceRTCInstance.isReceivingCall
</script>

{#if $activeCall || pending}
    <div class={`call-controls ${pending ? "incoming" : ""}`}>
        {#if settings?.audio?.callTimer && $activeCall}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="info"
                on:click={_ => {
                    Store.setActiveChat($activeCall.chat)
                    goto(Route.Chat)
                }}>
                <Label text={$_("call.in_call")} />
                <Text appearance={Appearance.Success} loading={loading}>
                    {elapsedTime}
                </Text>
            </div>
        {/if}

        {#if pending}
            <Label text="Incoming Call..." />
            <Controls>
                <Button tooltip="Answer" text="Answer" appearance={Appearance.Success} loading={loading} on:click={_ => {}}>
                    <Icon icon={Shape.PhoneCall} />
                </Button>
                <Button
                    tooltip="End"
                    text="Deny"
                    appearance={Appearance.Error}
                    loading={loading}
                    on:click={_ => {
                        Store.endCall()
                    }}>
                    <Icon icon={Shape.PhoneXMark} />
                </Button>
            </Controls>
        {:else if $activeCall}
            <Controls>
                <Button
                    icon
                    appearance={muted ? Appearance.Error : Appearance.Alt}
                    tooltip={$_("call.mute")}
                    loading={loading}
                    on:click={_ => {
                        Store.updateMuted(!muted)
                    }}>
                    <Icon icon={muted ? Shape.MicrophoneSlash : Shape.Microphone} />
                </Button>
                <Button
                    icon
                    appearance={deafened ? Appearance.Error : Appearance.Alt}
                    tooltip={$_("call.deafen")}
                    loading={loading}
                    on:click={_ => {
                        Store.updateDeafened(!deafened)
                    }}>
                    <Icon icon={deafened ? Shape.HeadphoneSlash : Shape.Headphones} />
                </Button>
                <Button
                    tooltip="End"
                    icon
                    appearance={Appearance.Error}
                    loading={loading}
                    on:click={_ => {
                        Store.endCall()
                        VoiceRTCInstance.endCall()
                    }}>
                    <Icon icon={Shape.PhoneXMark} />
                </Button>
                {#if $activeChat.id !== $activeCall.chat.id || activeRoute !== Route.Chat}
                    <Button
                        tooltip="Go"
                        icon
                        appearance={Appearance.Success}
                        loading={loading}
                        on:click={_ => {
                            Store.setActiveChat($activeCall.chat)
                            Store.setActiveCall($activeCall.chat)
                            goto(Route.Chat)
                        }}>
                        <Icon icon={Shape.ArrowRight} />
                    </Button>
                {/if}
            </Controls>
        {/if}
    </div>
{/if}

<style lang="scss">
    .call-controls {
        width: 100%;
        background-color: var(--background-alt);
        border: var(--border-width) solid var(--success-color);
        border-radius: var(--border-radius);
        padding: var(--padding-less);
        display: inline-flex;
        gap: var(--gap);
        min-width: var(--min-component-width);
        align-items: center;

        &.incoming {
            animation: pulse-success 1s infinite;
            box-shadow: 0 0 0 2em transparent;
        }

        .info {
            flex: 1;
        }

        :global(.controls) {
            flex: 1;
            justify-content: flex-end;
        }
    }
</style>
