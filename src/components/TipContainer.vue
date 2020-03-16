<template>
  <div class="pdf-highlighter__tip-container" :style="{
    visibility: isStyleCalculationInProgress ? 'hidden' : 'visible',
    top: top + 'px',
    left: left + 'px'
  }" ><slot /></div>
</template>

<script>
export default {
  name: 'TipContainer',
  props: {
    position: Object,
    scrollTop: {
      type: Number,
      default: 0
    },
    pageBoundingRect: Object
  },
  data () {
    return {
      height: 0,
      width: 0
    }
  },
  computed: {
    isStyleCalculationInProgress () {
      const { width, height } = this
      return width === 0 && height === 0
    },
    top () {
      const { position = {}, scrollTop, height } = this
      const shouldMove = position.top - height - 5 < scrollTop

      return shouldMove ? position.bottom + 5 : position.top - height - 5
    },
    left () {
      const { position, width } = this
      return position.left - width / 2
      // const { clamp, position, width, pageBoundingRect = {} } = this
      // return clamp(
      //   position.left - width / 2,
      //   0,
      //   pageBoundingRect.width - width
      // )
    }
  },
  methods: {
    clamp (value, left, right) {
      return Math.min(Math.max(value, left), right)
    },
    updatePosition () {
      const { offsetHeight, offsetWidth } = this.$el

      this.height = offsetHeight
      this.width = offsetWidth
    }
  },
  mounted () {
    this.$nextTick(() => this.updatePosition())
  }
}
</script>

<style scoped>
.pdf-highlighter__tip-container {
  z-index: 6;
  position: absolute;
}
</style>
