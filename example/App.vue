<template>
  <div id="app">
    <PdfHighlighter url="/demo.pdf" :highlights="highlights" :enable-area-selection="event => event.altKey" @loaded="handleConsole" @change="handleConsole"/>
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
    handleConsole (e) {
      console.log(e)
    }
  },
  mounted () {
  }
}
</script>

<style lang="scss">

</style>
