<script lang="ts">
    import { Text } from "$lib/elements"
    import { ProfilePicture } from "$lib/components"
    import { defaultUser, type Transaction } from "$lib/types"
    import { Size } from "$lib/enums"

    export let transaction: Transaction = {
        amount: 0,
        at: new Date(),
        to: defaultUser,
        from: defaultUser,
        note: "",
    }

    let dateStr = "1991/01/11"
    let d = new Date(dateStr)
</script>

<tr class="transaction">
    <td>
        <Text singleLine>
            {transaction.amount}
        </Text>
    </td>
    <td>
        <div class="from">
            <ProfilePicture size={Size.Smallest} image={transaction.from.profile.photo.image} />
            <Text singleLine>{transaction.from.name}</Text>
        </div>
    </td>
    <td>
        <div class="to">
            <ProfilePicture size={Size.Smallest} image={transaction.to.profile.photo.image} />
            <Text singleLine>{transaction.to.name}</Text>
        </div>
    </td>
    <td>
        <Text singleLine>
            {transaction.note}
        </Text>
    </td>
    <td>
        <Text singleLine>
            {transaction.at.toLocaleString("default", { month: "long" })}
            {transaction.at.getDate()}, {transaction.at.getFullYear()}
        </Text>
    </td>
</tr>

<style lang="scss">
    .transaction {
        width: 100%;
        flex-direction: row;

        .from,
        .to {
            display: inline-flex;
            width: var(--mini-user-width);
            align-items: center;
            gap: var(--gap);
            background-color: var(--alt-color);
            padding: var(--padding-minimal);
            padding-right: var(--padding);
            border-radius: var(--border-radius-more);
        }
    }
</style>
