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

To get running fast, ensure this project is cloned, with the latest dependencies and submodules installed.

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

1. Install Xverse Chrome extension (or Unisat)

2. In Xverse, go to Settings -> General -> Network and select 'Testnet'

3. Get some free Testnet BTC from a faucet. For example https://bitcoinfaucet.uo1.net/send.php

## Get (Sepolia) Testnet Ethereum and LINK (ERC20 Token)

1. Install the MetaMask Chrome extension

2. In Metamask, Open the dropdown in the top left corner, and select Sepolia (This is the Ethereum test net currently)

3. Go to https://faucets.chain.link and select Sepolia ETH and LINK. Press continue and paste your address.

## Request a Payment

1. While chatting with another user in UplinkWeb, click the `Create Payment Request` button on the bottom chat bar (coin exchange icon, next to chat input).

<img width="1034" alt="Captura de ecrã 2024-08-28, às 11 00 58" src="https://github.com/user-attachments/assets/5c18e3f6-80f5-4ee7-9194-13ae248dc52b">


2. Select the asset type. If selecting ETH.ERC20, you will need to put in the asset ID as well. The asset ID of LINK on Sepolia test net is `0x779877A7B0D9E8603169DdbD7836e478b4624789` (You can see this ID in MetaMask if you own some LINK: click on it, then near the top click the '3 dots' icon, and select 'Token details'. The ID is listed under `Token contract address`).

3. In UplinkWeb, once you select the asset (and ID if applicable), enter an amount. Then click the `Request` button. A clickable message will appear in the chat. Anyone clicking this message will get a prompt via the Chrome extension to make the transfer. (Expect at least 10 seconds for a transfer to go through on the Ethereum network).

## Mobile Builds

`npm i`

`npm run build`

`npx cap sync`

- then for Android

`npx cap open android` or `npx cap run android`


- for iOS
  
`npx cap open ios`


## Contributing

All contributions are welcome! Please keep in mind we're still a relatively small team, and any work done to ensure contributions don't cause bugs or issues in the application is much appreciated.

# Contributors

![GitHub Contributors Image](https://contrib.rocks/image?repo=Satellite-im/UplinkWeb)
