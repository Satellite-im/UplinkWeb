<script lang="ts">
    import Switch from "$lib/elements/Switch.svelte"
    import SettingSection from "$lib/layouts/SettingSection.svelte"
</script>

<div class="moderation-settings">
    <SettingSection name="Human Verification" description={`Require new users to complete a "are you human?" verification test before they can interact with the community.`}>
        <Switch on />
    </SettingSection>
</div>

<style lang="scss"></style>
