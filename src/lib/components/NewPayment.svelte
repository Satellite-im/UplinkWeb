<script lang="ts">
    import Button from "$lib/elements/Button.svelte";
    import Checkbox from "$lib/elements/Checkbox.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import Input from "$lib/elements/Input.svelte";
    import Label from "$lib/elements/Label.svelte";
    import { Appearance, Shape, Size } from "$lib/enums";
    import type { User } from "$lib/types";
    import PaymentSuccessSplash from "./PaymentSuccessSplash.svelte";
    import ProfilePicture from "./ProfilePicture.svelte";
    import ProgressBar from "./ProgressBar.svelte";

    export let recipients: Array<User> = [];

    let selected_recipients: Array<User> = [];

    let update_recipients = function(recipient: User) {
        let new_recipient_list = selected_recipients;

        if (selected_recipients.includes(recipient)) {
            new_recipient_list.splice(new_recipient_list.indexOf(recipient), 1);
        } else {
            new_recipient_list.push(recipient);
        }

        selected_recipients = new_recipient_list;
    };

    function contains_recipient(list: User[], recipient: User): boolean {
        return list.includes(recipient);
    }
</script>

<div class="payment" id="payment">
    <div class="payment-amount">
        <input class="custom-input" type="number" min="0.01" step="0.01" value="0.00" placeholder="0.00" max="999,999.99" />
    </div>
    <div class="payment-note">
        <Input alt placeholder="Add a note..." class="flex" />
    </div>
    <div class="select-recipient">
        <Label text="Recipients:" />
        <div class="recipient-list">
            {#each selected_recipients as recipient}
                <div class="mini-recipient">
                    <ProfilePicture 
                        size={Size.Smallest}
                        image={recipient.profile.photo.image} />
                    <p
                        class="username hover-text"
                        data-hover-text={recipient.name}>
                        {recipient.name}
                    </p>
                    <Icon
                        icon={Shape.XMark}
                        class="control" />
                </div>
            {/each}
        </div>
        <Label text="Select recipient(s)" />
        <div class="recipient-selection-list">
            {#each recipients as recipient}
                <button
                    class="recipient" 
                    on:click={() => update_recipients(recipient)}>
                    <ProfilePicture 
                        image={recipient.profile.photo.image}
                        status={recipient.profile.status} />
                    <div class="info">
                        <p class="username">
                            {recipient.name}
                        </p>
                        <p class="subtext text-muted hover-text" data-hover-text={recipient.key}>
                            {recipient.key}
                        </p>
                    </div>
                    <Checkbox checked={contains_recipient(selected_recipients, recipient)} />
                </button>
            {/each}
        </div>
    </div>
    <div class="payment-controls">
        <ProgressBar label={`Hold for ${3} seconds...`} />
        
        <div class="buttons">
            <Button 
                appearance={Appearance.Success}
                text="Confirm"
                class="flex" />
            <Button
                appearance={Appearance.Alt}
                text="Cancel"
                class="flex" />
        </div>
    </div>
    <!--
        <PaymentSuccessSplash />
    -->
</div>

<style lang="scss">
    .payment {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        padding: var(--padding);
        border: var(--border-width) solid var(--border-color);
        border-radius: var(--border-radius);
        width: 100%;
        height: fit-content;
        position: relative;
        justify-content: center;

        .payment-amount {
            display: inline-flex;
            flex-direction: row;
            justify-content: space-evenly;
            align-items: center;
            color: var(--success-color);
            width: 100%;

            .custom-input {
                font-family: "Secondary";
                font-size: var(--font-size-max);
                color: var(--success-color);
                background-color: transparent;
                border: none;
                outline: none;
                width: 100%;
                text-align: center;

                &::-webkit-outer-spin-button,
                &::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                &[type=number] {
                    -moz-appearance: textfield;
                    appearance: textfield;
                }
            }
        }

        .select-recipient {
            min-height: fit-content;
            flex: 1;
            border: var(--border-width) solid var(--border-color);
            border-radius: var(--border-radius-less);
            padding: var(--gap);
            gap: var(--gap);
            display: inline-flex;
            flex-direction: column;
            overflow-y: scroll;
            overflow-x: hidden;
            position: relative;
            user-select: none;

            .recipient-list {
                display: inline-flex;
                flex-wrap: wrap;
                gap: var(--gap-less);
                background-color: var(--alt-color);
                padding: var(--padding-less);
                border-radius: var(--border-radius);
                border: var(--border-width) solid var(--border-color);
                height: fit-content;
                min-height: var(--input-height);

                .mini-recipient {
                    display: inline-flex;
                    gap: var(--gap-less);
                    align-items: center;
                    background-color: var(--info-color);
                    color: var(--color-alt);
                    padding-right: var(--padding-less);
                    border-radius: var(--border-radius-more);
                    max-width: 150px;
                    font-size: var(--font-size);
                    border: var(--border-width) solid var(--info-color);
                    height: fit-content;

                    .username {
                        font-size: var(--font-size-smaller);
                        margin: 0;
                        padding: 0;
                        font-size: var(--font-size-smaller);
                    }
                }
            }

            .recipient-selection-list {
                display: inline-flex;
                flex-direction: column;
                gap: var(--gap);
                padding-right: var(--padding-less);
                height: var(--min-scrollable-height);
                overflow-y: scroll;
                overflow-x: hidden;
            }

            .recipient {
                display: inline-flex;
                gap: var(--gap);
                padding: var(--padding-less);
                padding-right: var(--padding);
                border-radius: var(--border-radius);
                border: var(--border-width) solid var(--border-radius);
                align-items: center;
                width: 100%;
                background-color: var(--alt-color);
                user-select: none;
                position: relative;
                color: var(--color);
                text-align: left;
                cursor: pointer;

                :global(input[type=checkbox]:checked::after) {
                    content: "";
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    position: absolute;
                    border-radius: var(--border-radius);
                    border: var(--border-width) solid var(--info-color);
                    pointer-events: none;
                }

                &:hover {
                    background-color: var(--alt-color-alt);
                }

                .info {
                    display: inline-flex;
                    flex-direction: column;
                    flex: 1;
                    justify-content: center;
                    overflow: hidden;
                    pointer-events: none;
                    user-select: none;
                }
            }
        }

        .payment-controls {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap-less);

            .buttons {
                display: inline-flex;
            }
        }
    }

</style>