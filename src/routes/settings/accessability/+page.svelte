<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import { Switch } from "$lib/elements"
    import { SettingSection } from "$lib/layouts"

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