<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { Controls } from "$lib/layouts"
</script>

<!-- Success Splash -->
<div id="success-splash">
    <h2>It's Sent!</h2>

    <p class="label">
        Your payment to
        <span id="success-recipients">
            <span class="recipient"> Johnny Space, </span>
            <span class="recipient"> Manny Mars, </span>
            <span class="recipient"> and Space Kevin </span>
        </span>
        has been sent.
    </p>

    <div class="transaction-detail">
        <Label text="Note:" /> <span class="subtext">Sample transaction, could be for pizza. . . space pizza!</span>
    </div>
    <div class="transaction-detail">
        <Label text="Sent To:" /> <span class="subtext">Johnny Space, Manny Mars, Space Kevin.</span>
    </div>
    <div class="transaction-detail">
        <Label text="Sent At:" /> <span class="subtext">Mon Feb 19, 5:38pm</span>
    </div>
    <div class="transaction-detail">
        <Label text="Amount (x3):" /> <span class="subtext">$30.44</span>
    </div>
    <div class="transaction-detail">
        <Label text="Fees:" /> <span class="subtext">$00.04</span>
    </div>
    <div class="transaction-detail">
        <Label text="Total:" /> <span class="subtext">$91.36</span>
    </div>

    <!-- Controls -->
    <Controls>
        <Button>Done</Button>
    </Controls>
</div>

<style lang="scss">
    #success-splash {
        position: absolute;
        background-color: var(--alt-color);
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 3;
        border-radius: var(--border-radius);
        padding: var(--padding);
        gap: var(--gap-more);
        display: inline-flex;
        flex-direction: column;

        h2 {
            font-size: var(--font-size-max);
            color: var(--success-color);
            text-align: center;
        }

        .transaction-detail {
            display: inline-flex;
            gap: var(--gap);
            justify-content: space-between;
            border-bottom: var(--border-width) solid var(--border-color);
            padding: var(--padding-less) 0;
        }
    }
</style>
