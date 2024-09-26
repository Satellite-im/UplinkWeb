<script lang="ts">
    import { onDestroy, onMount } from "svelte"
    import { createEventDispatcher } from "svelte"
    import { Appearance, Size, Status } from "$lib/enums"
    import { Loader } from "$lib/elements"
    import type { Frame } from "$lib/types"
    import { createAvatar } from "@dicebear/core"
    import { getIdenticonGenerator } from "$lib/utils/ProfileUtils"
    import { get } from "svelte/store"
    import { SettingsStore } from "$lib/state"

    let tempCDN: string = "https://cdn.deepspaceshipping.co"

    export let image: string = ""
    export let notifications: number = 0
    export let size: Size = Size.Medium
    export let highlight: Appearance = Appearance.Default
    export let typing: boolean = false
    export let status: Status = Status.Offline
    export let loading: boolean = false
    export let noIndicator: boolean = false
    export let frame: Frame = { name: "", image: "" }
    export let hook: string = ""
    export let id: string = ""

    let identiconSrc: string = ""

    const updateIdenticon = () => {
        let identiconStyle = get(SettingsStore.state).messaging.identiconStyle

        if (!image || image.length < 16) {
            let identiconSize: number

            switch (size) {
                case Size.Smallest:
                    identiconSize = 80
                    break
                case Size.Smaller:
                    identiconSize = 100
                    break
                case Size.Small:
                    identiconSize = 100
                    break
                case Size.Medium:
                    identiconSize = 120
                    break
                case Size.Large:
                    identiconSize = 150
                    break
                case Size.Larger:
                    identiconSize = 180
                    break
                case Size.Largest:
                    identiconSize = 200
                    break
                default:
                    identiconSize = 100
            }

            let generator = getIdenticonGenerator(identiconStyle)
            // @ts-ignore
            const svg = createAvatar(generator, {
                seed: id,
                size: identiconSize,
                scale: 80,
                backgroundType: ["solid"],
            }).toString()

            identiconSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
        }
    }

    const dispatch = createEventDispatcher()

    onMount(() => {
        updateIdenticon()
    })

    $: {
        const unsubscribe = SettingsStore.state.subscribe(() => {
            updateIdenticon()
        })
        onDestroy(() => {
            unsubscribe()
        })
    }

    $: id, updateIdenticon()
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div data-cy={hook} class="profile-picture {highlight !== null ? `highlight-${highlight}` : ''} {size}" on:click={_ => dispatch("click")}>
    {#if loading}
        <Loader />
    {:else}
        {#if frame && frame.name}
            <img data-cy="profile-image-frame" class="profile-image-frame" src={`${tempCDN}${frame.image}`} alt="" />
        {/if}
        {#if image}
            <img data-cy="profile-image" class="profile-image" src={image} alt="" />
        {:else}
            <div class="identicon">
                <img src={identiconSrc} alt="identicon" />
            </div>
        {/if}
    {/if}
    {#if typing}
        <div class="typing-indicator"></div>
    {/if}
    {#if !noIndicator}
        <div data-cy="status-indicator" class="status-indicator {status}"></div>
    {/if}
    {#if notifications > 0}
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="badge">{notifications}</label>
    {/if}
</div>

<style lang="scss">
    .profile-picture {
        height: var(--profile-picture-size);
        width: var(--profile-picture-size);
        min-height: var(--profile-picture-size);
        min-width: var(--profile-picture-size);
        background-color: var(--alt-color-alt);
        border-radius: 50%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;

        .identicon {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
        }

        .profile-image-frame {
            position: absolute;
            z-index: 2;
            height: calc(var(--profile-picture-size) * 1.2);
            width: calc(var(--profile-picture-size) * 1.2);
            min-width: calc(var(--profile-picture-size) * 1.2);
            pointer-events: none;
        }

        &.larger {
            height: calc(var(--profile-picture-size) * 3);
            width: calc(var(--profile-picture-size) * 3);
            min-height: calc(var(--profile-picture-size) * 3);
            min-width: calc(var(--profile-picture-size) * 3);

            .profile-image-frame {
                height: calc(var(--profile-picture-size) * 3.75);
                width: calc(var(--profile-picture-size) * 3.75);
                min-width: calc(var(--profile-picture-size) * 3.75);
            }
        }

        &.small {
            height: var(--input-height);
            width: var(--input-height);
            min-height: var(--input-height);
            min-width: var(--input-height);
            .profile-image-frame {
                height: var(--profile-picture-size);
                width: var(--profile-picture-size);
                min-width: var(--profile-picture-size);
            }
        }

        &.smaller {
            height: calc(var(--font-size) * 2);
            width: calc(var(--font-size) * 2);
            min-height: calc(var(--font-size) * 2);
            min-width: calc(var(--font-size) * 2);
        }

        &.smallest {
            height: calc(var(--font-size) * 1.5);
            min-height: calc(var(--font-size) * 1.5);
            width: calc(var(--font-size) * 1.5);
            min-width: calc(var(--font-size) * 1.5);

            .status-indicator,
            .notifications {
                display: none;
            }
        }

        .profile-image {
            position: absolute;
            border-radius: 50%;
            width: 100%;
            height: 100%;
        }

        .status-indicator {
            height: var(--font-size-smaller);
            width: var(--font-size-smaller);
            background-color: var(--alt-color);
            border-radius: calc(var(--font-size) / 2);
            position: absolute;
            bottom: 0;
            right: 0;
            z-index: 3;
            box-shadow: 0 0 0 var(--border-width-more) var(--background);

            &.online {
                background-color: var(--success-color);
            }

            &.idle {
                background-color: var(--warning-color);
            }

            &.offline {
                background-color: var (--alt-color);
            }

            &.do-not-disturb {
                background-color: var(--error-color);
            }
        }

        &.large {
            height: calc(var(--profile-picture-size) * 2);
            width: calc(var(--profile-picture-size) * 2);
            min-height: calc(var(--profile-picture-size) * 2);
            min-width: calc(var(--profile-picture-size) * 2);

            .status-indicator {
                height: var(--font-size-large);
                width: var(--font-size-large);
                border-radius: calc(var(--font-size-large) / 2);
            }

            .profile-image-frame {
                height: calc(var(--profile-picture-size) * 2.5);
                width: calc(var(--profile-picture-size) * 2.5);
                min-width: calc(var(--profile-picture-size) * 2.5);
            }
        }

        &.small .status-indicator {
            height: var(--font-size-smaller);
            width: var(--font-size-smaller);
        }

        .badge {
            position: absolute;
            top: 0;
            right: 0;
            color: var(--color-bright);
            background-color: var(--error-color);
            padding: 0 var(--padding-minimal);
            font-size: var(--font-size-smaller);
            border-radius: var(--border-radius-minimal);
        }

        &.highlight-success {
            border: var(--border-width-more) solid var(--success-color);
        }

        &.highlight-info {
            border: var(--border-width-more) solid var (--info-color);
        }

        &.highlight-warning {
            border: var(--border-width-more) solid var(--warning-color);
        }

        &.highlight-error {
            border: var(--border-width-more) solid var(--error-color);
        }

        .typing-indicator {
            position: absolute;
            z-index: 1;
            top: 0;
            left: 0;
            width: 100%;
            min-width: 100%;
            height: 100%;
            min-height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border-top: var(--border-width-more) solid var(--alt-color);
            border-right: var(--border-width-more) solid var(--alt-color);
            border-bottom: var(--border-width-more) solid var(--alt-color);
            border-left: var(--border-width-more) solid var(--color);
            transform: translateZ(0);
            animation: circle-loader-spin 1s infinite;

            @keyframes circle-loader-spin {
                0% {
                    transform: rotate(-70deg);
                }
                50% {
                    transform: rotate(170deg);
                }
                100% {
                    transform: rotate(-70deg);
                }
            }
        }
    }
</style>
