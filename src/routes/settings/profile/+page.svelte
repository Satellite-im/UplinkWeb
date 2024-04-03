<script lang="ts">
    import { Appearance, Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { SettingSection } from "$lib/layouts"
    import { ProfilePicture, OrderedPhrase } from "$lib/components"
    import { Button, Icon, Label, Input, Text, Select, Checkbox } from "$lib/elements"
    import { Store } from "$lib/state/Store"
    import type { User } from "$lib/types"
    import FileUploadButton from "$lib/components/ui/FileUploadButton.svelte"
    import Controls from "$lib/layouts/Controls.svelte";

    initLocale()

    let loading = true
    let showSeed = false

    function toggleSeedPhrase() {
        showSeed = !showSeed
    }

    let samplePhrase = "agree alarm acid actual actress acid album admit absurd adjust adjust air".split(" ")

    let user: User
    Store.state.user.subscribe(val => {
        user = val
    })

    let acceptableFiles: string  = ".jpg, .jpeg, .png, .avif"
	let fileinput: HTMLElement
	
	const onFileSelected = (e: any) => {
        let image = e.target.files[0]
        let reader = new FileReader()
        reader.readAsDataURL(image)
        reader.onload = e => {
            let imageString = e.target?.result?.toString()
            Store.setBanner(imageString || "")
        }
    }

    let changeList = {
        username: false,
        statusMessage: false,
    }

    let unsavedChanges: boolean
</script>

<div id="page">
    {#if unsavedChanges}
        <div class="save-controls">
            <Controls>
                <Button text="Cancel" appearance={Appearance.Alt}>
                    <Icon icon={Shape.XMark} />
                </Button>
                <Button text="Save" appearance={Appearance.Primary} on:click={(_) => {
                    Store.setUsername(user.name)
                    Store.setStatus(user.profile.status_message)

                    changeList.username = false
                    changeList.statusMessage = false

                    unsavedChanges = changeList.username || changeList.statusMessage
                }}>
                    <Icon icon={Shape.CheckMark} />
                </Button>
            </Controls>
        </div>
    {/if}
    <!-- svelte-ignore missing-declaration -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="profile">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="profile-header" style="background-image: url('{user.profile.banner.image}')" on:click={(_) => fileinput.click()}>
            <div class="profile-picture-container">
                <ProfilePicture image={user.profile.photo.image} size={Size.Large} status={user.profile.status} />
                <FileUploadButton icon tooltip="Change Profile Photo" on:upload={(picture) => {
                    Store.setPhoto(picture.detail)
                }}/>
            </div>
        </div>
        <input style="display:none" type="file" accept={acceptableFiles} on:change={(e) => onFileSelected(e)} bind:this={fileinput} />

        <div class="section">
            <Label text="Username" />
            <div class="username-section">
                <div class="username">
                    <Input alt bind:value={user.name} placeholder="Set a note . . ." on:enter={(_) => {
                        // TODO: Toast
                        Store.setUsername(user.name)
                    }} on:keypress={(_) => {
                        changeList.username = true
                        unsavedChanges = changeList.username || changeList.statusMessage
                    }} />
                </div>
                <div class="short-id">
                    <Input alt value={user.id.short} disabled copyOnInteract>
                        <Icon icon={Shape.Hashtag} alt muted />
                    </Input>
                </div>
            </div>
        </div>
        <div class="section">
            <Label text="Status Message" />
            <Input alt bind:value={user.profile.status_message} placeholder="Set a note . . ." on:enter={(_) => {
                // TODO: Toast
                Store.setStatus(user.profile.status_message)
            }} on:keypress={(_) => {
                changeList.statusMessage = true
                unsavedChanges = changeList.username || changeList.statusMessage
            }} />
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
                    appearance={!showSeed ? Appearance.Error : Appearance.Alt}
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
                <div class="full-width flex-end">
                    <Button appearance={Appearance.Alt} text="Copy to Clipboard">
                        <Icon icon={Shape.Clipboard}/>
                    </Button>
                </div>
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

        .save-controls {
            position: absolute;
            bottom: var(--padding);
            right: calc(var(--padding) * 2);
            padding: var(--padding);
            background-color: var(--background-alt);
            border-radius: var(--border-radius);
            border: var(--border-width) solid var(--border-color);
        }

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