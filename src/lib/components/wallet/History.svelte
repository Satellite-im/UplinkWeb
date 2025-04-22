<script lang="ts">
    import { Icon } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import Label from "$lib/elements/Label.svelte"
    import Text from "$lib/elements/Text.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { mock_users } from "$lib/mock/users"
    import type { Transaction, User } from "$lib/types"
    import { createEventDispatcher } from "svelte"

    const dispatch = createEventDispatcher()

    function handleCloseHistory() {
        dispatch("close")
    }

    function getName(user: User) {
        return user === mock_user ? "You" : user.name
    }

    function getArrowAppearance(transaction: Transaction) {
        return transaction.from === mock_user ? Appearance.Error : Appearance.Success
    }

    let mockHistory: Transaction[] = [
        {
            at: new Date(),
            amount: 11111,
            currency: {
                name: "Starlight",
                icon: Shape.Starlight,
                balance: 0,
                address: "",
                enabled: true,
            },
            from: mock_users[0],
            to: mock_users[2],
            note: null,
        },
        {
            at: new Date(),
            amount: 23456,
            currency: {
                name: "Ethereum",
                icon: Shape.Ethereum,
                balance: 0,
                address: "",
                enabled: true,
            },
            from: mock_users[2],
            to: mock_users[0],
            note: "Pizza 🍕",
        },
        {
            at: new Date(),
            amount: 300,
            currency: {
                name: "Bitcoin",
                icon: Shape.Bitcoin,
                balance: 0,
                address: "",
                enabled: true,
            },
            from: mock_users[3],
            to: mock_users[0],
            note: null,
        },
        {
            at: new Date(),
            amount: 400,
            currency: {
                name: "Starlight",
                icon: Shape.Starlight,
                balance: 0,
                address: "",
                enabled: true,
            },
            from: mock_users[0],
            to: mock_users[1],
            note: null,
        },
        {
            at: new Date(),
            amount: 12345,
            currency: {
                name: "Starlight",
                icon: Shape.Starlight,
                balance: 0,
                address: "",
                enabled: true,
            },
            from: mock_users[0],
            to: mock_users[3],
            note: null,
        },
    ]

    let mock_user: User = mock_users[0]
</script>

<div class="history">
    <div class="toolbar">
        <Label text="Transaction History" />
        <Button appearance={Appearance.Alt} icon small on:click={handleCloseHistory}>
            <Icon icon={Shape.XMark} />
        </Button>
    </div>

    <div class="transaction">
        {#each mockHistory as transaction}
            <div class="transaction-item">
                <div>
                    <Label text={transaction.currency.name} />
                    <div class="transaction-amount">
                        <Icon icon={transaction.currency.icon} muted size={Size.Large} />
                        <Text size={Size.Large}>{transaction.amount}</Text>
                    </div>
                </div>

                <div class="body">
                    <div class="transaction-members">
                        <Text>{getName(transaction.from)}</Text>
                        <Icon icon={Shape.ArrowRight} highlight={getArrowAppearance(transaction)} />
                        <Text>{getName(transaction.to)}</Text>
                    </div>
                    <div class="transaction-date">
                        <Text muted size={Size.Smaller}>{transaction.at.toLocaleString()}</Text>
                    </div>
                </div>

                {#if transaction.note}
                    <div class="transaction-note">
                        <Label text="Note" />
                        {transaction.note}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    .history {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: absolute;
        height: 100%;
        width: 100%;
        background: var(--opaque-color);
        backdrop-filter: blur(var(--blur-radius));
        z-index: 2;
        top: 0;
        left: 0;
        border-radius: var(--border-radius);
        padding: var(--padding);

        .toolbar {
            display: inline-flex;
            justify-content: space-between;
            width: 100%;
            align-items: center;
        }

        .transaction {
            flex: 1;
            width: 100%;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            padding-right: var(--padding-less);
            gap: var(--gap);

            .transaction-item {
                border-radius: var(--border-radius);
                background-color: var(--alt-color);
                display: flex;
                flex-direction: column;
                padding: var(--padding-less);
                gap: var(--gap-less);
                width: 100%;

                .body {
                    width: 100%;
                    display: inline-flex;
                    flex-direction: column;
                    .transaction-members {
                        display: flex;
                        flex-direction: row;
                        gap: var(--gap);
                        align-items: center;
                    }
                }
                .transaction-amount {
                    display: flex;
                    align-items: center;
                }

                .transaction-note {
                    display: flex;
                    flex-direction: column;
                }
            }
        }
    }
</style>
