<h1 align="center">
  <img src="docs/images/logo.png" width=200 height=200/><br>
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

## Sending bitcoin (POC)

1 - Install Unisat chrome extension

2 - Go to Settings -> Network and select 'Bitcoin Testnet'

3 - Get some free testnet btc from a faucet. For example: https://bitcoinfaucet.uo1.net/send.php

4 - On another user in uplinkweb, open up the conversation and click the 'Create Payment Request' button on the top bar (coin exchange icon, next to the call button) They will also need Unisat installed.

5 - Enter an amount and click the `Request` button. A clickable message will appear in the chat.

6 - Go back to the other user and click the message and the request will be forwarded to Unisat for you to approve the transaction.

## Contributing

All contributions are welcome! Please keep in mind we're still a relatively small team, and any work done to ensure contributions don't cause bugs or issues in the application is much appreciated.

# Contributors

![GitHub Contributors Image](https://contrib.rocks/image?repo=Satellite-im/UplinkWeb)
