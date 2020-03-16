<template>
  <div class="highlight" :class="{ 'highlight--scrolled-to': isScrolledTo }">
    <div
      v-if="comment"
      class="highlight__emoji"
      :style="formatStyle({ left: 20, top: position.boundingRect.top })"
    >
      {{ comment.emoji }}
    </div>
    <div class="highlight__parts">
      <div
        v-for="(rect, index) in position.rects"
        @mouseover="handleMouseOver"
        @mouseout="handleMouseOut"
        @click="handleClick"
        :key="index"
        :style="formatStyle(rect)"
        class="highlight__part"
        :class="{ 'is-ghost': isGhost }"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Highlight',
  props: {
    isGhost: Boolean,
    isScrolledTo: Boolean,
    position: Object,
    comment: Object
  },
  methods: {
    handleMouseOver (event) {
      this.$emit('mouseover', event)
    },
    handleMouseOut (event) {
      this.$emit('mouseout', event)
    },
    handleClick (event) {
      this.$emit('click', event)
    },
    formatStyle (style) {
      const object = {}
      for (const key in style) {
        object[key] = style[key] + 'px'
      }
      return object
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/vars";
.highlight {
  position: absolute;

  .highlight__emoji {
    position: absolute;
    color: black;
    opacity: 1;
    font-size: 28px;
  }

  .highlight__parts {
    opacity: 1;

    .highlight__part {
      cursor: pointer;
      position: absolute;
      border-bottom: 2px solid $--highlight-color;
      transition: background 0.3s;

      &.is-ghost {
        background: $--highlight-selection-color;
        border-bottom: 0;
      }
    }
  }

  &.highlight--scrolled-to .highlight__part {
    background: $--highlight-active-color;
    border-bottom-color: $--highlight-active-color;
  }

  &:hover {
    .highlight__parts {
      .highlight__part {
        background: $--highlight-color;
      }
    }

    &.highlight--scrolled-to .highlight__part {
      background: $--highlight-active-color;
    }
  }
}
</style>
