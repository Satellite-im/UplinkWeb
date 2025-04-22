<script lang="ts">
    import { onDestroy } from "svelte"
    import QrScanner from "qr-scanner" // Import the QR scanner library
    import { createEventDispatcher } from "svelte"
    import Button from "$lib/elements/Button.svelte"
    import { Shape } from "$lib/enums"
    import { Icon } from "$lib/elements"

    let videoElement: HTMLVideoElement
    let qrScanner: QrScanner | null = null

    let startScanning: boolean = false

    const dispatch = createEventDispatcher()

    onDestroy(() => {
        if (qrScanner) {
            qrScanner.stop()
            qrScanner.destroy()
            qrScanner = null
        }
    })

    $: {
        if (videoElement && startScanning) {
            qrScanner = new QrScanner(
                videoElement,
                result => {
                    dispatch("scanned", result.data)
                    qrScanner?.stop()
                    qrScanner?.destroy()
                    qrScanner = null
                },
                {
                    returnDetailedScanResult: true,
                }
            )
            qrScanner.start()
        }
    }
</script>

{#if startScanning}
    <div class="qr">
        <div class="qr-scanner-section">
            <!-- svelte-ignore a11y-media-has-caption -->
            <video bind:this={videoElement} autoplay playsinline></video>
            <div class="viewfinder">
                <div class="corner top-left"></div>
                <div class="corner top-right"></div>
                <div class="corner bottom-left"></div>
                <div class="corner bottom-right"></div>
            </div>
        </div>
    </div>
{:else}
    <Button on:click={() => (startScanning = !startScanning)} text="Scan QR">
        <Icon icon={Shape.QRCode} />
    </Button>
{/if}

<style lang="scss">
    .qr {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: var(--gap);
    }

    .qr-scanner-section {
        position: relative;
        width: 80%;
        padding-top: 80%; /* 1:1 Aspect Ratio */
        overflow: hidden;
        margin-top: var(--gap);
        border-radius: var(--border-radius);
    }

    .qr-scanner-section video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .viewfinder {
        position: absolute;
        top: var(--padding);
        left: var(--padding);
        bottom: var(--padding);
        right: var(--padding);
        pointer-events: none; /* Ensure the viewfinder doesn't block interactions */
    }

    .viewfinder .corner {
        position: absolute;
        width: 60px; /* Adjust the size of the corners as needed */
        height: 60px;
        border: 0.33rem solid var(--color-muted);
    }

    .viewfinder .top-left {
        top: 0;
        left: 0;
        border-right: none;
        border-bottom: none;
        border-bottom-right-radius: 10px; /* Add border-radius */
    }

    .viewfinder .top-right {
        top: 0;
        right: 0;
        border-left: none;
        border-bottom: none;
        border-bottom-left-radius: 10px; /* Add border-radius */
    }

    .viewfinder .bottom-left {
        bottom: 0;
        left: 0;
        border-right: none;
        border-top: none;
        border-top-right-radius: 10px; /* Add border-radius */
    }

    .viewfinder .bottom-right {
        bottom: 0;
        right: 0;
        border-left: none;
        border-top: none;
        border-top-left-radius: 10px; /* Add border-radius */
    }
</style>
