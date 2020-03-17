<template>
  <div id="app">
    <PdfHighlighter url="/demo.pdf" read-only :highlights="highlights" :enable-area-selection="event => event.altKey"/>
  </div>
</template>

<script>
import PdfHighlighter from '../src/index'
export default {
  components: { PdfHighlighter },
  data () {
    return {
      highlights: []
    }
  },
  computed: {},
  methods: {
  },
  mounted () {
  }
}
</script>

<style lang="scss">

</style>
