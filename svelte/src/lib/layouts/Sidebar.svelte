<script>
    import { routes } from "$lib/mock/routes";
    import Navigation from "./Navigation.svelte";
    import Input from "$lib/elements/Input.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import { Appearance, Shape } from "$lib/enums";
    import Button from "$lib/elements/Button.svelte";
</script>

<div class="sidebar">
    <div class="sidebar-pre">
        <Input alt placeholder="Search . . .">
            <Icon icon={Shape.Search} />
        </Input>

        <Button icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Sidebar} />
        </Button>
    </div>
    <div class="sidebar-content">
        <slot></slot>
    </div>

    <Navigation routes={routes} />
</div>

<style lang="scss">
    .sidebar {
        flex: 1;
        width: var(--sidebar-width);
        display: inline-flex;
        flex-direction: column;
        padding: var(--padding);
        gap: var(--gap);

        .sidebar-content {
            display: flex;
            flex-direction: column;
            padding-right : var(--gap);
            flex: 1;
            width: 100%;
            overflow-y: scroll;
            gap: var(--gap);
            mask-image: linear-gradient(to bottom, var(--background) calc(100% - (var(--sidebar-width) / 6)), transparent 100%);
        }

        .sidebar-pre {
            width: 100%;
            display: inline-flex;
            gap: var(--gap);
            align-items: center;
        }
    }

</style>