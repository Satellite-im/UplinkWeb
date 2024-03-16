<script lang="ts">
    import Switch from "$lib/elements/Switch.svelte"
    import { initLocale } from "$lib/lang"
    import SettingSection from "$lib/layouts/SettingSection.svelte"
    import { _ } from 'svelte-i18n'

    initLocale()


</script>

<div id="page">
    <SettingSection name="Open Dyslexic" description="Open Dyslexic may help some users who suffer from dyslexia, it's a custom font you can enable.">
        <Switch />
    </SettingSection>
</div>

<style lang="scss">
    #page {
        display: flex;
        flex-direction: column;
        margin: 0;
        flex: 1;
        gap: var(--gap);
    }
</style>