<h1 align="center">
  <img src="static/logo.png" width=200 height=200/><br>
  Uplink Web
</h1>

<h4 align="center">Privacy First, Modular, P2P messaging client built atop Warp.</h4>

<br/>

Uplink is written in TS with [Svelte](https://svelte.dev/). It is developed as a new foundation for implementing Warp features in a universal application.

The goal should be to build a hyper-customizable application that can run anywhere and support extensions.

---

## Quickstart for Developing

To get running fast, ensure you have this project cloned, with latest dependencies and submodules installed.

**Standard Steps:**

```
git clone https://github.com/Satellite-im/UplinkWeb.git
npm install
```

**Now, run a server locally and open it in your favorite browser:**

Usually, the URL served will be [this](http://localhost:5173/)

```
npm run dev
```

---

## Get Testnet Bitcoin

1 - Install Unisat Chrome extension

2 - Go to Settings -> Network and select 'Bitcoin Testnet'

3 - Get some free Testnet BTC from a faucet. For example: https://bitcoinfaucet.uo1.net/send.php

## Send to profile's Bitcoin address

1 - On another user in uplinkweb, update their profile to include a Bitcoin address. For example: `tb1pa94qy59l3cxuau4m2vxzlc4flj0yma2pkwz4kd5u6y2ygpdzrlwqescp06` They can find their testnet address in their Unisat. (or use the same Unisat, but create a 2nd account)

2 - Now in a conversation with them, when you open up their profile popup, if it detects an address in their profile, it will show a button to send sats. Click it and the request will be forwarded to Unisat for you to approve the transaction.

## Create Bitcoin payment request

1 - On another user in UplinkWeb, open up the conversation and click the 'Create Payment Request' button on the top bar (coin exchange icon, next to the call button) They will also need Unisat installed.

2 - Enter an amount and click the `Request` button. A clickable message will appear in the chat.

3 - Go back to the other user and click the message and the request will be forwarded to Unisat for you to approve the transaction.

## Contributing

All contributions are welcome! Please keep in mind we're still a relatively small team, and any work done to ensure contributions don't cause bugs or issues in the application is much appreciated.

# Contributors

![GitHub Contributors Image](https://contrib.rocks/image?repo=Satellite-im/UplinkWeb)
