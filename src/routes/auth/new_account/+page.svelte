<script lang="ts">
    import { goto } from "$app/navigation"
    import { ProfilePicture}  from "$lib/components"
    import Controls from "$lib/layouts/Controls.svelte"
    import { Button, Icon, Input, Label, Spacer, Text, Title } from "$lib/elements"
    import { Appearance, Route, Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { onMount } from "svelte"
    import { _ } from 'svelte-i18n'

    initLocale()

    let loading = false
</script>

<div id="auth-recover">
    <div class="header">
        <Title>{$_('pages.auth.new_account.title')}</Title>
        <Text muted>{$_('pages.auth.new_account.subtext')}</Text>
    </div>
    <div class="main">
        <div class="left">
            <ProfilePicture size={Size.Large} image="/src/lib/assets/moon.png" />
        </div>
        <div class="right">
            <Label text={$_('generic.username')} />
            <Input alt placeholder={$_('pages.auth.new_account.enter_username')} />
            <Spacer less />
            <Label text={$_('generic.status_message')} />
            <Input alt placeholder={$_('pages.auth.new_account.set_status')} />
        </div>
    </div>
    <Controls>
        <Button 
            class="full-width"
            text={$_('controls.go_back')} 
            appearance={Appearance.Alt} 
            loading={loading}
            on:click={() => goto(Route.RecoverySeed)} >
            <Icon icon={Shape.ArrowLeft} />            
        </Button>
        <Button 
            class="full-width" 
            text={$_('pages.auth.new_account.create')} 
            loading={loading}
            on:click={(_) => {
                goto(Route.Chat);
            }} >
            <Icon icon={Shape.ArrowRight} />            
        </Button>
    </Controls>
</div>

<style lang="scss">
    #auth-recover {
        align-self: center;
        align-content: center;
        display: inline-flex;
        flex-direction: row;
        gap: var(--gap);
        padding: var(--padding);
        width: fit-content;
        max-width: var(--max-component-width);
        flex-wrap: wrap;
        flex: 1;

        .main {
            display: inline-flex;
            gap: var(--padding);
            flex: 100%;
            justify-content: center;
            background-color: var(--background-color);
            padding: var(--padding);
            border: var(--border-width) solid var(--border-color);
            border-radius: var(--border-radius);
            flex-wrap: wrap;
            
            .left {
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .right { 
                flex: 1;
                display: inline-flex;
                flex-direction: column;
                min-width: var(--min-component-width);
            }
        }

        .header {
            width: 100%;
            text-align: center;
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);
        }
    }
</style>