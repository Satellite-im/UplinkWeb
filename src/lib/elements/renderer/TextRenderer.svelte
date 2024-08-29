<!-- Wraps emojis for plain texts -->
<script>
    import { wrapEmoji } from "$lib/components/utils/Emoji"
    import { formatStyledText } from "$lib/utils/Functions"

    export let raw
</script>

{@html formatStyledText(wrapEmoji(raw))}
