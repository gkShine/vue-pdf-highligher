<template>
  <div id="app">
    <PdfHighlighter ref="pdf" url="/demo.pdf" :highlights="highlights" c-map-url="/cmaps/" :enable-area-selection="event => event.altKey" @loaded="handleConsole" @change="handleConsole"/>
    <div style="position: absolute; z-index: 100">
      <button @click="$refs.pdf.handleCommand('zoomIn')">放大</button>
      <button @click="$refs.pdf.handleCommand('zoomOut')">缩小</button>
    </div>
  </div>
</template>

<script>
import '../dist/style.css'
import PdfHighlighter from '../dist/index'
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
