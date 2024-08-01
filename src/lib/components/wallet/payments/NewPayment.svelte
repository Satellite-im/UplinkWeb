<script lang="ts">
    import { Appearance, Shape, Size } from "$lib/enums"
    import type { User } from "$lib/types"
    import { ProfilePicture, ProgressBar } from "$lib/components"
    import { Button, Checkbox, Icon, Input, Label } from "$lib/elements"
    import Text from "$lib/elements/Text.svelte"
    import { _ } from "svelte-i18n"

    export let recipients: Array<User> = []
    export let embedded: boolean = false
    let selected_recipients: Array<User> = []

    let update_recipients = function (recipient: User) {
        let new_recipient_list = selected_recipients

        if (selected_recipients.includes(recipient)) {
            new_recipient_list.splice(new_recipient_list.indexOf(recipient), 1)
        } else {
            new_recipient_list.push(recipient)
        }

        selected_recipients = new_recipient_list
    }

    function contains_recipient(list: User[], recipient: User): boolean {
        return list.includes(recipient)
    }
</script>

<div class="payment" id="payment">
    <div class="payment-amount">
        <input class="custom-input" type="number" min="0.01" step="0.01" value="0.00" placeholder="0.00" max="999,999.99" />
    </div>
    <div class="payment-note">
        <Input alt placeholder={$_("payments.notePlaceholder")} class="flex" />
    </div>
    <div class="select-recipient">
        <Label text={$_("payments.recipients")} />
        <div class="recipient-list">
            {#each selected_recipients as recipient}
                <div class="mini-recipient">
                    <ProfilePicture size={Size.Smallest} image={recipient.profile.photo.image} />
                    <Text singleLine size={Size.Small} appearance={Appearance.Alt}>
                        {recipient.name}
                    </Text>
                    <Icon icon={Shape.XMark} alt class="control" />
                </div>
            {/each}
        </div>
        <Label text={$_("payments.selectRecipients")} />
        <div class="recipient-selection-list {embedded ? 'embedded' : ''}">
            {#each recipients as recipient}
                <button class="recipient" on:click={() => update_recipients(recipient)}>
                    <ProfilePicture size={Size.Small} image={recipient.profile.photo.image} status={recipient.profile.status} />
                    <div class="info">
                        <Text singleLine size={Size.Medium}>
                            {recipient.name}
                        </Text>
                        <Text singleLine muted>
                            {recipient.key}
                        </Text>
                    </div>
                    <Checkbox checked={contains_recipient(selected_recipients, recipient)} />
                </button>
            {/each}
        </div>
    </div>
    <div class="payment-controls">
        <ProgressBar label={$_("generic.hold", { values: { number: 3 } })} />

        <div class="buttons">
            <Button appearance={Appearance.Success} text={$_("generic.confirm")} outline class="flex" />
            <Button appearance={Appearance.Alt} text={$_("generic.cancel")} class="flex" />
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
        width: 100%;
        height: fit-content;
        position: relative;
        justify-content: center;
        flex: 1;

        .payment-amount {
            display: inline-flex;
            flex-direction: row;
            justify-content: space-evenly;
            align-items: center;
            color: var(--success-color);
            width: 100%;

            .custom-input {
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

                &[type="number"] {
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
                    font-size: var(--font-size-smaller);
                    border: var(--border-width) solid var(--info-color);
                    height: fit-content;
                }
            }

            .recipient-selection-list {
                display: inline-flex;
                flex-direction: column;
                gap: var(--gap);
                height: var(--min-scrollable-height);
                overflow-y: auto;
                overflow-x: hidden;
                padding-right: var(--padding-less);

                &.embedded {
                    flex: 1;
                    padding-right: unset;
                }
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

                :global(input[type="checkbox"]:checked::after) {
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
