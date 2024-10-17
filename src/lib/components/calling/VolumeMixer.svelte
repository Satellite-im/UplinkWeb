<script lang="ts">
    import { Text, Label, RangeSelector, Button, Icon } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import { UIStore } from "$lib/state/ui"
    import { get } from "svelte/store"
    import ProfilePicture from "../profile/ProfilePicture.svelte"
    import Spacer from "$lib/elements/Spacer.svelte"
    import { VoiceRTCInstance, VoiceRTCMessageType } from "$lib/media/Voice"
    import { createEventDispatcher, onDestroy } from "svelte"
    import { _ } from "svelte-i18n"

    const standardVolumeLevel = 100
    let changeTimeOut: NodeJS.Timeout

    export let participants: string[]
    let currentUser = get(Store.state.user)
    $: activeCall = get(Store.state.activeCall)
    let usersVolumeInCall: { [key: string]: number } = get(Store.state.activeCall)?.volumeParticipantsLevel ?? {}

    const dispatch = createEventDispatcher()

    $: if (participants) {
        participants.forEach(user => {
            if (activeCall) {
                if (!activeCall.volumeParticipantsLevel[user]) {
                    activeCall.volumeParticipantsLevel[user] = standardVolumeLevel
                }
            }
        })
    }

    function updateUserVolume() {
        if (!activeCall) return

        activeCall.volumeParticipantsLevel = { ...usersVolumeInCall }

        const updateVideoElementVolume = (element: HTMLVideoElement | null, volume: number) => {
            if (element && element.volume !== volume) {
                element.volume = volume
            }
        }

        Object.entries(usersVolumeInCall).forEach(([user, volume]) => {
            const videoElementId = user === currentUser.key ? "local-user-video" : `remote-user-video-${user}`

            const videoElement = document.getElementById(videoElementId) as HTMLVideoElement | null
            const participantVolume = (get(Store.state.activeCall)?.volumeParticipantsLevel[user] ?? 100) / 200

            updateVideoElementVolume(videoElement, participantVolume)

            if (user === currentUser.key) {
                VoiceRTCInstance.callOptions.audio.volume = participantVolume
                VoiceRTCInstance.call?.notify(VoiceRTCMessageType.UpdateUser)
            }
        })

        dispatch("close")
    }

    onDestroy(() => {
        clearTimeout(changeTimeOut)
    })

    $: chats = UIStore.state.chats
    $: userCache = Store.getUsersLookup($chats.map(c => c.users).flat())
</script>

<div class="volume-mixer" data-cy="volume-mixer">
    {#each participants as user ($userCache[user].key)}
        <div class="user-volume" data-cy="{$userCache[user].name}-volume">
            <Label hook="label-mixer-username" text={currentUser.key === $userCache[user].key ? $userCache[user].name + " (You)" : $userCache[user].name} />
            <div class="control">
                <ProfilePicture hook="mixer-user-picture" id={$userCache[user].key} size={Size.Smallest} image={$userCache[user].profile.photo.image} status={$userCache[user].profile.status} />
                <div class="range">
                    <RangeSelector
                        min={0}
                        max={200}
                        value={activeCall ? usersVolumeInCall[$userCache[user].key] : standardVolumeLevel}
                        on:change={e => {
                            usersVolumeInCall[$userCache[user].key] = e.detail
                            usersVolumeInCall = { ...usersVolumeInCall }
                        }} />
                </div>
                <Text hook="text-user-volume">
                    {activeCall ? usersVolumeInCall[$userCache[user].key] : standardVolumeLevel}
                </Text>
            </div>
        </div>
    {/each}
    <Button appearance={Appearance.Primary} text={"Update"} on:click={_ => updateUserVolume()}>
        <Icon icon={Shape.Refresh} />
    </Button>
    <Spacer less={true} />
</div>

<style lang="scss">
    .volume-mixer {
        width: var(--min-component-width);
        max-height: var(--min-component-width);
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        background-color: var(--opaque-color);
        backdrop-filter: blur(var(--blur-radius));
        padding: var(--padding);
        border-radius: var(--border-radius);
        position: absolute;
        z-index: 3;
        bottom: 100%;
        margin-bottom: calc((var(--input-height) / 2) * -1);
        margin-left: calc((var(--input-height) / 2));
        overflow-y: scroll;
        border: var(--border-width) solid var(--border-color);

        .user-volume {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap-less);
        }

        .control {
            display: inline-flex;
            gap: var(--gap);

            .range {
                flex: 1;
            }
        }
    }
</style>
