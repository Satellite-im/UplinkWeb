<script lang="ts">
    import { Text, Button, Icon, Label } from "$lib/elements"

    import { Appearance, Shape } from "$lib/enums"
    
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import Controls from "../../layouts/Controls.svelte";

    initLocale()

    export let loading: boolean     = false
    export let duration: Date       = new Date()
    export let muted: boolean       = false
    export let streaming: boolean   = false
</script>

<div class="call-controls">
    <div class="info">
        <Label text={$_('call.in_call')} />
        <Text 
            appearance={Appearance.Success} 
            loading={loading}>
            {duration.toISOString().substring(11, 19)}
        </Text>
    </div>

    <Controls>
        <Button 
            icon 
            appearance={muted ? Appearance.Error : Appearance.Alt} 
            outline={muted} 
            tooltip={$_('call.mute')}
            loading={loading} >
            <Icon icon={Shape.Microphone} />
        </Button>
        <Button 
            icon 
            appearance={streaming ? Appearance.Success : Appearance.Alt } 
            tooltip={$_('call.stream')} 
            loading={loading}>
            <Icon icon={Shape.Stream} />
        </Button>
        <Button 
            text={$_('call.end')}
            tooltip={$_('call.end')}
            appearance={Appearance.Error} 
            loading={loading}>
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
    }
</style>