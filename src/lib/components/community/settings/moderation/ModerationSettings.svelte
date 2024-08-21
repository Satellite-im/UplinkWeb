<script lang="ts">
    import Switch from "$lib/elements/Switch.svelte"
    import SettingSection from "$lib/layouts/SettingSection.svelte"
</script>

<div class="moderation-settings">
    <SettingSection name="Spam Prevention" description="Limit repeated messages and rapid message generation to prevent spam.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Profanity Filter" description={`Block messages from being sent if they contain certain words.`}>
        <Switch on />
    </SettingSection>
    <SettingSection name="Age Verification" description={`Requires users to enter their birthdate to verify their age.`}>
        <Switch on />
    </SettingSection>
</div>

<style lang="scss"></style>
