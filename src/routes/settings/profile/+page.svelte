<script lang="ts">
    import { Appearance, Integrations, Route, Shape, Size, Status } from "$lib/enums"

    import { _ } from "svelte-i18n"
    import { SettingSection } from "$lib/layouts"
    import { ProfilePicture, OrderedPhrase, ContextMenu } from "$lib/components"
    import { Button, Icon, Label, Input, Text, Select, Checkbox } from "$lib/elements"
    import { Store } from "$lib/state/Store"
    import type { User } from "$lib/types"
    import FileUploadButton from "$lib/components/ui/FileUploadButton.svelte"
    import Controls from "$lib/layouts/Controls.svelte"
    import { get, writable } from "svelte/store"
    import { goto } from "$app/navigation"
    import { ToastMessage } from "$lib/state/ui/toast"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { onDestroy, onMount } from "svelte"
    import { TesseractStoreInstance } from "$lib/wasm/TesseractStore"
    import { AuthStore } from "$lib/state/auth"
    import { CommonInputRules } from "$lib/utils/CommonInputRules"
    import { compressImageToUpload, MAX_SIZE_IMAGE_TO_UPLOAD_ON_PROFILE } from "$lib/components/utils/CompressImage"
    import IntegrationDisplay from "$lib/components/ui/IntegrationDisplay.svelte"
    import { identityColor, toIntegrationIconSrc, toIntegrationKind } from "$lib/utils/ProfileUtils"
    import { log } from "$lib/utils/Logger"
    import Modal from "$lib/components/ui/Modal.svelte"
    import PinInput from "$lib/components/PinInput.svelte"
    import { isiOSMobile } from "$lib/utils/Mobile"
    import { Keyboard } from "@capacitor/keyboard"
    import type { PluginListenerHandle } from "@capacitor/core"

    enum SeedState {
        Hidden,
        Shown,
        Missing,
    }

    enum DIDCopy {
        DEFAULT,
        SHORT,
        LINK,
    }

    let loading = true
    let isValidUsernameToUpdate = false
    let isValidStatusMessageToUpdate = true
    let seedPhrase = TesseractStoreInstance.fetchSeed()?.split(" ")
    let isDeleteAccountModalOpened = writable(false)
    let wrongPinToDeleteAccountMessage = $_("settings.profile.delete_account_wrong_pin")

    function toggleSeedPhrase() {
        if (showSeed === SeedState.Missing) return
        showSeed = showSeed === SeedState.Hidden ? SeedState.Shown : SeedState.Hidden
        if (loading) setTimeout(() => (loading = false), 200)
    }

    function handleCopyClick() {
        if (!seedPhrase) return
        copyToClipboard(seedPhrase.join(" "))
    }

    function copyToClipboard(text: string) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                log.info("Text copied to clipboard")
            })
            .catch(err => {
                log.info(`Failed to copy text: ${err}`)
            })
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

    // Function to delete IndexedDB database by name
    function deleteIndexedDB(dbName: string) {
        return new Promise<string>((resolve, reject) => {
            const request = indexedDB.deleteDatabase(dbName)

            request.onsuccess = function () {
                console.log(`Database '${dbName}' deleted successfully.`)
                resolve("Success")
            }

            request.onerror = function () {
                console.error(`Failed to delete database '${dbName}':`, request.error)
                reject(request.error)
            }

            request.onblocked = function () {
                console.warn(`Database deletion for '${dbName}' is blocked. Close other tabs that use it and try again.`)
                // Continue even if blocked, but mark as incomplete
                resolve("Blocked")
            }
        })
    }

    // Function to clear all IndexedDB data, localStorage, sessionStorage, and cookies
    async function clearAllData() {
        try {
            // Clear localStorage and sessionStorage first
            localStorage.clear()
            console.log("localStorage cleared.")

            sessionStorage.clear()
            console.log("sessionStorage cleared.")

            // Attempt to delete specific database 'tesseract' and all other IndexedDB databases
            await deleteIndexedDB("tesseract")
            console.log("Database 'tesseract' cleared if it existed.")

            const dbNames = await indexedDB.databases()
            for (let dbInfo of dbNames) {
                if (dbInfo.name) {
                    const result = await deleteIndexedDB(dbInfo.name)
                    if (result === "Blocked") {
                        console.warn(`Could not delete database '${dbInfo.name}' due to blocking issues.`)
                    }
                }
            }
            console.log("All IndexedDB data cleared, where not blocked.")

            // Clear cookies
            document.cookie.split(";").forEach(cookie => {
                const cookieName = cookie.split("=")[0].trim()
                document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
            })
            console.log("Cookies cleared.")

            // Redirect to '/auth' with cache busting to prevent stale cache loading
            window.location.href = "/auth?cacheBust=" + new Date().getTime()
        } catch (error) {
            console.error("Error clearing data:", error)
        }
    }

    $: auth = AuthStore.state
    $: saveSeedPhrase = $auth.saveSeedPhrase
    $: showSeed = seedPhrase ? SeedState.Hidden : SeedState.Missing

    let userReference: User = { ...get(Store.state.user) }
    let statusMessage: string = { ...get(Store.state.user) }.profile.status_message
    let seedWarning = false

    let mobileKeyboardListener: PluginListenerHandle | undefined

    onMount(async () => {
        userReference = { ...get(Store.state.user) }
        statusMessage = { ...get(Store.state.user) }.profile.status_message

        if (isiOSMobile()) {
            mobileKeyboardListener = await Keyboard.addListener("keyboardWillShow", _ => {
                const focusedElement = document.activeElement
                if (focusedElement && (focusedElement.tagName === "INPUT" || focusedElement.tagName === "TEXTAREA")) {
                    setTimeout(() => {
                        focusedElement.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        })
                    }, 100)
                }
            })
        }
    })

    onDestroy(async () => {
        Store.setUsername(userReference.name)
        Store.setStatusMessage(userReference.profile.status_message)
        await mobileKeyboardListener?.remove()
    })

    $: user = Store.state.user
    let key: string = ""
    let activityStatus: Status = Status.Offline

    const userSub = Store.state.user.subscribe(val => {
        let user = val
        statusMessage = user.profile.status_message
        activityStatus = user.profile.status
        key = user.key
    })

    onDestroy(() => {
        Store.setUsername(userReference.name)
        Store.setStatusMessage(userReference.profile.status_message)
        userSub()
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

    async function copy_did(conf: DIDCopy) {
        let user = get(Store.state.user)
        switch (conf) {
            case DIDCopy.DEFAULT: {
                const updatedKey = userReference.key.replace("did:key:", "")
                await navigator.clipboard.writeText(updatedKey)
                break
            }
            case DIDCopy.SHORT: {
                await navigator.clipboard.writeText(`${userReference.name}#${userReference.id.short}`)
                break
            }
            case DIDCopy.LINK: {
                const updatedKey = user.key.replace("did:key:", "")
                await navigator.clipboard.writeText(`${window.location.origin}/friends/add/${updatedKey}`)
            }
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

    function toggleSeedPhraseSave(val: boolean) {
        if (!val && !seedWarning) {
            seedWarning = true
            return false
        } else {
            seedWarning = false
            saveSeedPhrase = val
            AuthStore.setSaveSeedPhrase(val)
            seedPhrase = TesseractStoreInstance.fetchSeed()?.split(" ")
            return true
        }
    }

    async function exportAccount(file?: boolean) {
        let res = await MultipassStoreInstance.exportAccount(file)
        res.onSuccess(memory => {
            if (memory) {
                let blob = new Blob([memory])
                const elem = window.document.createElement("a")
                elem.href = window.URL.createObjectURL(blob)
                elem.download = "export.upk"
                document.body.appendChild(elem)
                elem.click()
                document.body.removeChild(elem)
            } else {
                Store.addToastNotification(new ToastMessage($_("settings.profile.export.success"), "", 2))
            }
        })
        res.onFailure(err => {
            Store.addToastNotification(new ToastMessage($_("settings.profile.export.fail"), err, 2))
        })
    }
</script>

<div id="page">
    {#if seedWarning}
        <Modal on:close={() => (seedWarning = false)}>
            <div class="seed-phrase-modal">
                <Text hook="text-create-description">
                    {$_("settings.profile.seed.remove")}
                </Text>
                <Controls>
                    <Button
                        text={$_("settings.profile.seed.remove.yes")}
                        hook="button-seed-remove-confirm"
                        on:click={_ => {
                            toggleSeedPhraseSave(false)
                        }}
                        appearance={Appearance.Error}>
                        <Icon icon={Shape.CheckMark} />
                    </Button>
                    <Button
                        text={$_("settings.profile.seed.remove.no")}
                        hook="button-seed-remove-cancel"
                        on:click={_ => {
                            seedWarning = false
                        }}
                        appearance={Appearance.Alt}>
                        <Icon icon={Shape.XMark} />
                    </Button>
                </Controls>
            </div>
        </Modal>
    {/if}
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
    <div id="profile" class="profile">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <ContextMenu
            hook="context-menu-banner-picture"
            items={[
                {
                    id: "clear-banner-picture",
                    icon: Shape.Trash,
                    text: $_("settings.profile.deleteBanner"),
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
                    text: $_("settings.profile.deleteProfile"),
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
                                onClick: async () => await copy_did(DIDCopy.SHORT),
                            },
                            {
                                id: "copy-did",
                                icon: Shape.Clipboard,
                                text: $_("settings.profile.copy_did"),
                                appearance: Appearance.Default,
                                onClick: async () => await copy_did(DIDCopy.DEFAULT),
                            },
                            {
                                id: "copy-link",
                                icon: Shape.Clipboard,
                                text: $_("settings.profile.copy_did_link"),
                                appearance: Appearance.Default,
                                onClick: async () => await copy_did(DIDCopy.LINK),
                            },
                        ]}>
                        <div slot="content" class="short-id" role="presentation" let:open on:contextmenu={open} on:click={async _ => await copy_did(DIDCopy.DEFAULT)}>
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

            <div class="section integrations" data-cy="section-account-integrations">
                <Label hook="label-settings-profile-integrations" text={$_("settings.profile.integration.title")} />
                <Text hook="text-settings-profile-integrations">{$_("settings.profile.integration.description")}</Text>
                <div class="active">
                    {#each $user.integrations as [key, value]}
                        <div class="integration-item">
                            <IntegrationDisplay key={key} value={value} />
                            <Button hook="button-account-integrations-item-edit" appearance={Appearance.Alt} icon on:click={() => startEditingIntegration(key, value)}>
                                <Icon icon={Shape.Pencil} />
                            </Button>
                            <Button hook="button-account-integrations-item-delete" appearance={Appearance.Error} icon on:click={() => removeIntegration(key)}>
                                <Icon icon={Shape.XMark} />
                            </Button>
                        </div>
                    {/each}
                </div>

                {#if $showEditIntegrations}
                    <Label hook="label-account-integrations-new" text={$user.integrations.has(selectedKey) ? $_("settings.profile.integration.editIntegration") : $_("settings.profile.integration.addNew")} />

                    <div class="add">
                        <div class="left">
                            {#if !$user.integrations.has(selectedKey)}
                                <Label hook="label-account-integrations-new-platform" text={$_("generic.platform")} />
                                <Select
                                    hook="selector-account-integrations-new-platform"
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
                        </div>
                        <img class="integration-logo" data-cy="logo-account-integrations-new" src={toIntegrationIconSrc(selectedKey)} alt="Platform Logo" />
                        {#if selectedKind === Integrations.Generic}
                            <div class="label">
                                <Label hook="label-account-integration-new-address" text={$_("generic.label")} />
                                <Input hook="input-account-integrations-new-generic" alt bind:value={selectedKey} disabled={$user.integrations.has(selectedKey)} />
                            </div>
                        {/if}
                        <div class="right">
                            <Label hook="label-account-integration-new-address" text={$_("generic.address")} />
                            <Input hook="input-account-integrations-new-address" alt bind:value={selectedKeyEditValue} />
                        </div>

                        <Button hook="button-account-integrations-new-add" text={$user.integrations.has(selectedKey) ? $_("generic.save") : $_("generic.add")} on:click={setIntegration}>
                            <Icon icon={$user.integrations.has(selectedKey) ? Shape.CheckMark : Shape.Plus} />
                        </Button>
                        <Button
                            hook="button-account-integrations-new-cancel"
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
                        hook="button-integrations-add"
                        text={$_("generic.add")}
                        appearance={Appearance.Primary}
                        on:click={_ => {
                            startEditingIntegration("", "")
                        }}>
                        <Icon icon={Shape.Plus} alt />
                    </Button>
                {/if}
            </div>

            <div class="section">
                <SettingSection
                    hook="section-reveal-phrase"
                    name={$_("settings.profile.reveal_phrase.label")}
                    description={showSeed !== SeedState.Missing ? $_("settings.profile.reveal_phrase.description") : $_("settings.profile.reveal_phrase.description.missing")}>
                    <Button
                        hook={showSeed === SeedState.Hidden ? "button-reveal-phrase" : showSeed === SeedState.Shown ? "button-hide-phrase" : "button-missing-phrase"}
                        appearance={showSeed === SeedState.Hidden || showSeed === SeedState.Missing ? Appearance.Error : Appearance.Alt}
                        text={showSeed === SeedState.Hidden ? $_("settings.profile.reveal_phrase.show") : showSeed === SeedState.Shown ? $_("settings.profile.reveal_phrase.hide") : $_("settings.profile.reveal_phrase.missing")}
                        disabled={showSeed === SeedState.Missing}
                        on:click={_ => {
                            toggleSeedPhrase()
                        }}>
                        <Icon icon={showSeed ? Shape.EyeSlash : Shape.Eye} />
                    </Button>
                </SettingSection>
                {#if showSeed === SeedState.Shown && seedPhrase}
                    {#each seedPhrase as word, i}
                        <OrderedPhrase number={i + 1} word={word} loading={loading} />
                    {/each}
                    <div class="full-width flex-end">
                        <Button hook="button-copy-phrase" appearance={Appearance.Alt} text={$_("generic.copy")} on:click={handleCopyClick}>
                            <Icon icon={Shape.Clipboard} />
                        </Button>
                    </div>
                {/if}
            </div>
            {#if showSeed !== SeedState.Missing}
                <div class="section" data-cy="section-store-recovery-seed">
                    <Checkbox hook="checkbox-store-recovery-seed" checked={saveSeedPhrase} disabled={seedPhrase === undefined} onToggle={e => toggleSeedPhraseSave(e)}>
                        <Text hook="text-store-recovery-seed" muted>{$_("settings.profile.should_store")}</Text>
                    </Checkbox>
                </div>
            {/if}
            <div class="section">
                <SettingSection hook="export-account" name={$_("settings.profile.export.label")} description={$_("settings.profile.export.description")}>
                 <!---   <Button
                        hook="export-account-remote"
                        appearance={Appearance.Alt}
                        text={$_("settings.profile.export.remote")}
                        on:click={async _ => {
                            await exportAccount()
                        }}>
                        <Icon icon={Shape.Globe} />
                    </Button> --->
                    <Button
                        hook="export-account-file"
                        appearance={Appearance.Alt}
                        text={$_("settings.profile.export.file")}
                        on:click={async _ => {
                            await exportAccount(true)
                        }}>
                        <Icon icon={Shape.Document} />
                    </Button>
                </SettingSection>
            </div>
            <div class="section">
                <SettingSection hook="section-support" name={$_("settings.profile.support.label")} description={$_("settings.profile.support.description")}>
                    <a href="mailto:support@satellite.im">
                        <Button hook="button-support" appearance={Appearance.Alt} text={$_("settings.profile.support.button")}>
                            <Icon icon={Shape.Email} />
                        </Button>
                    </a>
                </SettingSection>
            </div>

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
        <SettingSection hook="section-delete-account" name={$_("settings.profile.delete_title")} description={$_("settings.profile.delete_subtitle")}>
            <Button
                hook="button-delete-account"
                appearance={Appearance.Error}
                text={$_("settings.profile.delete_title")}
                on:click={_ => {
                    isDeleteAccountModalOpened.set(true)
                }}>
                <Icon icon={Shape.Trash} />
            </Button>
        </SettingSection>
    </div>
    {#if $isDeleteAccountModalOpened}
        <Modal
            on:close={_ => {
                isDeleteAccountModalOpened.set(false)
            }}>
            <div class="delete-account-pin">
                <Text hook="text-delete-account-pin-first-message" class="delete-account-pin-first-message" appearance={Appearance.Error}>
                    {$_("settings.profile.delete_account_action_description")}
                </Text>
                <Text>
                    {$_("settings.profile.delete_account_confirm_pin")}
                </Text>
                <PinInput
                    min={4}
                    max={8}
                    loading={false}
                    scramble={false}
                    stayLoggedIn={false}
                    showSettings={false}
                    showButtonSettings={false}
                    on:submit={async e => {
                        let pin = e.detail
                        await new Promise(async _ => {
                            let result = await TesseractStoreInstance.unlock(pin)
                            result.onFailure(_ => {
                                Store.addToastNotification(new ToastMessage("", wrongPinToDeleteAccountMessage, 3))
                            })
                            result.onSuccess(async _ => {
                                await clearAllData()
                            })
                        })
                    }} />
            </div>
        </Modal>
    {/if}
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
        .seed-phrase-modal {
            display: flex;
            flex-direction: column;
            width: var(--max-component-width);
            overflow: hidden;
            align-items: center;
            gap: var(--gap);
            padding: var(--padding);
        }

        .delete-account-pin {
            display: flex;
            flex-direction: column;
            gap: var(--gap);
            align-items: center;
            padding: var(--padding);
        }
    }
</style>
