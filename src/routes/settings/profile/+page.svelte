<script lang="ts">
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import Label from "$lib/elements/Label.svelte";
    import Input from "$lib/elements/Input.svelte";
    import Text from "$lib/elements/Text.svelte";
    import { Appearance, Shape, Size } from "$lib/enums";
    import { initLocale } from "$lib/lang"
    import { mock_users } from "$lib/mock/users";
    import { onMount } from "svelte"
    import { _ } from 'svelte-i18n'
    import Select from "$lib/elements/Select.svelte";

    initLocale()

    let loading = true
    let sidebarOpen = true

    // TODO: Mock
    onMount(() => {
        setTimeout(() => loading = false, 1500)
    })

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen
    }
</script>

<div id="page">
    <!-- svelte-ignore missing-declaration -->
    <div class="profile">
        <div class="profile-header">
            <ProfilePicture image={mock_users[0]?.profile.photo.image} size={Size.Large} status={mock_users[0]?.profile.status} />
        </div>
        <div class="section">
            <Label text="Status" />
            <Select alt options={[
                { text: "Online", value: "online" },
                { text: "Offline", value: "offline" },
                { text: "Idle", value: "idle" },
                { text: "Do Not Disturb", value: "do-not-disturb" },
            ]} />
        </div>
        <div class="section">
            <Label text="Name" />
            <Input alt value={mock_users[0]?.name} placeholder="Set a note . . ."/>
        </div>
        <div class="section">
            <Label text="Status Message" />
            <Input alt value={mock_users[0]?.profile.status_message} placeholder="Set a note . . ."/>
        </div>

        <div class="footer">
            <div class="controls">
                <Button appearance={Appearance.Alt}>
                    <Icon icon={Shape.XMark} />
                    Cancel
                </Button>
                <Button appearance={Appearance.Primary}>
                    <Icon icon={Shape.CheckMark} />
                    Save
                </Button>
            </div>
        </div>
    </div>
    
</div>

<style lang="scss">
    #page {
        flex: 1;
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        height: 100%;
        overflow-y: scroll;
        padding-right: var(--padding);
        
        .profile {
            flex: 100%;
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);

            .section {
                display: inline-flex;
                flex-direction: column;
            }

            .profile-header {
                height: calc(var(--profile-width) / 1.5);
                background-color: var(--background-alt);
                background-image: url('$lib/assets/kumar.jpg');
                background-size: cover;
                padding: var(--padding-less);
                width: 100%;
                border-radius: var(--border-radius);
                display: inline-flex;
                align-items: flex-end;
                justify-content: center;
                margin-bottom: 4rem;
                position: relative;

                :global(.profile-picture) {
                    margin-bottom: -4rem;
                }
            }

            .footer {
                flex: 1;
                display: inline-flex;
                align-items: flex-end;
                .controls {
                    width: 100%;
                    display: inline-flex;
                    flex-direction: row;
                    gap: var(--gap);
                    justify-content: space-between;
                    height: var(--input-height);
                }
            }
        }
    }
</style>