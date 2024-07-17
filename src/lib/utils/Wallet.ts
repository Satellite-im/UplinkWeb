import Wallet, { AddressPurpose, AddressType, RpcErrorCode } from "sats-connect"

export type Account = {
    address: string
    publicKey: string
    purpose: AddressPurpose
    addressType: AddressType
}

class ExternalWallets {
    btc: Btc = new Btc()

    eth: Eth = new Eth()

    sol: Sol = new Sol()
}

class Btc {
    async get_accounts(): Promise<Account[]> {
        const provider = await Wallet.request('getAccounts', {
            purposes: [AddressPurpose.Payment]
        });
        if (provider.status !== 'success') {
            console.error("failed to get accounts")
            return []
        }
        if (provider.result.length < 1) {
            console.error("no account exists")
            return []
        }
        return provider.result
    }
    async send(to_address: string, amount: number) {
        try {
            const response = await Wallet.request("sendTransfer", {
                recipients: [
                    {
                        address: to_address,
                        amount: Number(amount),
                    },
                ],
            });
            console.log(response)
            if (response.status === "success") {
                console.log("success")
                // handle success
            } else {
                console.error(response.error.message)
                if (response.error.code === RpcErrorCode.USER_REJECTION) {
                    // handle user cancellation error
                } else {
                    // handle error
                }
            }
        } catch (err) {
            console.error(err)
        }
    }
}

class Eth {

}

class Sol {

}

export class PayRequest {
    amount: number
    asset: string
    destination: string

    constructor(amount: number, asset: string, destination: string) {
        this.amount = amount
        this.asset = asset
        this.destination = destination
    }
    is_valid(): boolean {
        if (!isNaN(this.amount) && isFinite(this.amount) && this.amount > 0) {
            if (this.asset === "sat" && this.destination.length >= 26) {
                return true
            }
        }
        return false
    }
    to_cmd_string(): string {
        return `/request ${this.amount} ${this.asset} ${this.destination}`
    }
    to_display_string(): string {
        return `Send ${this.amount} ${this.asset} @ ${shorten_addr(this.destination, 6)}`
    }
    async execute() {
        if (this.asset == "sat") {
            await wallet.btc.send(this.destination, this.amount)
        }
    }
}

export function get_valid_payment_request(msg: string): PayRequest | undefined {
    let parts = msg.split(" ")
    if (parts.length === 4 && parts[0] === "/request") {
        let request = new PayRequest(parseInt(parts[1]), parts[2], parts[3])
        if (request.is_valid()) {
            return request
        }
    }
}

export function shorten_addr(str: string, num_chars: number): string {
    let start = str.substring(0, num_chars)
    let end = str.substring(str.length - num_chars)
    return start + ".." + end
}

export const wallet = new ExternalWallets()
