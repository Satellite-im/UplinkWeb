<script lang="ts">
    import { Appearance, Integrations, Route, Shape, Size, Status } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { SettingSection } from "$lib/layouts"
    import { ProfilePicture, OrderedPhrase, ContextMenu } from "$lib/components"
    import { Button, Icon, Label, Input, Text, Select, Checkbox } from "$lib/elements"
    import { Store } from "$lib/state/Store"
    import type { Integration, User } from "$lib/types"
    import FileUploadButton from "$lib/components/ui/FileUploadButton.svelte"
    import Controls from "$lib/layouts/Controls.svelte"
    import { get, writable } from "svelte/store"
    import { goto } from "$app/navigation"
    import { ToastMessage } from "$lib/state/ui/toast"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { onDestroy } from "svelte"
    import { TesseractStoreInstance } from "$lib/wasm/TesseractStore"
    import { AuthStore } from "$lib/state/auth"
    import { CommonInputRules } from "$lib/utils/CommonInputRules"
    import { compressImageToUpload, MAX_SIZE_IMAGE_TO_UPLOAD_ON_PROFILE } from "$lib/components/utils/CompressImage"
    import IntegrationDisplay from "$lib/components/ui/IntegrationDisplay.svelte"
    import { identityColor, toIntegrationIconSrc, toIntegrationKind } from "$lib/utils/ProfileUtils"

    initLocale()

    let loading = true
    let showSeed = false
    let isValidUsernameToUpdate = false
    let isValidStatusMessageToUpdate = true

    function toggleSeedPhrase() {
        showSeed = !showSeed
        if (loading) setTimeout(() => (loading = false), 200)
    }

    async function logOut() {
        AuthStore.setStayLogged(false)
        AuthStore.logIn(false)
        await TesseractStoreInstance.lock()
        goto(Route.Unlock)
    }

    async function updateProfilePicture(picture: string) {
        await MultipassStoreInstance.updateProfilePhoto(picture)
        if (picture === "/0") {
            Store.setPhoto("")
            return
        }
        Store.setPhoto(picture)
    }

    async function updateUsername(newUsername: string) {
        if (!isValidUsernameToUpdate) {
            return
        }
        userReference.name = newUsername
        Store.setUsername(newUsername)
        await MultipassStoreInstance.updateUsername(newUsername)
        Store.addToastNotification(new ToastMessage("", profile_update_txt, 2))
    }

    async function updateStatusMessage(newStatusMessage: string) {
        if (!isValidStatusMessageToUpdate) {
            return
        }
        userReference.profile.status_message = newStatusMessage
        Store.setStatusMessage(newStatusMessage)
        await MultipassStoreInstance.updateStatusMessage(newStatusMessage)
        Store.addToastNotification(new ToastMessage("", profile_update_txt, 2))
    }

    function updatePendentItemsToSave() {
        changeList.username = false
        changeList.statusMessage = false

        unsavedChanges = changeList.username || changeList.statusMessage
        isValidStatusMessageToUpdate = false
        isValidUsernameToUpdate = false
    }

    let samplePhrase = get(AuthStore.state).seedPhrase!

    let userReference: User = { ...get(Store.state.user) }
    let statusMessage: string = { ...get(Store.state.user) }.profile.status_message

    onDestroy(() => {
        Store.setUsername(userReference.name)
        Store.setStatusMessage(userReference.profile.status_message)
    })

    $: user = Store.state.user
    let key: string = ""
    let activityStatus: Status = Status.Offline

    Store.state.user.subscribe(val => {
        let user = val
        userReference = { ...val }
        statusMessage = user.profile.status_message
        activityStatus = user.profile.status
        key = user.key
    })

    let acceptableFiles: string = ".jpg, .jpeg, .png, .avif, .webp"
    let fileinput: HTMLElement

    const onFileSelected = async (e: any) => {
        let image = e.target.files[0]
        let quality = 0.9

        while (true) {
            let compressedImage = await compressImageToUpload(image, quality)
            if (compressedImage!.size <= MAX_SIZE_IMAGE_TO_UPLOAD_ON_PROFILE || quality <= 0.1) {
                let reader = new FileReader()
                reader.readAsDataURL(compressedImage!)
                reader.onload = async e => {
                    let imageString = e.target?.result?.toString()
                    await MultipassStoreInstance.updateBannerPicture(imageString || "")
                    Store.setBanner(imageString || "")
                }
                break
            }
            quality -= 0.1
        }
        e.target.value = ""
    }

    let changeList = {
        username: false,
        statusMessage: false,
    }

    let unsavedChanges: boolean
    let profile_update_txt = $_("settings.profile.update")

    async function copy_did(short: boolean) {
        if (short) {
            await navigator.clipboard.writeText(`${userReference.name}#${userReference.id.short}`)
        } else {
            await navigator.clipboard.writeText(`${userReference.key}`)
        }
    }

    let showEditIntegrations = writable(false)
    let selectedKind = Integrations.Generic
    let selectedKey: string
    let selectedKeyEditValue: string

    function startEditingIntegration(key: string, value: string) {
        selectedKey = key
        selectedKeyEditValue = value
        selectedKind = toIntegrationKind(key)
        showEditIntegrations.set(true)
    }

    function setIntegration() {
        if (selectedKey !== "" && selectedKeyEditValue !== "") {
            MultipassStoreInstance.setMetadata(selectedKey, selectedKeyEditValue)
            resetSelection()
        }
    }

    function removeIntegration(key: string) {
        MultipassStoreInstance.removeMetadata(key)
        resetSelection()
    }

    function resetSelection() {
        showEditIntegrations.set(false)
        selectedKey = ""
        selectedKeyEditValue = ""
    }
</script>

<div id="page">
    {#if unsavedChanges}
        <div class="save-controls" data-cy="save-controls">
            <Controls>
                <Button
                    hook="button-cancel"
                    text={$_("generic.cancel")}
                    appearance={Appearance.Alt}
                    on:click={_ => {
                        statusMessage = userReference.profile.status_message
                        Store.setUsername(userReference.name)
                        Store.setStatusMessage(userReference.profile.status_message)
                        updatePendentItemsToSave()
                    }}>
                    <Icon icon={Shape.XMark} />
                </Button>
                <Button
                    hook="button-save"
                    text={$_("generic.save")}
                    disabled={(!isValidUsernameToUpdate && changeList.username) || (!isValidStatusMessageToUpdate && changeList.statusMessage)}
                    appearance={Appearance.Primary}
                    on:click={async _ => {
                        if (changeList.statusMessage) {
                            await updateStatusMessage(statusMessage)
                        }
                        if (changeList.username) {
                            await updateUsername($user.name)
                        }

                        updatePendentItemsToSave()
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
        <ContextMenu
            hook="context-menu-banner-picture"
            items={[
                {
                    id: "clear-banner-picture",
                    icon: Shape.Trash,
                    text: "Delete Banner Picture",
                    appearance: Appearance.Default,
                    onClick: async () => {
                        await MultipassStoreInstance.updateBannerPicture("/0")
                        Store.setBanner("")
                    },
                },
            ]}>
            <div
                slot="content"
                let:open
                on:contextmenu={open}
                class="profile-header"
                data-cy="profile-banner"
                style={`background-image: url(${$user.profile.banner.image}); background-color: ${identityColor($user.key)};)`}
                on:click={_ => {
                    fileinput.click()
                }}>
                <input style="display:none" type="file" accept={acceptableFiles} on:change={e => onFileSelected(e)} bind:this={fileinput} />
            </div>
        </ContextMenu>
        <ContextMenu
            hook="context-menu-profile-picture"
            items={[
                {
                    id: "clear-profile-picture",
                    icon: Shape.Trash,
                    text: "Delete Profile Picture",
                    disabled: $user.profile.photo.image === "",
                    appearance: Appearance.Default,
                    onClick: () => {
                        updateProfilePicture("/0")
                    },
                },
            ]}>
            <div slot="content" let:open on:contextmenu={open} class="profile-picture-container">
                <ProfilePicture id={key} image={$user.profile.photo.image} size={Size.Larger} status={$user.profile.status} frame={$user.profile.photo.frame} noIndicator />
                <FileUploadButton
                    icon
                    tooltip={$_("settings.profile.change_profile_photo")}
                    on:upload={async picture => {
                        await updateProfilePicture(picture.detail)
                    }} />
            </div>
        </ContextMenu>
        <div class="content">
            <div class="section">
                <Label hook="label-settings-profile-username" text={$_("generic.username")} />
                <div class="username-section">
                    <div class="username">
                        <Input
                            hook="input-settings-profile-username"
                            alt
                            bind:value={$user.name}
                            highlight={changeList.username ? Appearance.Warning : Appearance.Default}
                            on:isValid={e => {
                                isValidUsernameToUpdate = e.detail
                            }}
                            rules={CommonInputRules.username}
                            on:enter={async _ => {
                                await updateUsername($user.name)
                                updatePendentItemsToSave()
                            }}
                            on:input={_ => {
                                changeList.username = true
                                unsavedChanges = changeList.username || changeList.statusMessage
                            }} />
                    </div>
                    <ContextMenu
                        hook="context-menu-copy-id"
                        items={[
                            {
                                id: "copy-id",
                                icon: Shape.Users,
                                text: $_("settings.profile.copy_id"),
                                appearance: Appearance.Default,
                                onClick: async () => await copy_did(true),
                            },
                            {
                                id: "copy-did",
                                icon: Shape.Clipboard,
                                text: $_("settings.profile.copy_did"),
                                appearance: Appearance.Default,
                                onClick: async () => await copy_did(false),
                            },
                        ]}>
                        <div slot="content" class="short-id" role="presentation" let:open on:contextmenu={open} on:click={async _ => await copy_did(false)}>
                            <Input hook="input-settings-profile-short-id" alt value={$user.id.short} disabled copyOnInteract>
                                <Icon icon={Shape.Hashtag} alt muted />
                            </Input>
                        </div>
                    </ContextMenu>
                </div>
            </div>
            <div class="section">
                <Label hook="label-settings-profile-status-message" text={$_("user.status_message")} />
                <Input
                    hook="input-settings-profile-status-message"
                    alt
                    bind:value={statusMessage}
                    placeholder={$_("user.set_status_message")}
                    highlight={changeList.statusMessage ? Appearance.Warning : Appearance.Default}
                    on:isValid={e => {
                        isValidStatusMessageToUpdate = e.detail
                    }}
                    rules={CommonInputRules.statusMessage}
                    on:enter={async _ => {
                        await updateStatusMessage(statusMessage)
                        updatePendentItemsToSave()
                    }}
                    on:input={_ => {
                        changeList.statusMessage = true
                        unsavedChanges = changeList.username || changeList.statusMessage
                    }} />
            </div>
            <div class="section">
                <SettingSection hook="section-online-status" name={$_("user.status.label")} description={$_("user.set_status")}>
                    <Select
                        hook="selector-current-status-{$user.profile.status}"
                        options={[
                            { text: $_("user.status.online"), value: "online" },
                            { text: $_("user.status.offline"), value: "offline" },
                            { text: $_("user.status.idle"), value: "idle" },
                            { text: $_("user.status.do_not_disturb"), value: "do-not-disturb" },
                        ]}
                        on:change={async v => {
                            await MultipassStoreInstance.updateStatus(v.detail)
                            Store.addToastNotification(new ToastMessage("", profile_update_txt, 2))
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
                            2
                        }}
                        bind:selected={$user.profile.status}>
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

            <div class="section integrations">
                <Label hook="label-settings-profile-integrations" text={$_("settings.profile.integration.title")} />
                <Text>{$_("settings.profile.integration.description")}</Text>
                <div class="active">
                    {#each $user.integrations as [key, value]}
                        <div class="integration-item">
                            <IntegrationDisplay key={key} value={value} />
                            <Button appearance={Appearance.Alt} icon on:click={() => startEditingIntegration(key, value)}>
                                <Icon icon={Shape.Pencil} />
                            </Button>
                            <Button appearance={Appearance.Error} icon on:click={() => removeIntegration(key)}>
                                <Icon icon={Shape.XMark} />
                            </Button>
                        </div>
                    {/each}
                </div>

                {#if $showEditIntegrations}
                    <Label text={$user.integrations.has(selectedKey) ? $_("settings.profile.integration.editIntegration") : $_("settings.profile.integration.addNew")} />

                    <div class="add">
                        <div class="left">
                            {#if !$user.integrations.has(selectedKey)}
                                <Label text={$_("generic.platform")} />
                                <Select
                                    alt
                                    options={Object.entries(Integrations).map(([key, value]) => ({ value: key, text: value }))}
                                    bind:selected={selectedKind}
                                    on:change={e => {
                                        if (e.detail === Integrations.Generic) {
                                            selectedKey = ""
                                        } else {
                                            selectedKey = selectedKind
                                        }
                                    }} />
                            {/if}
                            {#if selectedKind === Integrations.Generic}
                                <Input alt bind:value={selectedKey} disabled={$user.integrations.has(selectedKey)} />
                            {/if}
                        </div>
                        <img class="integration-logo" src={toIntegrationIconSrc(selectedKey)} alt="Platform Logo" />
                        <div class="right">
                            <Label text={$_("generic.address")} />
                            <Input alt bind:value={selectedKeyEditValue} />
                        </div>

                        <Button text={$user.integrations.has(selectedKey) ? $_("generic.save") : $_("generic.add")} on:click={setIntegration}>
                            <Icon icon={$user.integrations.has(selectedKey) ? Shape.CheckMark : Shape.Plus} />
                        </Button>
                        <Button
                            text={$_("generic.cancel")}
                            appearance={Appearance.Alt}
                            on:click={_ => {
                                resetSelection()
                            }}>
                            <Icon icon={Shape.XMark} />
                        </Button>
                    </div>
                {:else}
                    <Button
                        text={$_("generic.add")}
                        on:click={_ => {
                            startEditingIntegration("", "")
                        }}>
                        <Icon icon={Shape.Plus} />
                    </Button>
                {/if}
            </div>

            <div class="section">
                <SettingSection hook="section-reveal-phrase" name={$_("settings.profile.reveal_phrase.label")} description={$_("settings.profile.reveal_phrase.description")}>
                    <Button
                        hook={!showSeed ? "button-reveal-phrase" : "button-hide-phrase"}
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
                        <Button hook="button-copy-phrase" appearance={Appearance.Alt} text={$_("generic.copy")}>
                            <Icon icon={Shape.Clipboard} />
                        </Button>
                    </div>
                {/if}
            </div>

            <div class="section" data-cy="section-store-recovery-seed">
                <Checkbox hook="checkbox-store-recovery-seed" checked>
                    <Text hook="text-store-recovery-seed" muted>{$_("settings.profile.should_store")}</Text>
                </Checkbox>
            </div>

            <div class="section">
                <SettingSection hook="section-log-out" name={$_("settings.profile.log_out.label")} description={$_("settings.profile.log_out.description")}>
                    <Button
                        hook="button-log-out"
                        appearance={Appearance.Alt}
                        text={$_("settings.profile.log_out.label")}
                        on:click={_ => {
                            logOut()
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
        padding: var(--padding);

        .save-controls {
            z-index: 2;
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
                gap: calc(var(--gap) * 2);
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

            .add {
                width: 100%;
                flex: 1;
                display: inline-flex;
                gap: var(--gap);
                align-items: flex-end;
                background-color: var(--background-alt);
                padding: var(--padding);
                border-radius: var(--border-radius);
                border: var(--border-width) solid var(--primary-color);

                .integration-logo {
                    width: var(--input-height);
                    height: var(--input-height);
                }

                .right {
                    flex: 1;
                }
            }

            .integrations {
                display: inline-flex;
                flex-direction: column;
                align-items: flex-start;

                .integration-item {
                    display: inline-flex;
                    align-items: flex-end;
                    gap: var(--gap);
                }
                .active {
                    flex: 1;
                    display: inline-flex;
                    flex-direction: column;
                    width: 100%;
                    gap: var(--gap);
                }
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
                position: absolute;
                z-index: 2;
                top: calc(256px - (var(--profile-picture-size) * 4 / 2));
                height: calc(var(--profile-picture-size) * 2);
                margin-bottom: calc((var(--profile-picture-size) * 3) * -0.5);
                :global(.button) {
                    position: absolute;
                    bottom: calc(var(--padding-less) * -6.3);
                    right: calc(var(--padding-less) * -1);
                    z-index: 2;
                }
            }

            .profile-header {
                height: 256px;
                background-color: var(--background-alt);
                background-size: cover;
                padding: var(--padding-less);
                width: 100%;
                z-index: 1;
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
