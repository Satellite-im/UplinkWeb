<script lang="ts">
    import MarketNav from "$lib/components/market/MarketNav.svelte"
    import Modal from "$lib/components/ui/Modal.svelte"
    import Label from "$lib/elements/Label.svelte"
    import Sidebar from "../Sidebar.svelte"
</script>

<Modal>
    <div id="marketplace">
        <div class="aside">
            <Sidebar simple>
                <MarketNav />
            </Sidebar>
        </div>
        <div class="contnet">
            <Label text="Bundle" />
        </div>
    </div>
</Modal>

<style lang="scss">
    #marketplace {
        display: inline-flex;
        width: 1200px;
        height: 800px;
        min-width: 800px;
        min-height: 600px;
    }
</style>
