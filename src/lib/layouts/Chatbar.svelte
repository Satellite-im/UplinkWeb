<script lang="ts">
    import { Button, Icon, Input } from "$lib/elements"
    import { Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import Controls from "./Controls.svelte"
    import { Store } from "$lib/state/store"
    import { get } from "svelte/store"

    initLocale()
    let markdown = get(Store.state.settings).messaging.markdownSupport
    let message: string = ""
</script>

<div class="chatbar">
    <Controls>
        <slot name="pre-controls"></slot>
    </Controls>

    <Input alt placeholder={$_("generic.placeholder")} bind:value={message} rounded rich={markdown} on:enter={(_) => {
        Store.newMessage(get(Store.state.activeChat).id, {
            details: {
                at: new Date,
                origin: get(Store.state.user),
                remote: false,
            },
            text: [
                message 
            ],
            inReplyTo: null,
            reactions: [],
            attachments: []
        })
        message = ""
    }} />

    <slot></slot>

    <Button 
        icon 
        tooltip={$_("chat.send")} 
        on:click={(_) => {
            console.log('text', message)
            Store.newMessage(get(Store.state.activeChat).id, {
                details: {
                    at: new Date,
                    origin: get(Store.state.user),
                    remote: false,
                },
                text: [
                    message 
                ],
                inReplyTo: null,
                reactions: [],
                attachments: []
            })
            message = ""
        }}>
        <Icon icon={Shape.ChevronRight} />
    </Button>
</div>

<style lang="scss">
    .chatbar {
        display: inline-flex;
        align-items: center;
        padding: var(--padding-less);
        gap: var(--gap);
        width: 100%;
        border-top: var(--border-width) solid var(--border-color);
    }
</style>