<script lang="ts">
    import { Appearance, Route, Shape, Size } from "$lib/enums"
    import { Sidebar } from "$lib/layouts"

    import { _ } from "svelte-i18n"
    import Label from "$lib/elements/Label.svelte"
    import { Transaction } from "$lib/components"
    import ProfilePicture from "$lib/components/profile/ProfilePicture.svelte"
    import Text from "$lib/elements/Text.svelte"
    import Input from "$lib/elements/Input/Input.svelte"
    import { balance, recent_transactions, transactions_in, transactions_out } from "$lib/mock/wallet"
    import TransactionContainer from "$lib/components/wallet/TransactionContainer.svelte"
    import { mock_users } from "$lib/mock/users"
    import Controls from "$lib/layouts/Controls.svelte"
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import NewPayment from "$lib/components/wallet/payments/NewPayment.svelte"
    import { get } from "svelte/store"
    import { UIStore } from "$lib/state/ui"

    let loading: boolean = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)

    function toggleSidebar(): void {
        UIStore.toggleSidebar()
    }

    UIStore.state.sidebarOpen.subscribe(s => (sidebarOpen = s))
</script>

<div id="page">
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Wallet}>
        <Label text={$_("payments.newPayment")} />
        <NewPayment recipients={mock_users} embedded />
    </Sidebar>
    <div class="content">
        <div class="header">
            <div id="payment-profile">
                <ProfilePicture id={mock_users[0].key} image={mock_users[0]?.profile.photo.image} size={Size.Large} status={mock_users[0]?.profile.status} />

                <div class="profile-details">
                    <Label text={$_("generic.username")} />
                    <Text>{mock_users[0].name}</Text>
                    <Label text={$_("payments.paymentID")} />
                    <Input alt disabled value={`${mock_users[0].name}#${mock_users[0].id.short}`} />
                </div>
            </div>

            <div id="current-balance">
                <Label text={$_("payments.balance")}></Label>
                <Text size={Size.Large}>{balance}</Text>
            </div>
        </div>

        <div id="recent-transactions">
            <Label text={$_("payments.recentTransaction")} />
            <div class="transacitons">
                <TransactionContainer>
                    {#each recent_transactions as transaction}
                        <Transaction transaction={transaction} />
                    {/each}
                </TransactionContainer>
                <Controls>
                    <Button text={$_("payments.loadMore")} appearance={Appearance.Alt}>
                        <Icon icon={Shape.ArrowDown} />
                    </Button>
                </Controls>
            </div>
        </div>
        <div id="transactions">
            <div id="payments-in">
                <Label text={$_("payments.coinIn")} />
                <div class="transacitons">
                    <TransactionContainer>
                        {#each transactions_in as transaction}
                            <Transaction transaction={transaction} />
                        {/each}
                    </TransactionContainer>
                    <Controls>
                        <Button text={$_("payments.loadMore")} appearance={Appearance.Alt}>
                            <Icon icon={Shape.ArrowDown} />
                        </Button>
                    </Controls>
                </div>
            </div>
            <div id="payments-out">
                <Label text={$_("payments.coinOut")} />
                <div class="transacitons">
                    <TransactionContainer>
                        {#each transactions_out as transaction}
                            <Transaction transaction={transaction} />
                        {/each}
                    </TransactionContainer>
                    <Controls>
                        <Button text={$_("payments.loadMore")} appearance={Appearance.Alt}>
                            <Icon icon={Shape.ArrowDown} />
                        </Button>
                    </Controls>
                </div>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    #page {
        display: flex;
        margin: 0;
        flex: 1;
        height: 100%;
        overflow: hidden;

        .content {
            display: flex;
            min-height: 0;
            display: flex;
            overflow: hidden;
            flex-direction: column;
            flex: 1;
            padding: var(--padding);
            gap: var(--gap);
            max-height: 100vh;
            overflow-y: scroll;
            min-width: 0;

            .transacitons {
                min-height: 0;
                overflow-y: scroll;
            }

            .header {
                display: inline-flex;
                flex-direction: row;
                gap: var(--gap);
            }

            #payment-profile {
                background-color: var(--background-alt);
                padding: var(--padding);
                width: fit-content;
                display: inline-flex;
                flex-direction: row;
                gap: var(--gap);
                border-radius: var(--border-radius);
                flex: 50%;
            }

            #current-balance {
                display: inline-flex;
                flex-direction: column;
                justify-content: center;
                align-content: center;
                text-align: center;
                align-items: center;
                flex: 50%;
                border: var(--border-width) solid var(--border-color);
                border-radius: var(--border-radius);
            }

            #transactions {
                width: 100%;
                display: inline-flex;
                flex-direction: row;
                gap: var(--gap);
                flex: 1;

                #payments-in,
                #payments-out {
                    width: 50%;
                    padding: var(--padding);
                    background: var(--background-alt);
                    border-radius: var(--border-radius);
                }
            }

            #recent-transactions {
                width: 100%;
                padding: var(--padding);
                background: var(--background-alt);
                border-radius: var(--border-radius);
            }
        }
    }
</style>
