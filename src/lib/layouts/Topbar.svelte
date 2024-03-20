<script lang="ts">
    import { ContextMenu } from "$lib/components";
    import { Shape } from "$lib/enums";
    import type { ContextItem } from "$lib/types"

    const fakeData: ContextItem[] = [
        {
            id: "something_1",
            icon: Shape.Beaker,
            text: "Something",
        },
        {
            id: "something_2",
            icon: Shape.Beaker,
            text: "Something",
        },
        {
            id: "something_3",
            icon: Shape.Beaker,
            text: "Something",
        },
        {
            id: "something_4",
            icon: Shape.Beaker,
            text: "Something",
        }
    ];


</script>

<div class="topbar">
    <ContextMenu items={fakeData} parentClass=".topbar"/>
    <slot name="before" />
    <div class="content">
        <slot name="content" />
    </div>
    <slot name="controls" />
</div>

<style lang="scss">
    .topbar {
        width: 100%;
        display: inline-flex;
        align-items: center;
        padding: var(--padding-less);
        gap: var(--gap);
        border-bottom: var(--border-width) solid var(--border-color);

        :global(.before) {
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap)
        }

        .content {
            flex:1;
            height: 100%;
            min-width: 0;
            justify-self: flex-start;
        }

        :global(.controls) {
            min-width: fit-content;
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap-less);
        }
    }
</style>