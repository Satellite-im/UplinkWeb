<script lang="ts">
    import { onMount } from "svelte"

    export let markup: string = ""
    export let script: string = ""
    export let style: string = ""
    export let dimensions: { width: number; height: number } = { width: 100, height: 100 }
    export let data: object = {}

    let iframeRef: HTMLIFrameElement

    const loadContent = () => {
        if (iframeRef) {
            const iframeDoc = iframeRef.contentDocument || iframeRef.contentWindow?.document
            if (iframeDoc) {
                iframeDoc.open()
                iframeDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <style>${style}</style>
              </head>
              <body>
                ${markup}
                <script>
                  window.data = {};
                  window.addEventListener('message', (event) => {
                    window.data = event.data
                  })
                  ${script}
                <\/script>
              </body>
            </html>
          `)
                iframeDoc.close()
            }
        }
    }

    const sendDataToIframe = () => {
        if (iframeRef && iframeRef.contentWindow) {
            iframeRef.contentWindow.postMessage(data, "*")
        }
    }

    $: loadContent()
    $: sendDataToIframe()
</script>

<div class="sandbox">
    <iframe title="Sandbox" bind:this={iframeRef} width={dimensions.width} height={dimensions.height} sandbox="allow-scripts allow-same-origin"> </iframe>
</div>

<style lang="scss">
    .sandbox {
        border: 1px solid #ccc;
    }
</style>
