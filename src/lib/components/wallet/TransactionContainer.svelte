<script>
    import Label from "src/lib/elements/Label.svelte"
</script>

<table class="transactions-container">
    <tr>
        <th>
            <Label text="Amount" />
        </th>
        <th>
            <Label text="From" />
        </th>
        <th>
            <Label text="To" />
        </th>
        <th>
            <Label text="Note" />
        </th>
        <th>
            <Label text="Date" />
        </th>
    </tr>
    <slot></slot>
</table>

<style lang="scss">
    .transactions-container {
        width: 100%;
        th {
            text-align: start;
        }
    }
</style>
