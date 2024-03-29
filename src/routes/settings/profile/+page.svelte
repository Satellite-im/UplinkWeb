<script lang="ts">
    import { Appearance, Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { mock_users } from "$lib/mock/users"
    import { onMount } from "svelte"
    import { _ } from "svelte-i18n"
    import { SettingSection } from "$lib/layouts"
    import { ProfilePicture, OrderedPhrase } from "$lib/components"
    import { Button, Icon, Label, Input, Text, Select, Checkbox } from "$lib/elements";

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
            <div class="profile-picture-container">
                <ProfilePicture image={mock_users[0]?.profile.photo.image} size={Size.Large} status={mock_users[0]?.profile.status} />
                <Button icon tooltip="Change Profile Photo">
                    <Icon icon={Shape.Plus} />
                </Button>
            </div>
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
                <Button appearance={Appearance.Alt} class="full-width" text="Copy to Clipboard">
                    <Icon icon={Shape.Clipboard}/>
                </Button>
            {/if}
        </div>

        <div class="section">
            <Checkbox checked>
                <Text muted>Store recovery seed on account (disable for increased security, irriversable)</Text>
            </Checkbox>
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

                .profile-picture-container {
                    pointer-events: none;
                    position: absolute;
                    z-index: 2;
                    height: calc(var(--profile-picture-size)* 2);
                    margin-bottom: calc((var(--profile-picture-size) * 2) * -0.5);
                    :global(.button) {
                        position: absolute;
                        bottom: calc(var(--padding-less) * -0.75);
                        right: calc(var(--padding-less) * -0.75);
                        z-index: 2;
                    }
                }

                :global(.profile-picture) {
                    margin-bottom: -4rem;
                }

                &:hover {
                    position: relative;
                    &:after {
                        content: "Change Banner Photo";
                        top: 0;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        background-color: var(--opaque-color);
                        border-radius: var(--border-radius);
                        backdrop-filter: blur(var(--blur-radius));
                        position: absolute;
                        display: inline-flex;
                        justify-content: center;
                        align-items: center;
                        cursor: pointer;
                    }
                }
            }
        }
    }
</style>