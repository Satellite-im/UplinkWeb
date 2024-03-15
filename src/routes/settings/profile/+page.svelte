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
    import SettingSection from "$lib/layouts/SettingSection.svelte";
    import OrderedPhrase from "$lib/components/OrderedPhrase.svelte";
    import Checkbox from "$lib/elements/Checkbox.svelte";
    import Spacer from "$lib/elements/Spacer.svelte";

    initLocale()

    let loading = true
    let showSeed = false

    // TODO: Mock
    onMount(() => {
        setTimeout(() => loading = false, 1500)
    })

    function toggleSeedPhrase() {
        showSeed = !showSeed
    }

    let samplePhrase = "agree alarm acid actual actress acid album admit absurd adjust adjust air".split(" ")
</script>

<div id="page">
    <!-- svelte-ignore missing-declaration -->
    <div class="profile">
        <div class="profile-header">
            <ProfilePicture image={mock_users[0]?.profile.photo.image} size={Size.Large} status={mock_users[0]?.profile.status} />
        </div>
        <div class="section">
            <Label text="Username" />
            <div class="username-section">
                <div class="username">
                    <Input alt value={mock_users[0]?.name} placeholder="Set a note . . ."/>
                </div>
                <div class="short-id">
                    <Input alt value={mock_users[0]?.id.short} disabled copyOnInteract>
                        <Icon icon={Shape.Hashtag} alt muted />
                    </Input>
                </div>
            </div>
        </div>
        <div class="section">
            <Label text="Status Message" />
            <Input alt value={mock_users[0]?.profile.status_message} placeholder="Set a note . . ."/>
        </div>
        <div class="section">
            <SettingSection name="Status" description="Set your status indicator.">
                <Select options={[
                    { text: "Online", value: "online" },
                    { text: "Offline", value: "offline" },
                    { text: "Idle", value: "idle" },
                    { text: "Do Not Disturb", value: "do-not-disturb" },
                ]} highlight={Appearance.Success}>
                    <Icon icon={Shape.Circle} highlight={Appearance.Success} filled />
                </Select>
            </SettingSection>
        </div>

        <div class="section">
            <SettingSection name="Reveal Recovery Phrase" description="Click the button to reveal your recovery seed, please do not share this with anybody, it is the master-key for your account.">
                <Button 
                    outline
                    appearance={!showSeed ? Appearance.Error : Appearance.Success}
                    text={!showSeed ? "Reveal Phrase" : "Hide Phrase"}
                    on:click={(_) => {
                        toggleSeedPhrase()
                    }}>
                    <Icon icon={showSeed ? Shape.EyeSlash : Shape.Eye} />
                </Button>
            </SettingSection>
            {#if showSeed}
                {#each samplePhrase as word, i}
                    <OrderedPhrase number={i + 1} word={word} loading={loading} />
                {/each}
            {/if}
        </div>

        <div class="section">
            <Checkbox checked>
                <Text muted>Store recovery seed on account (disable for increased security, irriversable)</Text>
            </Checkbox>
        </div>

        <Spacer />

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
                display: inline-flex;
                flex-direction: row;
                gap: var(--gap);
                flex-wrap: wrap;
                align-items: center;
                flex: 1;
            }

            .username-section {
                display: inline-flex;
                gap: var(--gap);
                width: 100%;

                .username {
                    width: 100%;
                }

                .short-id {
                    :global(.input-group) {
                        font-family: "Secondary";
                        width: 9rem;
                        justify-content: center;
                    }

                    :global(.input-group input) {
                        color: var(--color-muted);
                    }
                }
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