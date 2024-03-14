<script>
    import '/src/lib/style/global.scss'

    import TimeAgo from 'javascript-time-ago'
    import en from 'javascript-time-ago/locale/en'

    TimeAgo.addDefaultLocale(en)
</script><slot></slot>