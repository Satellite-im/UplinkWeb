<script lang="ts">
    import { Input, Icon } from "$lib/elements"
    import { Shape } from "$lib/enums"

    import { _ } from "svelte-i18n"
</script>

<div class="sidebar-layout open" data-cy="sidebar">
    <div class="sidebar">
        <div class="sidebar-pre">
            <Input hook="input-sidebar-search" alt placeholder={$_("generic.search_placeholder")}>
                <Icon icon={Shape.Search} />
            </Input>
        </div>

        <slot></slot>
    </div>
</div>

<style lang="scss">
    .sidebar-layout {
        width: fit-content;
        min-width: var(--sidebar-width);
        display: inline-flex;
        flex-direction: row;
        border-right: var(--border-width) solid var(--border-color);
        max-height: 100vh;
        overflow-y: hidden;

        .sidebar {
            display: inline-flex;
            flex-direction: column;
            padding: var(--padding-less);
            width: var(--sidebar-width);
            gap: var(--gap);
            flex: 1;
        }
        .sidebar-pre {
            width: 100%;
            display: inline-flex;
            gap: var(--gap);
            align-items: center;
        }
    }
</style>
