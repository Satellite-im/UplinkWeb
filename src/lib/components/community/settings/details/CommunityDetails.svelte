<script lang="ts">
    import ProfilePicture from "$lib/components/profile/ProfilePicture.svelte"
    import Button from "$lib/elements/Button.svelte"
    import Input from "$lib/elements/Input/Input.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { Appearance, Size } from "$lib/enums"
</script>

<div class="community-details">
    <div class="header">
        <ProfilePicture size={Size.Large} noIndicator></ProfilePicture>
    </div>
    <div class="section">
        <Label text="Name"></Label>
        <Input placeholder="Community Name"></Input>
    </div>
    <div class="section">
        <Label text="MOTD"></Label>
        <Input placeholder="Message of the Day"></Input>
    </div>
    <div class="section">
        <Label text="Community ID"></Label>
        <Input value="did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK" copyOnInteract></Input>
    </div>
    <div class="section">
        <Label text="Delete Community"></Label>
        <Button appearance={Appearance.Error} text="Delete"></Button>
    </div>
</div>

<style lang="scss">
    .community-details {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        flex: 1;
        min-width: 500px;
        width: 100%;
        height: fit-content;

        .header {
            width: 100%;
            height: 256px;
            background-color: var(--alt-color);
            background-size: cover;
            border-radius: var(--border-radius);
            margin-bottom: 2rem;
            position: relative;

            :global(.profile-picture) {
                position: absolute;
                bottom: -2rem;
                left: calc(50% - var(--profile-picture-size));
            }
        }

        .section {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap-less);
        }
    }
</style>
