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
  >
    <div class="area-highlight__inner"></div>
  </vue-drag-resize>
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
@import "../assets/vars";
.area-highlight {
  cursor: pointer;
  border: $--highlight-selection-outer-border;

  .area-highlight__inner {
    @include mix-fullscreen;
    background: rgba($--highlight-color, $--highlight-selection-background-opacity);
    border: $--highlight-selection-border-width solid $--highlight-color;
    mix-blend-mode: multiply;
  }

  &.highlight--scrolled-to {
    .area-highlight__inner {
      border-color: $--highlight-active-color;
      background: rgba($--highlight-active-color, $--highlight-selection-background-opacity);
    }
  }
}
</style>
