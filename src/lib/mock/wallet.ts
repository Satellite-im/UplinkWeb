import type { Transaction } from "$lib/types"
import { mock_users } from "./users"

export let balance: number = 0
export let transactions_out: Transaction[] = [
    {
        at: new Date(),
        to: mock_users[0],
        from: mock_users[1],
        amount: 938123.0,
        note: "This is a payment note",
    },
    {
        at: new Date(),
        to: mock_users[0],
        from: mock_users[4],
        amount: 4812.0,
        note: "This is a payment note",
    },
    {
        at: new Date(),
        to: mock_users[0],
        from: mock_users[4],
        amount: 44.0,
        note: "This is a payment note",
    },
    {
        at: new Date(),
        to: mock_users[0],
        from: mock_users[3],
        amount: 1.0,
        note: "This is a payment note",
    },
    {
        at: new Date(),
        to: mock_users[0],
        from: mock_users[2],
        amount: 9523.0,
        note: "This is a payment note",
    },
]
export let transactions_in: Transaction[] = [...transactions_out]

export let recent_transactions: Transaction[] = [...transactions_in, ...transactions_out]
