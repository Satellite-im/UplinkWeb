<script lang="ts">
	import init, * as wasm from '../../../../warp-wasm/pkg/warp_ipfs';

    import { Label } from "$lib/elements"
    import { Modal, PinInput } from "$lib/components"
    import { goto } from '$app/navigation'
    import { Appearance, Route, Shape } from "$lib/enums"

    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { Text, Button, Icon} from "$lib/elements"
    import ProfilePicture from "$lib/components/profile/ProfilePicture.svelte"
    import { mock_users } from "$lib/mock/users";
    import Spacer from "$lib/elements/Spacer.svelte";

    function initTesseract(pin: string) {
        init().then((_exports) => {
      console.log(wasm)

      let tesseract = new wasm.Tesseract()
      tesseract.load_from_storage()
      console.log(`loaded data`)

      const encoder = new TextEncoder();
      const passphrase = encoder.encode(pin);

      // const passphrase = new Uint8Array([1,2,3,4,5,6,7,8,9,0]);
      //self.crypto.getRandomValues(passphrase);
      console.log(`passphrase: ${passphrase}`);
      tesseract.unlock(passphrase)
      console.log(`unlocked`)

      if (!tesseract.autosave_enabled()) {
        tesseract.set_autosave()
      }
      console.log(`enabled saving`)

    //   let key = `mykey`
    //   if (tesseract.exist(key)) {
    //     console.log(`${key} exists: ${tesseract.retrieve(key)}`)
    //   } else {
    //     console.log(`${key} does not exist yet`)
    //   }

    //   tesseract.set(key, `value123`)
    //   console.log(`set ${key}: ${tesseract.retrieve(key)}`)
    //   tesseract.set(key, `persisted123`)
    //   console.log(`set ${key}: ${tesseract.retrieve(key)}`)

    //   tesseract.save()
    //   console.log(`saved: ${key}`)

    //   let stream = {}
    //   stream[Symbol.asyncIterator] = () => { return tesseract.subscribe() }
    //   console.log(`subscribed to stream`)

      
    //   async function stream_reader() {
    //     for await (const value of stream) {
    //       console.log(wasm.TesseractEvent[await value])
    //     }
    //   };
    //   stream_reader()
    //   console.log(`started stream reader loop`)

    //   async function tesseract_lock_loop() {
    //     for (let i = 0; i < 10; i++) {
    //       await new Promise(resolve => setTimeout(resolve, 50))
    //       tesseract.lock()
    //     }
    //   }
    //   tesseract_lock_loop()
    //   console.log(`started tesseract lock loop`)

    })
    }
   

    initLocale()

    let create = false
    let loading = false
    let scramble = true

    let showAccounts = false
</script>

<div id="auth-unlock">
    {#if showAccounts}
        <Modal on:close={(_) => showAccounts = false} padded>
            <div class="profiles">
                <Label text={$_('generic.profiles')} />
                <div class="user">
                    <ProfilePicture image={mock_users[1].profile.photo.image} noIndicator/>
                    <Text class="username">{mock_users[1].name}</Text>
                </div>
                <div class="user">
                    <ProfilePicture image={mock_users[2].profile.photo.image} />
                    <Text class="username">{mock_users[2].name}</Text>
                </div>
                <Spacer />
                <Button text="Create new profile" appearance={Appearance.Alt}>
                    <Icon icon={Shape.Plus} />
                </Button>
            </div>
        </Modal>
    {/if}
    
    {#if loading}
        <Label text={$_('generic.loading')} />
    {:else}
        <Label text={(create) ? $_('pages.auth.unlock.choose_pin') : $_('pages.auth.unlock.enter_pin')} />
    {/if}

    <PinInput min={4} max={8} loading={loading} scramble={scramble} showSettings={false} 
        on:submit={(event) => {
            initTesseract(event.detail)
            goto(Route.Pre);
    }}/>

    <div class="switch-profile">
        <Button tooltip="Change User" icon on:click={(_) => showAccounts = true}>
            <Icon icon={Shape.Profile} />
        </Button>
    </div>
</div>

<style lang="scss">
    #auth-unlock {
        display: inline-flex;
        flex-direction: column;
        flex: 1;
        align-items: center;
        justify-content: center;
        padding: var(--padding);
        width: 100%;
        height: 100%;

        .switch-profile {
            position: absolute;
            right: var(--padding);
            bottom: var(--padding);
        }

        .profiles {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);
            width: 100%;
            min-width: var(--min-component-width);
            .user {
                display: inline-flex;
                gap: var(--gap);
                width: 100%;
                justify-content: flex-start;
                align-items: center;
                border: var(--border-width) solid transparent;
                padding: var(--padding-minimal);
                border-radius: var(--border-radius);
                cursor: pointer;

                &:hover {
                    background-color: var(--alt-color);
                }

                :global(.username) {
                    flex: 1;
                }
            }
        }
    }
</style>