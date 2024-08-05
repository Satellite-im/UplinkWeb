<script>
</script>

<div class="spinner-container">
    <div class="spinner"></div>
</div>

<style>
    .spinner {
        border: 16px solid #f3f3f3;
        border-top: 16px solid #3498db;
        border-radius: 50%;
        width: 120px;
        height: 120px;
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .spinner-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
</style>
