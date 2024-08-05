<script lang="ts">
    export let show: boolean = false
</script>

{#if show}
    <div id="video-preview" class="video-preview">
        <div id="preview-video"></div>
    </div>
{/if}

<style lang="scss">
    #video-preview {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;

        #preview-video {
            width: 400px;
            height: 225px;
            background: var(--background-alt);
            border-radius: var(--border-radius);
            border: var(--border-width) solid var(--border-color);
            position: absolute;
            top: var(--gap);
            right: var(--gap);
        }
    }
</style>
