<script lang="ts">
    import { Text, Button, Icon, Label } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import Controls from "../../layouts/Controls.svelte"
    import { get } from "svelte/store"
    import { SettingsStore, type ISettingsState } from "$lib/state"
    import { Store } from "$lib/state/store"

    initLocale()

    export let loading: boolean = false
    export let duration: Date = new Date()
    export let muted: boolean = get(Store.state.devices.muted)
    export let deafened: boolean = get(Store.state.devices.deafened)
    export let settings: ISettingsState = get(SettingsStore.state)

    Store.state.devices.muted.subscribe(state => (muted = state))
    Store.state.devices.deafened.subscribe(state => (deafened = state))
    SettingsStore.state.subscribe(state => (settings = state))
</script>

<div class="call-controls">
    {#if settings?.audio?.callTimer}
        <div class="info">
            <Label text={$_("call.in_call")} />
            <Text appearance={Appearance.Success} loading={loading}>
                {duration.toISOString().substring(11, 19)}
            </Text>
        </div>
    {/if}

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
        <Button text={$_("call.end")} tooltip={$_("call.end")} appearance={Appearance.Error} loading={loading}>
            <Icon icon={Shape.PhoneXMark} />
        </Button>
    </Controls>
</div>

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

        .info {
            flex: 1;
        }

        :global(.controls) {
            flex: 1;
            justify-content: flex-end;
        }
    }
</style>
