<script lang="ts">
    import { Text, Label, RangeSelector } from "$lib/elements"
    import { Size } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import { UIStore } from "$lib/state/ui"
    import ProfilePicture from "../profile/ProfilePicture.svelte"

    export let participants: string[]

    $: chats = UIStore.state.chats
    $: userCache = Store.getUsersLookup($chats.map(c => c.users).flat())
</script>

<div class="volume-mixer">
    <div class="global">
        <Label text="Master Volume" />
        <div class="control">
            <RangeSelector min={0} max={200} value={100} />
            <Text>100</Text>
        </div>
    </div>

    {#each participants as user}
        <div class="user-volume">
            <Label text={$userCache[user].name} />
            <div class="control">
                <ProfilePicture id={$userCache[user].key} size={Size.Smallest} image={$userCache[user].profile.photo.image} status={$userCache[user].profile.status} />
                <div class="range">
                    <RangeSelector min={0} max={200} value={100} />
                </div>
                <Text>100</Text>
            </div>
        </div>
    {/each}
</div>

<style lang="scss">
    .volume-mixer {
        width: var(--min-component-width);
        max-height: var(--min-component-width);
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        background-color: var(--opaque-color);
        backdrop-filter: blur(var(--blur-radius));
        padding: var(--padding);
        border-radius: var(--border-radius);
        position: absolute;
        z-index: 3;
        bottom: 100%;
        margin-bottom: calc((var(--input-height) / 2) * -1);
        margin-left: calc((var(--input-height) / 2));
        overflow-y: scroll;
        border: var(--border-width) solid var(--border-color);

        .global,
        .user-volume {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap-less);
        }

        .control {
            display: inline-flex;
            gap: var(--gap);

            .range {
                flex: 1;
            }
        }
    }
</style>
