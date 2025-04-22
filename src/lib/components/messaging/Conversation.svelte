<script lang="ts">
    import { afterUpdate, onDestroy, onMount } from "svelte"
    import Button from "$lib/elements/Button.svelte"
    import { Icon, Text, Label } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { fade } from "svelte/transition"
    import { SettingsStore } from "$lib/state"
    import { derived, get } from "svelte/store"
    import { _, date, time } from "svelte-i18n"
    import { Store } from "$lib/state/Store"
    import { UIStore } from "$lib/state/ui"

    let scrollContainer: Element

    let scrolledUp: boolean = false
    let showScrollToBottom: boolean = false
    let clearUnreads = true
    export let loading: boolean = false
    export let unreads: { unread: number; since: Date; last_viewed: string } | undefined

    let lastUnread: { unread: number; since: Date; last_viewed: string } | undefined
    $: chat = Store.state.activeChat
    let setup: boolean = false
    $: derived(chat, _ => {
        if (setup) {
            if (scrollContainer.scrollHeight <= scrollContainer.clientHeight) markAsRead($chat.id)
        }
    })
    const scrollToBottom = (node: Element) => {
        if (node) node.scrollTop = node.scrollHeight
    }

    function scrollCheck(threshold: number) {
        return scrollContainer.scrollHeight - scrollContainer.scrollTop > scrollContainer.clientHeight * threshold
    }

    const handleScroll = () => {
        if (!setup) return
        showScrollToBottom = scrollCheck(1.5)
        let current = scrolledUp
        scrolledUp = scrollCheck(1.1)
        if (current != scrolledUp && !scrolledUp && unreads && unreads.unread > 0) {
            // Clear unreads if scrolled to the bottom
            if (clearUnreads) markAsRead($chat.id)
            clearUnreads = true
        }
    }

    const compact: boolean = get(SettingsStore.state).messaging.compact

    afterUpdate(() => {
        if (!scrolledUp) {
            scrollToBottom(scrollContainer)
        }
        // Mark as read current is already read and messages are incoming
        if (setup && lastUnread !== unreads && lastUnread === undefined) {
            if (scrolledUp) clearUnreads = false
            else markAsRead($chat.id)
        }
        lastUnread = unreads
    })

    onMount(() => {
        setTimeout(() => {
            if (scrollContainer) {
                if (unreads) {
                    scrollToUnread()
                } else {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight
                }
            }
            setup = true
        }, 250)
    })

    function markAsRead(chat: string) {
        UIStore.mutateChat(chat, c => {
            c.last_view_date = new Date()
            c.notifications = 0
        })
    }

    function scrollToUnread() {
        if (!unreads) return
        let element = document.getElementById(`message-${unreads.last_viewed}`)
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
        } else {
            // Assume that unread messages exceed currently loaded ones so we scroll all the way up
            let messages = document.getElementsByClassName("message-bubble")
            messages[0].scrollIntoView({ behavior: "smooth" })
        }
    }

    onDestroy(() => {
        if (scrollContainer && scrollContainer.scrollHeight) {
            if (scrollContainer?.scrollHeight <= scrollContainer?.clientHeight) markAsRead($chat.id)
        }
    })
</script>

<div class={`conversation ${compact ? "compact" : ""}`}>
    {#if loading}
        <div class="conversation-loader">
            <Label text="Syncing conversation . . ." />
            <Text class="min-text" loading={true} />
            <Text class="min-text" loading={true} />
        </div>
    {:else}
        {#if unreads && unreads.unread > 0}
            <div class="unreads" data-cy="unreads" aria-label="unreads" role="presentation" on:click={scrollToUnread}>
                <div class="bookmark" data-cy="unreads-scroll-to"></div>
                {$_("chat.newMessageSinceAmount", { values: { amount: unreads.unread, date: $date(unreads.since, { format: "medium" }), time: $time(unreads.since) } })}
            </div>
        {/if}
        <div bind:this={scrollContainer} class="scroll" on:scroll={handleScroll}>
            <div class="spacer"></div>
            <slot></slot>
        </div>
        {#if showScrollToBottom}
            <div class="scroll-to-bottom" transition:fade={{ duration: 300 }}>
                <Button icon appearance={Appearance.Primary} on:click={() => scrollToBottom(scrollContainer)}>
                    <Icon icon={Shape.ArrowDown} alt />
                </Button>
            </div>
        {/if}
    {/if}
</div>

<style lang="scss">
    .conversation {
        min-width: var(--minimum-width);
        flex: 1;
        display: inline-flex;
        justify-content: flex-end;
        align-items: flex-end;
        overflow: hidden;
        padding: var(--padding-less);
        position: relative;
        gap: var(--gap);

        &.compact {
            gap: var(--gap-less);
        }

        .scroll-to-bottom {
            display: inline-flex;
            position: absolute;
            width: 100%;
            align-items: center;
            justify-content: center;
        }

        .unreads {
            position: absolute;
            right: 0;
            top: 0;
            text-align: center;
            padding: var(--padding-minimal);
            padding-left: calc(var(--padding-minimal) + 30px);
            background-color: var(--focus-color);
            border-radius: 0 0 var(--border-radius) var(--border-radius);
            z-index: 1;
            cursor: pointer;

            .bookmark {
                position: absolute;
                top: 0;
                left: 0;
                height: 60px;
                -webkit-transform: rotate(0deg) skew(0deg);
                transform: rotate(0deg) skew(0deg);
                border-left: 15px solid color-mix(in srgb, var(--focus-color) 40%, #000000);
                border-right: 15px solid color-mix(in srgb, var(--focus-color) 40%, #000000);
                border-bottom: 15px solid transparent;
            }
        }
        .scroll {
            display: flex;
            align-items: flex-end;
            flex-direction: column;
            width: 100%;
            mask-image: linear-gradient(to top, var(--background) calc(100% - 1rem), transparent 100%);
            padding-top: 2rem;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            padding-right: var(--padding-less);

            & .spacer {
                flex: 1;
            }
        }

        .conversation-loader {
            width: 100%;
            height: 100%;
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);
        }
    }
</style>
