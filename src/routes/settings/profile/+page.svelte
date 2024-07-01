<script lang="ts">
    import { Appearance, Route, Shape, Size, Status } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { SettingSection } from "$lib/layouts"
    import { ProfilePicture, OrderedPhrase, ContextMenu } from "$lib/components"
    import { Button, Icon, Label, Input, Text, Select, Checkbox } from "$lib/elements"
    import { Store } from "$lib/state/Store"
    import type { User } from "$lib/types"
    import FileUploadButton from "$lib/components/ui/FileUploadButton.svelte"
    import Controls from "$lib/layouts/Controls.svelte"
    import { get } from "svelte/store"
    import { goto } from "$app/navigation"
    import { ToastMessage } from "$lib/state/ui/toast"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { onDestroy, onMount } from "svelte"
    import { TesseractStoreInstance } from "$lib/wasm/TesseractStore"
    import { AuthStore } from "$lib/state/auth"
    import { log } from "$lib/utils/Logger"

    initLocale()

    let loading = true
    let showSeed = false
    let maxSize = 2097152
    let maxDimension = 1024
    
    function toggleSeedPhrase() {
        showSeed = !showSeed
        if (loading) setTimeout(() => (loading = false), 200)
    }

    async function logOut() {
        AuthStore.setStayLogged(false)
        await TesseractStoreInstance.lock()
        goto(Route.Unlock)
    }

    async function updateProfilePicture(picture: string) {
        await MultipassStoreInstance.updateProfilePhoto(picture)
        Store.setPhoto(picture)
    }

    async function handleBase64Image(imageBase64: string, isProfilePicture: boolean) {
        const blob = base64ToBlob(imageBase64)

        if (blob.size > maxSize) {
            log.debug(`Image size too large (${blob.size} bytes), resizing it to upload.`)
            await resizeImage(imageBase64, isProfilePicture)
        } else {
            if (isProfilePicture) {
                await updateProfilePicture(imageBase64)
            } else {
                await MultipassStoreInstance.updateBannerPicture(imageBase64)
            }
        }
    } 

    async function resizeImage(base64: string, isProfilePicture: boolean) {
        const img = new Image()
        img.onload = async ()  => {
            let quality = 1
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            let width = img.width
            let height = img.height
            
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round(height * maxDimension / width)
                    width = maxDimension
                } else {
                    width = Math.round(width * maxDimension / height)
                    height = maxDimension
                }
            }

            canvas.width = width
            canvas.height = height
            ctx?.drawImage(img, 0, 0, width, height)

            let mimeType = base64.split(',')[0].split(':')[1].split(';')[0]
            let resizedBase64 = canvas.toDataURL(mimeType, 1)
            let resizedBlob = base64ToBlob(resizedBase64)

            while (resizedBlob.size > maxSize && quality > 0.5) {
                    quality -= 0.1
                    const tempImg = new Image();
                    tempImg.onload = async () => {
                        canvas.width = tempImg.width
                        canvas.height = tempImg.height
                        ctx?.drawImage(tempImg, 0, 0, tempImg.width, tempImg.height)
                        resizedBase64 = canvas.toDataURL(mimeType, quality)
                        resizedBlob = base64ToBlob(resizedBase64)
                        if (resizedBlob.size <= maxSize) {  
                            log.debug(`Resized image size: ${resizedBlob.size} bytes`)
                            if (isProfilePicture) {
                                await updateProfilePicture(resizedBase64)
                            } else {
                                await MultipassStoreInstance.updateBannerPicture(resizedBase64)
                            }
                            Store.addToastNotification(new ToastMessage("", "The image size was too large. It has been reduced to fit the upload requirements.", 4))
                        } else {
                            log.debug(`Try with new image. ${quality}`)
                            tempImg.src = resizedBase64
                        }
                }
                tempImg.src = resizedBase64
                resizedBlob = base64ToBlob(resizedBase64)
                log.debug(`Resized image size: ${resizedBlob.size} bytes. ARRIVED HERE.`)
                if (resizedBlob.size <= maxSize || quality <= 0.5) {
                    break
                }
            }
        }
        img.src = base64
    }


  function base64ToBlob(base64: string): Blob {
        const byteString = atob(base64.split(',')[1])
        const arrayBuffer = new ArrayBuffer(byteString.length)
        const uint8Array = new Uint8Array(arrayBuffer)
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i)
        }
        const mimeType = base64.split(',')[0].split(':')[1].split(';')[0]
        return new Blob([arrayBuffer], { type: mimeType })
  }

    async function updateUsername(newUsername: string) {
        userReference.name = newUsername
        Store.setUsername(newUsername)
        await MultipassStoreInstance.updateUsername(newUsername)
        Store.addToastNotification(new ToastMessage("", profile_update_txt, 2))
    }

    async function updateStatusMessage(newStatusMessage: string) {
        userReference.profile.status_message = newStatusMessage
        Store.setStatusMessage(newStatusMessage)
        await MultipassStoreInstance.updateStatusMessage(newStatusMessage)
        Store.addToastNotification(new ToastMessage("", profile_update_txt, 2))
    }

    function updatePendentItemsToSave() {
        changeList.username = false
        changeList.statusMessage = false

        unsavedChanges = changeList.username || changeList.statusMessage
    }

    let samplePhrase = "agree alarm acid actual actress acid album admit absurd adjust adjust air".split(" ")

    let userReference: User
    let statusMessage: string

    onMount(() => {
        userReference = { ...get(Store.state.user) }
        statusMessage = userReference.profile.status_message
    })

    onDestroy(() => {
        Store.setUsername(userReference.name)
        Store.setStatusMessage(userReference.profile.status_message)
    })

    let user: User = get(Store.state.user)
    let activityStatus: Status = user.profile.status

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
        reader.onload = async e => {
            let imageString = e.target?.result?.toString()
            await handleBase64Image(imageString || "", false)
            Store.setBanner(imageString || "")
        }
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
                    appearance={Appearance.Primary}
                    on:click={async _ => {
                        await updateUsername(user.name)
                        await updateStatusMessage(statusMessage)
                        updatePendentItemsToSave()
                        Store.addToastNotification(new ToastMessage("", profile_update_txt, 2))
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
        <div
            class="profile-header"
            data-cy="profile-banner"
            style="background-image: url('{user.profile.banner.image}')"
            on:click={_ => {
                fileinput.click()
            }}>
        </div>

        <div class="profile-picture-container">
            <ProfilePicture hook="profile-picture" image={user.profile.photo.image} size={Size.Large} status={user.profile.status} frame={user.profile.photo.frame} noIndicator />
            <FileUploadButton
                icon
                tooltip={$_("settings.profile.change_profile_photo")}
                on:upload={async picture => {
                    await handleBase64Image(picture.detail, true)
                }} />
        </div>

        <input style="display:none" type="file" accept={acceptableFiles} on:change={e => onFileSelected(e)} bind:this={fileinput} />

        <div class="content">
            <div class="section">
                <Label hook="label-settings-profile-username" text={$_("generic.username")} />
                <div class="username-section">
                    <div class="username">
                        <Input
                            hook="input-settings-profile-username"
                            alt
                            bind:value={user.name}
                            highlight={changeList.username ? Appearance.Warning : Appearance.Default}
                            on:enter={async _ => {
                                await updateUsername(user.name)
                                updatePendentItemsToSave()
                            }}
                            on:input={_ => {
                                changeList.username = true
                                unsavedChanges = changeList.username || changeList.statusMessage
                            }} />
                    </div>
                    <ContextMenu
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
                        <div slot="content" class="short-id" role="presentation" let:open on:contextmenu={open} on:click={async _ => await copy_did(true)}>
                            <Input hook="input-settings-profile-short-id" alt value={user.id.short} disabled copyOnInteract>
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
                        hook="selector-current-status-{user.profile.status}"
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
                            Store.addToastNotification(new ToastMessage("", profile_update_txt, 2))
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
