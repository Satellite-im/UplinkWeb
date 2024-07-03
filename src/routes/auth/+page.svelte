<script lang="ts">
    import { goto } from "$app/navigation"
    import { Route } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { Entrypoint, NewAccount, LoginPage, RecoveryCopy, Unlock } from "$lib/layouts/login"
    import { AuthStore } from "$lib/state/auth"
    import { Store } from "$lib/state/Store"
    import { ToastMessage } from "$lib/state/ui/toast"
    import { RelayStore } from "$lib/state/wasm/relays"
    import { log } from "$lib/utils/Logger"
    import type { WarpError } from "$lib/wasm/HandleWarpErrors"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { TesseractStoreInstance } from "$lib/wasm/TesseractStore"
    import { WarpStore } from "$lib/wasm/WarpStore"
    import { get } from "svelte/store"
    import type { Identity } from "warp-wasm"

    initLocale()

    let currentPage: LoginPage = LoginPage.EntryPoint
    let username: string = ""
    let statusMessage: string = ""
    let phrase: string[] = "agree alarm acid actual actress acid album admit absurd adjust adjust air".split(" ")

    async function accountExist() {
        return TesseractStoreInstance.exists()
    }

    async function checkIfAccountExist() {
        await TesseractStoreInstance.initTesseract()
        let exist = await accountExist()
        if (exist) {
            currentPage = LoginPage.Pin
        }
    }

    async function auth(pin: string) {
        let addressed = Object.values(get(RelayStore.state))
            .filter(r => r.active)
            .map(r => r.address)
        if (get(AuthStore.state).pin === "" || !(await TesseractStoreInstance.getTesseract()).is_unlock()) {
            let result = await TesseractStoreInstance.unlock(pin)
            let failed = false
            result.onFailure(_ => {
                failed = true
                Store.addToastNotification(new ToastMessage("", "Pin is wrong!", 2))
            })
            if (failed) return
            await WarpStore.initWarpInstances(addressed)
        }
        let ownIdentity = await MultipassStoreInstance.getOwnIdentity()
        ownIdentity.fold(
            (_: any) => {
                AuthStore.setStoredPin(pin)
                currentPage = LoginPage.RecoveryCopy
                //TODO generate phrase here
            },
            (_: any) => {
                setTimeout(() => MultipassStoreInstance.initMultipassListener(), 1000)
                goto(Route.Pre)
            }
        )
    }

    async function createAccount() {
        if (username === "" || phrase.length === 0) return
        // TODO use passphrase
        await MultipassStoreInstance.createIdentity(username, statusMessage, undefined)
        let identity = await MultipassStoreInstance.getOwnIdentity()
        identity.fold(
            (e: WarpError) => {
                log.error("Error creating identity: " + e)
            },
            async (identity: Identity) => {
                Store.setUserFromIdentity(identity!)
                await new Promise(resolve => setTimeout(resolve, 1000))
                setTimeout(() => MultipassStoreInstance.initMultipassListener(), 1000)
                goto(Route.Chat)
            }
        )
    }

    checkIfAccountExist()
</script>

{#if currentPage == LoginPage.EntryPoint}
    <Entrypoint bind:page={currentPage} />
{:else if currentPage == LoginPage.Username}
    <NewAccount bind:page={currentPage} bind:username={username} bind:statusMessage={statusMessage} />
{:else if currentPage == LoginPage.Pin}
    <Unlock
        on:pin={async e => {
            await auth(e.detail.pin)
            e.detail.done()
        }} />
{:else if currentPage == LoginPage.RecoveryCopy}
    <RecoveryCopy phrase={phrase} on:click={createAccount} />
{/if}

<style lang="scss">
</style>
