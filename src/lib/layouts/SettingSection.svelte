<script lang="ts">
    import Label from "$lib/elements/Label.svelte";
    import Text from "$lib/elements/Text.svelte";

    export let name: string = "Setting"
    export let description: string = "Some setting description"

</script>

<div class="setting-section">
    <div class="body">
        <div class="description">
            <Label text={name} />
            <Text doubleLine>{description}</Text>
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
            }

            .content {
                width: fit-content;
            }
        }

    }
</style>