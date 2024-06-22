<script lang="ts">
    import { Label, Text } from "$lib/elements"

    export let name: string = "Setting"
    export let description: string = "Some setting description"
    export let fullWidth: boolean = false
    export let hook: string = ""
</script>

<div data-cy={hook} class="setting-section {fullWidth ? 'full-width' : ''}">
    <div class="body">
        <div class="description">
            <Label hook="setting-section-label" text={name} />
            <Text hook="setting-section-text" doubleLine>{description}</Text>
        </div>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</div>

<style lang="scss">
    .setting-section {
        display: inline-flex;
        flex-direction: column;
        width: 100%;
        gap: var(--gap);
        padding: var(--padding-less) 0;

        .body {
            display: inline-flex;
            gap: var(--gap);
            width: 100%;
            align-items: center;
            flex-wrap: wrap;

            .description {
                flex: 1;
                min-width: 50%;
            }

            .content {
                width: fit-content;
                min-width: 50%;
                justify-content: flex-end;
                display: inline-flex;
                flex-direction: row;
                min-width: var(--min-component-width);
                gap: var(--gap);
            }
        }

        &.full-width {
            .body {
                .content {
                    width: 100%;
                }
            }
        }
    }

    @media (max-width: 800px) {
        .setting-section {
            .body {
                .content {
                    min-width: fit-content !important;
                }
            }
        }
    }
</style>
