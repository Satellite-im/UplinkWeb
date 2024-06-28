<!-- Wraps emojis for plain texts -->
<script>
    import { wrapEmoji } from "$lib/components/utils/Emoji"

    export let raw
</script>

{@html wrapEmoji(raw)}
