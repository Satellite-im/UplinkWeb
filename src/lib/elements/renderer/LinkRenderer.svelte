<script>
    export let href = ""
    export let title = undefined
</script>

<a href={href} title={title} target="_blank"><slot></slot></a>
