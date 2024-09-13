<script lang="ts">
    import Label from "$lib/elements/Label.svelte"
    import SettingSection from "$lib/layouts/SettingSection.svelte"
    import Switch from "$lib/elements/Switch.svelte"
    import Input from "$lib/elements/Input/Input.svelte"
    import Spacer from "$lib/elements/Spacer.svelte"
    import { _ } from "svelte-i18n"
    import { ProfilePicture } from ".."
    import FileUploadButton from "../ui/FileUploadButton.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import type { Chat } from "$lib/types"
    import Controls from "$lib/layouts/Controls.svelte"
    import Button from "$lib/elements/Button.svelte"
    import { Icon } from "$lib/elements"
    import { createEventDispatcher, onMount } from "svelte"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import { get } from "svelte/store"
    import { Store } from "$lib/state/Store"

    export let activeChat: Chat
    let groupChatOriginal = structuredClone(activeChat)
    let groupChatToBeChanged = structuredClone(activeChat)

    let unsavedChanges = false
    let shakeSaveControls = false
    let groupPicture = ""
    let user = get(Store.state.user)
    let isAdmin = groupChatToBeChanged.creator !== undefined ? groupChatToBeChanged.creator === user.key : false

    $: {
        unsavedChanges = Object.values(propertiesChangedList).some(value => value)
        shakeSaveControls = unsavedChanges
        onUnasavedChanges(unsavedChanges)
    }

    let propertiesChangedList = {
        groupName: false,
        pictureChanged: false,
        addMembersSwitch: false,
        changeDetailsSwitch: false,
        allowOtherToChangePictureSwitch: false,
    }

    const dispatch = createEventDispatcher()
    function onUnasavedChanges(value: boolean) {
        dispatch("unasavedChanges", value)
    }

    function onCancelChanges() {
        groupChatToBeChanged = structuredClone(groupChatOriginal)
        propertiesChangedList = {
            groupName: false,
            pictureChanged: false,
            addMembersSwitch: false,
            changeDetailsSwitch: false,
            allowOtherToChangePictureSwitch: false,
        }
        dispatch("close", _)
    }

    function onSaveChanges() {
        groupChatOriginal = structuredClone(groupChatToBeChanged)
        if (propertiesChangedList.groupName) {
            RaygunStoreInstance.updateConversationName(groupChatToBeChanged.id, groupChatToBeChanged.name)
        }
        if (propertiesChangedList.addMembersSwitch || propertiesChangedList.changeDetailsSwitch || propertiesChangedList.allowOtherToChangePictureSwitch) {
            RaygunStoreInstance.updateConversationSettings(groupChatToBeChanged.id, {
                group: {
                    members_can_add_participants: groupChatToBeChanged.settings.permissions.allowAnyoneToAddUsers,
                    members_can_change_photo: groupChatToBeChanged.settings.permissions.allowAnyoneToModifyPhoto,
                    members_can_change_name: groupChatToBeChanged.settings.permissions.allowAnyoneToModifyName,
                },
            })
        }
        propertiesChangedList = {
            groupName: false,
            pictureChanged: false,
            addMembersSwitch: false,
            changeDetailsSwitch: false,
            allowOtherToChangePictureSwitch: false,
        }
        unsavedChanges = false
        dispatch("close", _)
    }

    function handleClickOutside() {
        if (unsavedChanges) {
            shakeSaveControls = false
            setTimeout(() => {
                shakeSaveControls = true
            }, 50)
        }
    }

    onMount(() => {
        window.addEventListener("click", handleClickOutside)
    })
</script>

<div class="settings">
    <Label text={$_("chat.group.settings.photo")} />
    <div class="profile-picture-container">
        <ProfilePicture noIndicator image={groupPicture} size={Size.Large} />
        <FileUploadButton
            icon
            disabled={!isAdmin}
            tooltip={$_("chat.group.settings.photo")}
            on:upload={async picture => {
                /// TODO(Lucas): It is not implemented in warp yet
                groupPicture = picture.detail
                propertiesChangedList.pictureChanged = true
            }} />
    </div>
    <Label text={$_("chat.group.settings.name")} />
    <Input
        bind:value={groupChatToBeChanged.name}
        disabled={!isAdmin}
        on:input={_ => {
            propertiesChangedList.groupName = groupChatToBeChanged.name !== groupChatOriginal.name
        }} />
    <Label text={$_("chat.group.settings.description")} />
    <Input disabled={!isAdmin} value={$_("chat.group.settings.description.placeholder")} />
    <Spacer />
    <Label text={$_("generic.settings")} />
    <SettingSection name={$_("chat.group.settings.add")} description={$_("chat.group.settings.add.description")}>
        <Switch
            on={groupChatToBeChanged.settings.permissions.allowAnyoneToAddUsers}
            disabled={!isAdmin}
            on:toggle={_ => {
                groupChatToBeChanged.settings.permissions.allowAnyoneToAddUsers = !groupChatToBeChanged.settings.permissions.allowAnyoneToAddUsers
                propertiesChangedList.addMembersSwitch = groupChatToBeChanged.settings.permissions.allowAnyoneToAddUsers !== groupChatOriginal.settings.permissions.allowAnyoneToAddUsers
            }} />
    </SettingSection>
    <SettingSection name={$_("chat.group.settings.details")} description={$_("chat.group.settings.details.description")}>
        <Switch
            on={groupChatToBeChanged.settings.permissions.allowAnyoneToModifyName}
            disabled={!isAdmin}
            on:toggle={_ => {
                groupChatToBeChanged.settings.permissions.allowAnyoneToModifyName = !groupChatToBeChanged.settings.permissions.allowAnyoneToModifyName
                propertiesChangedList.changeDetailsSwitch = groupChatToBeChanged.settings.permissions.allowAnyoneToModifyName !== groupChatOriginal.settings.permissions.allowAnyoneToModifyName
            }} />
    </SettingSection>
    <SettingSection name={$_("chat.group.settings.photo")} description={$_("chat.group.settings.photo.description")}>
        <Switch
            on={groupChatToBeChanged.settings.permissions.allowAnyoneToModifyPhoto}
            disabled={!isAdmin}
            on:toggle={_ => {
                groupChatToBeChanged.settings.permissions.allowAnyoneToModifyPhoto = !groupChatToBeChanged.settings.permissions.allowAnyoneToModifyPhoto
                propertiesChangedList.changeDetailsSwitch = groupChatToBeChanged.settings.permissions.allowAnyoneToModifyName !== groupChatOriginal.settings.permissions.allowAnyoneToModifyName
            }} />
    </SettingSection>
    {#if unsavedChanges}
        <div class={`save-controls ${shakeSaveControls ? "shake" : ""}`} data-cy="save-controls">
            <Controls>
                <Button
                    hook="button-cancel"
                    text={$_("generic.cancel")}
                    appearance={Appearance.Alt}
                    on:click={_ => {
                        onCancelChanges()
                    }}>
                    <Icon icon={Shape.XMark} />
                </Button>
                <Button
                    hook="button-save"
                    text={$_("generic.save")}
                    appearance={Appearance.Primary}
                    on:click={async _ => {
                        onSaveChanges()
                    }}>
                    <Icon icon={Shape.CheckMark} />
                </Button>
            </Controls>
        </div>
    {/if}
</div>

<style lang="scss">
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

    @keyframes shake {
        0% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-10px);
        }
        50% {
            transform: translateX(10px);
        }
        75% {
            transform: translateX(-10px);
        }
        100% {
            transform: translateX(0);
        }
    }

    .shake {
        animation: shake 0.5s ease;
    }

    .settings {
        display: inline-flex;
        flex-direction: column;
        padding: var(--padding);
        gap: var(--gap);

        .profile-picture-container {
            position: relative;
            width: fit-content;

            :global(.button) {
                position: absolute;
                bottom: calc(var(--padding-less) * -0.5);
                right: calc(var(--padding-less) * -0.5);
                z-index: 2;
            }
        }
    }
</style>
