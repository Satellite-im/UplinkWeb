<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import Modal from "../ui/Modal.svelte"
    import Topbar from "$lib/layouts/Topbar.svelte"
    import Text from "$lib/elements/Text.svelte"
    import Sidebar from "$lib/layouts/market/Sidebar.svelte"
    import MarketNav from "./MarketNav.svelte"

    const dispatch = createEventDispatcher()
    function onClose() {
        dispatch("close")
    }
</script>

<Modal on:close={onClose}>
    <div id="market">
        <Topbar>
            <svelte:fragment slot="content">
                <Text class="title" noWrap>Uplink Marketplace</Text>
            </svelte:fragment>
        </Topbar>
        <div class="content">
            <div class="aside">
                <Sidebar>
                    <MarketNav />
                </Sidebar>
            </div>
            <div class="body">body</div>
        </div>
    </div>
</Modal>

<style lang="scss">
    #market {
        width: 80vw;
        height: 80vh;
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
            }
        }
    }
</style>
