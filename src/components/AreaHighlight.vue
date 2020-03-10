<template>
  <vue-drag-resize
    :is-active="editable"
    :prevent-active-behavior="!editable"
    :x="rect.left"
    :y="rect.top"
    :w="rect.width"
    :h="rect.height"
    class="area-highlight"
    :class="{'highlight--scrolled-to': isScrolledTo, 'is-ghost': isGhost}"
    @dragstop="handleChange"
    @resizestop="handleChange"
    @click.stop.prevent
  />
</template>

<script>
import VueDragResize from 'vue-drag-resize'

export default {
  name: 'AreaHighlight',
  components: { VueDragResize },
  props: {
    isGhost: Boolean,
    isScrolledTo: Boolean,
    highlight: Object,
    editable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    rect () {
      const { highlight } = this
      return highlight ? highlight.position.boundingRect : {}
    }
  },
  methods: {
    handleChange (rect) {
      this.$emit('change', rect)
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/vars";
.area-highlight {
  cursor: pointer;
  background: rgba($--highlight-color, .2);
  border: $--highlight-selection-border-width solid $--highlight-color;
  mix-blend-mode: multiply;

  &.highlight--scrolled-to {
    border-color: $--highlight-active-color;
    background: rgba($--highlight-active-color, .2);
  }
}
</style>
