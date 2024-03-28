import type { Transaction } from "$lib/types";
import { mock_users } from "./users";

export let balance: number = 0
export let transcations_out: Transaction[] = [
    {
        at: new Date(),
        to: mock_users[0],
        from: mock_users[1],
        amount: 938123.00,
        note: "This is a payment note"
    },
    {
        at: new Date(),
        to: mock_users[0],
        from: mock_users[4],
        amount: 4812.00,
        note: "This is a payment note"
    },
    {
        at: new Date(),
        to: mock_users[0],
        from: mock_users[4],
        amount: 44.00,
        note: "This is a payment note"
    },
    {
        at: new Date(),
        to: mock_users[0],
        from: mock_users[3],
        amount: 1.00,
        note: "This is a payment note"
    },
    {
        at: new Date(),
        to: mock_users[0],
        from: mock_users[2],
        amount: 9523.00,
        note: "This is a payment note"
    }
]
export let transcations_in: Transaction[] = [...transcations_out]


export let recent_transactions: Transaction[] = [
    ...transcations_in,
    ...transcations_out
]