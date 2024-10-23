<script lang="ts">
    import { Appearance, Shape, Size } from "$lib/enums"
    import { defaultUser, type User } from "$lib/types"
    import { fade } from "svelte/transition"
    import { ProfilePicture } from ".."
    import { animationDuration } from "$lib/globals/animations"
    import { mock_users } from "$lib/mock/users"
    import Controls from "$lib/layouts/Controls.svelte"
    import { Icon, Button, Text } from "$lib/elements"
    import Spacer from "$lib/elements/Spacer.svelte"

    export let participant: User = defaultUser
    export let hasVideo: boolean = false
    export let isMuted: boolean = false
    export let isDeafened: boolean = false
    export let showDetails: boolean = false
    export let isTalking: boolean = false

    function toggleDetails(state: boolean) {
        showDetails = state
    }
</script>

<div class="participant" data-cy="call-participant">
    {#if hasVideo}
        <!-- svelte-ignore a11y-media-has-caption -->
        <video data-cy="participant-video" class="{isMuted ? 'muted' : ''} {isDeafened ? 'deafened' : ''}" autoplay muted on:mouseover={() => toggleDetails(true)} on:mouseleave={() => toggleDetails(false)}> </video>
        {#if showDetails}
            <div class="details" in:fade={{ duration: animationDuration }}>
                <div data-cy="participant-user" class="user">
                    <ProfilePicture hook="participant-profile-picture" id={mock_users[1].key} image={mock_users[1].profile.photo.image} noIndicator size={Size.Smallest} />
                    <Text withShadow size={Size.Smaller}>{mock_users[1].name}</Text>
                </div>
            </div>
            <div class="state" in:fade={{ duration: animationDuration }}>
                <Controls>
                    {#if isMuted}
                        <Button hook="button-participant-mute" appearance={Appearance.Alt} small icon>
                            <Icon icon={Shape.MicrophoneSlash} />
                        </Button>
                    {/if}
                    {#if isDeafened}
                        <Button hook="button-participant-deafen" appearance={Appearance.Alt} small icon>
                            <Icon icon={Shape.HeadphoneSlash} />
                        </Button>
                    {/if}
                </Controls>
            </div>
        {/if}
    {:else}
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div data-cy="participant-without-video" class="simple" on:mouseover={() => toggleDetails(true)} on:mouseleave={() => toggleDetails(false)}>
            {#if showDetails}
                <div class="state centered" in:fade={{ duration: animationDuration }}>
                    <Controls>
                        {#if isMuted}
                            <Button hook="button-participant-mute" appearance={Appearance.Alt} icon disabled>
                                <Icon icon={Shape.MicrophoneSlash} />
                            </Button>
                        {/if}
                        {#if isDeafened}
                            <Button hook="button-participant-deafen" appearance={Appearance.Alt} icon>
                                <Icon icon={Shape.HeadphoneSlash} />
                            </Button>
                        {/if}
                    </Controls>
                </div>
            {/if}
            <ProfilePicture
                hook="participant-profile-picture"
                id={participant.key}
                image={participant.profile.photo.image}
                size={Size.Large}
                noIndicator
                highlight={isMuted || isDeafened ? Appearance.Error : isTalking ? Appearance.Success : Appearance.Alt} />
            <Spacer less />
            <Text singleLine size={Size.Smaller}>{participant.name}</Text>
        </div>
    {/if}
</div>

<style lang="scss">
    .participant {
        width: fit-content;
        height: fit-content;
        position: relative;
        align-items: center;
        justify-content: center;
        display: flex;

        .simple {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            &:hover {
                cursor: pointer;
            }
        }

        video {
            width: 300px;
            border-radius: var(--border-radius);
            border: var(--border-width-more) solid transparent;

            &:hover {
                border: var(--border-width-more) solid var(--primary-color);
                cursor: pointer;
            }

            &.muted,
            &.deafened {
                border: var(--border-width-more) solid var(--error-color);
            }
        }

        .details {
            position: absolute;
            bottom: 0;
            padding: var(--padding-less) var(--padding-minimal);
            justify-content: center;
            pointer-events: none;

            .user {
                display: inline-flex;
                flex-direction: row;
                gap: var(--gap-less);
                justify-content: center;
                align-items: center;
                background-color: var(--opaque-color);
                padding: var(--padding-minimal);
                padding-right: var(--padding-less);
                border-radius: var(--border-radius-less);
                backdrop-filter: blur(var(--blur-radius));
                -webkit-backdrop-filter: blur(var(--blur-radius));
            }
        }

        .state {
            position: absolute;
            top: 0;
            right: 0;
            display: inline-flex;
            gap: var(--gap);
            padding: var(--padding-less);
            pointer-events: none;
            z-index: 2;

            &.centered {
                bottom: 0;
                left: 0;
                justify-content: center;
                align-items: center;
            }
        }
    }
</style>
