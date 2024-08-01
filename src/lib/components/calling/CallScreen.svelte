<script lang="ts">
    import { Icon } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import Controls from "$lib/layouts/Controls.svelte"
    import Topbar from "$lib/layouts/Topbar.svelte"
    import { mock_users } from "$lib/mock/users"
    import Participant from "./Participant.svelte"
    import Text from "$lib/elements/Text.svelte"
    import PopupButton from "../ui/PopupButton.svelte"
    import CallSettings from "./CallSettings.svelte"
    import { get } from "svelte/store"
    import { Store } from "$lib/state/Store"
    import { _ } from "svelte-i18n"

    export let expanded: boolean = false
    function toggleExanded() {
        expanded = !expanded
    }

    let showSettings = false

    export let muted: boolean = get(Store.state.devices.muted)
    export let deafened: boolean = get(Store.state.devices.deafened)

    Store.state.devices.muted.subscribe(state => {
        muted = state
    })

    Store.state.devices.deafened.subscribe(state => {
        deafened = state
    })
</script>

<div id="call-screen" class={expanded ? "expanded" : ""}>
    <Topbar simple>
        <svelte:fragment slot="content">
            <Text>Big Party Time</Text>
            <Text muted size={Size.Smaller}>
                ({mock_users.length}) users in the call
            </Text>
        </svelte:fragment>
    </Topbar>
    <div id="participants">
        {#each mock_users as user}
            <Participant participant={user} hasVideo={user.media.is_streaming_video} isMuted={user.media.is_muted} isDeafened={user.media.is_deafened} isTalking={user.media.is_playing_audio} />
        {/each}
    </div>
    <div class="toolbar">
        <Controls>
            <PopupButton
                name={$_("generic.settings")}
                open={showSettings}
                on:open={_ => {
                    showSettings = true
                }}>
                <svelte:fragment slot="icon">
                    <Icon icon={Shape.Cog} />
                </svelte:fragment>
                <CallSettings />
            </PopupButton>
        </Controls>
        <Controls>
            <Button
                icon
                appearance={muted ? Appearance.Error : Appearance.Alt}
                tooltip={$_("call.mute")}
                on:click={_ => {
                    Store.updateMuted(!muted)
                }}>
                <Icon icon={muted ? Shape.MicrophoneSlash : Shape.Microphone} />
            </Button>
            <Button
                icon
                appearance={deafened ? Appearance.Error : Appearance.Alt}
                tooltip={$_("call.deafen")}
                on:click={_ => {
                    Store.updateDeafened(!deafened)
                }}>
                <Icon icon={deafened ? Shape.HeadphoneSlash : Shape.Headphones} />
            </Button>
            <Button appearance={Appearance.Alt} icon tooltip={$_("call.stream")}>
                <Icon icon={Shape.Stream} />
            </Button>
            <Button appearance={Appearance.Alt} icon tooltip={$_("call.video")}>
                <Icon icon={Shape.VideoCamera} />
            </Button>
            <Button appearance={Appearance.Error} icon tooltip={$_("call.end")}>
                <Icon icon={Shape.PhoneXMark} />
            </Button>
        </Controls>
        <Controls>
            <Button appearance={Appearance.Alt} icon outline tooltip={expanded ? $_("call.collapse") : $_("call.expand")} on:click={toggleExanded}>
                {#if expanded}
                    <Icon icon={Shape.ChevronsUp} />
                {:else}
                    <Icon icon={Shape.ChevronsDown} />
                {/if}
            </Button>
            <Button appearance={Appearance.Alt} icon outline tooltip={$_("call.fullscreen")}>
                <Icon icon={Shape.ArrowsOut} />
            </Button>
        </Controls>
    </div>
</div>

<style lang="scss">
    #call-screen {
        background-color: var(--black);
        display: flex;
        width: 100%;
        min-height: var(--min-call-screen-height);
        padding: var(--padding);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        transition: all var(--animation-speed);

        &.expanded {
            flex: 100%;
        }

        .toolbar {
            width: 100%;
            display: inline-flex;
            justify-content: space-between;
        }

        #participants {
            flex: 1;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: var(--gap);
            padding: var(--padding);
            align-items: center;
            justify-content: center;
        }
    }
</style>
