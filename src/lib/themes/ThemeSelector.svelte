<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import Select from "$lib/elements/Select.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import { UIStore } from "$lib/state/ui"

    let availableThemes = [
        { text: "Default", value: "default" },
        { text: "Dracula", value: "dracula" },
        { text: "Olivia", value: "olivia" },
        { text: "Light", value: "light" },
    ]

    function toggleLightDark() {
        if ($selectedTheme === "light") {
            UIStore.setTheme("default")
        } else if ($selectedTheme === "default") {
            UIStore.setTheme("light")
        } else {
            UIStore.setTheme("default")
        }
    }

    $: selectedTheme = UIStore.state.theme
</script>

<Button hook="button-theme-moon" icon appearance={Appearance.Alt} on:click={_ => toggleLightDark()}>
    {#if $selectedTheme === "light"}
        <Icon icon={Shape.Sun} />
    {:else if $selectedTheme === "default"}
        <Icon icon={Shape.Moon} />
    {:else}
        <Icon icon={Shape.NoSymbol} />
    {/if}
</Button>

<Select
    alt
    options={availableThemes}
    bind:selected={$selectedTheme}
    on:change={e => {
        UIStore.setTheme(e.detail)
    }} />

<Button hook="button-theme-open-folder" icon disabled appearance={Appearance.Alt}>
    <Icon icon={Shape.FolderOpen} />
</Button>

<style lang="scss">
</style>
