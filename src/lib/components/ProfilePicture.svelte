<script lang="ts">
    import { Appearance, Size, Status } from "$lib/enums";
    import Loader from '$lib/elements/Loader.svelte';

    export let image: string = "";
    export let notifications: number = 0;
    export let size: Size = Size.Medium;
    export let highlight: Appearance = Appearance.Default;
    export let typing: boolean = false;
    export let status: Status = Status.Offline;
    export let loading: boolean = false;
</script>

<div class="profile-picture {highlight !== null ? `highlight-${highlight}` : ""} {size}">
    {#if loading}
        <Loader />
    {:else}
        <img class="profile-image" src={image} alt="">
    {/if}
    {#if typing}
        <div class="typing-indicator"></div>
    {/if}
    {#if size === Size.Medium || size === Size.Small || size === Size.Large}
        <div class="status-indicator {status}"></div>
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

    &.largest {
        height: calc(var(--profile-picture-size) * 3);
        width:calc(var(--profile-picture-size) * 3);
        min-height: calc(var(--profile-picture-size) * 3);
        min-width:calc(var(--profile-picture-size) * 3);
    }

    &.small {
        height: var(--input-height);
        width: var(--input-height);
        min-height: var(--input-height);
        min-width: var(--input-height);
    }

    &.smallest {
        height: calc(var(--font-size) * 2);
        min-height: calc(var(--font-size) * 2);
        width: calc(var(--font-size) * 2);
        min-width: calc(var(--font-size) * 2);

        .status-indicator, .notifications {
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
        z-index: 1;
        box-shadow: 0 0 0 var(--border-width-more) var(--background);

        &.online {
            background-color: var(--success-color);
        }

        &.idle {
            background-color: var(--warning-color);
        }

        &.offline {
            background-color: var(--alt-color);
        }

        &.do-not-disturb {
            background-color: var(--error-color);
        }
    }

    &.large {
        height: calc(var(--profile-picture-size) * 2);
        width:calc(var(--profile-picture-size) * 2);
        min-height: calc(var(--profile-picture-size) * 2);
        min-width:calc(var(--profile-picture-size) * 2);

        .status-indicator {
            height: var(--font-size-large);
            width: var(--font-size-large);
            border-radius: calc(var(--font-size-large) / 2);
        }
    }

    &.small .status-indicator {
        height: var(--font-size-smaller);
        width: var(--font-size-smaller);
    }

    .badge {
        font-family: "Secondary";
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
        border: var(--border-width-more) solid var(--info-color);
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