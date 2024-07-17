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

    scan_for_addr(str: string): string[] {
        let addresses: string[] = []
        let split = str.split(" ")
        split.forEach((value) => {
            if (value.startsWith("btc:")) {
                addresses.push(value.substring(4))
            }
        })
        return addresses
    }
    shorten_addr(str: string, num_chars: number): string {
        let start = str.substring(0, num_chars)
        let end = str.substring(str.length - num_chars)
        return start + ".." + end
    }
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

export const wallet = new ExternalWallets()
