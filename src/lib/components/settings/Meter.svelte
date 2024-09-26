<script lang="ts">
    export let percent: number = 0
</script>

<div class="meter-container">
    <div data-cy="meter" class="meter"></div>
    <div class="meter-mask" style="width: {100 - percent}%"></div>
</div>

<style lang="scss">
    .meter-container {
        width: 100%;
        display: inline-flex;
        background-color: var(--alt-color);
        height: var(--meter-bar-height);
        border: var(--border-width) solid var(--border-color);
        border-radius: calc(var(--meter-bar-height) / 2);
        position: relative;
        overflow: hidden;

        .meter {
            width: 100%;
            height: 100%;
            border-radius: calc(var(--meter-bar-height) / 2);
            background: linear-gradient(90deg, var(--success-color) 0%, var(--success-color) 75%, var(--warning-color) 75%, var(--warning-color) 90%, var(--error-color) 90%, var(--error-color) 100%);
        }

        .meter-mask {
            position: absolute;
            z-index: 2;
            width: 0%;
            height: 100%;
            background-color: var(--alt-color);
            opacity: 0.75;
            right: 0;
        }
    }
</style>
