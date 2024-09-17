<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import Modal from "../ui/Modal.svelte"
    import Sidebar from "$lib/layouts/market/Sidebar.svelte"
    import { _ } from "svelte-i18n"
    import { UIStore } from "$lib/state/ui"
    import Landing from "./pages/Landing.svelte"
    import { Button, Icon, Label } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import PurchaseStarlight from "./pages/PurchaseStarlight.svelte"

    const dispatch = createEventDispatcher()
    function onClose() {
        dispatch("close")
    }

    type Route = {
        name: string
        component: any
    }

    let routes: Route[] = [
        { name: $_("market.purchase_starlight"), component: PurchaseStarlight },
        { name: $_("market.home"), component: Landing },
    ]

    let activeRoute = routes[0].component

    function changeRoute(route: Route) {
        activeRoute = route.component
    }

    $: open = UIStore.state.marketOpen
</script>

{#if $open}
    <Modal on:close={onClose}>
        <div id="market">
            <div class="content">
                <div class="aside">
                    <Sidebar>
                        <div class="market-nav">
                            <Label text="Pre-Release Perks" />

                            <Button
                                text={$_("market.purchase_starlight")}
                                fill
                                appearance={activeRoute === routes[0].component ? Appearance.Primary : Appearance.Alt}
                                on:click={_ => {
                                    changeRoute(routes[0])
                                }}>
                                <Icon icon={Shape.Starlight} />
                            </Button>

                            <Button
                                text={$_("market.bundles")}
                                fill
                                appearance={activeRoute === routes[1].component ? Appearance.Primary : Appearance.Alt}
                                on:click={_ => {
                                    changeRoute(routes[1])
                                }}>
                                <Icon icon={Shape.Beaker} />
                            </Button>
                        </div>
                    </Sidebar>
                </div>
                <div class="body">
                    {#if activeRoute}
                        <svelte:component this={activeRoute} />
                    {/if}
                </div>
            </div>
        </div>
    </Modal>
{/if}

<style lang="scss">
    #market {
        width: fit-content;
        height: 80vh;
        max-height: 900px;
        display: inline-flex;
        flex-direction: column;
        .content {
            display: inline-flex;
            flex: 1;
            .aside {
                height: 100%;

                width: var(--sidebar-width);
                display: inline-flex;
            }
            .body {
                padding: var(--padding);
                flex: 1;
                height: 80vh;
                max-height: 900px;

                overflow-y: auto;
            }
        }

        .market-nav {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap-less);
        }
    }
</style>
