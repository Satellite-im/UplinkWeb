<script lang="ts">
    import { Appearance, Route, Shape, Size, Status } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { SettingSection } from "$lib/layouts"
    import { ProfilePicture, OrderedPhrase } from "$lib/components"
    import { Button, Icon, Label, Input, Text, Select, Checkbox } from "$lib/elements"
    import { Store } from "$lib/state/store"
    import type { User } from "$lib/types"
    import FileUploadButton from "$lib/components/ui/FileUploadButton.svelte"
    import Controls from "$lib/layouts/Controls.svelte"
    import { get } from "svelte/store"
    import { goto } from "$app/navigation";
    import { Tesseract } from "$lib/wasm/tesseract"

    initLocale()

    let loading = true
    let showSeed = false

    function toggleSeedPhrase() {
        showSeed = !showSeed
        if (loading) setTimeout(() => (loading = false), 200)
    }

    let samplePhrase = "agree alarm acid actual actress acid album admit absurd adjust adjust air".split(" ")

    let user: User = get(Store.state.user)
    let activityStatus: Status = Status.Online
    Store.state.user.subscribe(val => {
        user = val
        activityStatus = user.profile.status
    })

    let acceptableFiles: string = ".jpg, .jpeg, .png, .avif"
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
                <Button
                    text={$_("generic.cancel")}
                    appearance={Appearance.Alt}
                    on:click={_ => {
                        changeList.username = false
                        changeList.statusMessage = false

                        unsavedChanges = changeList.username || changeList.statusMessage
                    }}>
                    <Icon icon={Shape.XMark} />
                </Button>
                <Button
                    text={$_("generic.save")}
                    appearance={Appearance.Primary}
                    on:click={_ => {
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
        <div class="profile-header" style="background-image: url('{user.profile.banner.image}')" on:click={_ => fileinput.click()}></div>

        <div class="profile-picture-container">
            <ProfilePicture image={user.profile.photo.image} size={Size.Large} status={user.profile.status} frame={user.profile.photo.frame} noIndicator />
            <FileUploadButton
                icon
                tooltip={$_("settings.profile.change_profile_photo")}
                on:upload={picture => {
                    Store.setPhoto(picture.detail)
                }} />
        </div>

        <input style="display:none" type="file" accept={acceptableFiles} on:change={e => onFileSelected(e)} bind:this={fileinput} />

        <div class="content">
            <div class="section">
                <Label text={$_("generic.username")} />
                <div class="username-section">
                    <div class="username">
                        <Input
                            alt
                            bind:value={user.name}
                            highlight={changeList.username ? Appearance.Warning : Appearance.Default}
                            on:enter={_ => {
                                // TODO: Toast
                                Store.setUsername(user.name)
                            }}
                            on:input={_ => {
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
                <Label text={$_("user.status_message")} />
                <Input
                    alt
                    bind:value={user.profile.status_message}
                    placeholder={$_("user.set_status_message")}
                    highlight={changeList.statusMessage ? Appearance.Warning : Appearance.Default}
                    on:enter={_ => {
                        // TODO: Toast
                        Store.setStatus(user.profile.status_message)
                    }}
                    on:input={_ => {
                        changeList.statusMessage = true
                        unsavedChanges = changeList.username || changeList.statusMessage
                    }} />
            </div>
            <div class="section">
                <SettingSection name={$_("user.status.label")} description={$_("user.set_status")}>
                    <Select
                        options={[
                            { text: $_("user.status.online"), value: "online" },
                            { text: $_("user.status.offline"), value: "offline" },
                            { text: $_("user.status.idle"), value: "idle" },
                            { text: $_("user.status.do_not_disturb"), value: "do-not-disturb" },
                        ]}
                        on:change={v => {
                            switch (v.detail) {
                                case "online":
                                    return Store.setActivityStatus(Status.Online)
                                case "offline":
                                    return Store.setActivityStatus(Status.Offline)
                                case "idle":
                                    return Store.setActivityStatus(Status.Idle)
                                case "do-not-disturb":
                                    return Store.setActivityStatus(Status.DoNotDisturb)
                            }
                        }}
                        bind:selected={user.profile.status}>
                        {#if activityStatus === Status.Online}
                            <Icon icon={Shape.Circle} filled highlight={Appearance.Success} />
                        {:else if activityStatus === Status.Idle}
                            <Icon icon={Shape.Circle} filled highlight={Appearance.Warning} />
                        {:else if activityStatus === Status.DoNotDisturb}
                            <Icon icon={Shape.Circle} filled highlight={Appearance.Error} />
                        {:else}
                            <Icon icon={Shape.Circle} filled highlight={Appearance.Alt} />
                        {/if}
                    </Select>
                </SettingSection>
            </div>

            <div class="section">
                <SettingSection name={$_("settings.profile.reveal_phrase.label")} description={$_("settings.profile.reveal_phrase.description")}>
                    <Button
                        appearance={!showSeed ? Appearance.Error : Appearance.Alt}
                        text={!showSeed ? $_("settings.profile.reveal_phrase.show") : $_("settings.profile.reveal_phrase.hide")}
                        on:click={_ => {
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
                        <Button appearance={Appearance.Alt} text={$_("generic.copy")}>
                            <Icon icon={Shape.Clipboard} />
                        </Button>
                    </div>
                {/if}
            </div>

            <div class="section">
                <Checkbox checked>
                    <Text muted>{$_("settings.profile.should_store")}</Text>
                </Checkbox>
            </div>

            <div class="section">
                <SettingSection name={$_("settings.profile.log_out.label")} description={$_("settings.profile.log_out.description")}>
                    <Button
                        appearance={Appearance.Alt}
                        text={$_("settings.profile.log_out.label")}
                        on:click={(_) => {
                            Tesseract.lock()
                            goto(Route.Unlock)
                        }}>
                        <Icon icon={Shape.Lock} />
                    </Button>
                </SettingSection>
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
            position: relative;
            align-items: center;

            .content {
                display: inline-flex;
                flex-direction: column;
                gap: var(--gap);
                width: 100%;
            }

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
                        width: 9rem;
                        justify-content: center;
                    }

                    :global(.input-group input) {
                        color: var(--color-muted);
                    }
                }
            }

            .profile-picture-container {
                pointer-events: none;
                position: absolute;
                z-index: 2;
                top: calc((var(--profile-width) / 1.5) - (var(--profile-picture-size) * 2 / 2));
                height: calc(var(--profile-picture-size) * 2);
                margin-bottom: calc((var(--profile-picture-size) * 2) * -0.5);
                :global(.button) {
                    position: absolute;
                    bottom: calc(var(--padding-less) * -0.75);
                    right: calc(var(--padding-less) * -0.75);
                    z-index: 2;
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
