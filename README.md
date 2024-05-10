# Uplink Web

## Developing

Once you've cloned the project and installed dependencies with `npm install`, start a development server:

```bash
git submodule update --init --recursive
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Run automated tests

- Start server in one terminal window/tab
- In another terminal window/tab, run the following commands:

```bash
git submodule update --init --recursive
cd ./automated-tests
yarn
yarn cypress run
```
