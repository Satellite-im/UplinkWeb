<script>
    import Label from "$lib/elements/Label.svelte"
    import { _ } from "svelte-i18n"
</script>

<table class="transactions-container">
    <tr>
        <th>
            <Label text={$_("payments.amount")} />
        </th>
        <th>
            <Label text={$_("payments.from")} />
        </th>
        <th>
            <Label text={$_("payments.to")} />
        </th>
        <th>
            <Label text={$_("payments.note")} />
        </th>
        <th>
            <Label text={$_("payments.date")} />
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
