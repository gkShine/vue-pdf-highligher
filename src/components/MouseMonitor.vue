<template>
  <div>
    <div v-if="comment && comment.text" class="highlight__popup" :class="{'with-ops' : editable}">
      {{ comment.emoji }} {{ comment.text }}
      <div v-if="editable" class="ops">
        <a @click="$emit('delete')">{{ i18n.t('delete') }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import i18n from '@/lib/i18n'
export default {
  name: 'MouseMonitor',
  props: {
    paddingX: {
      type: Number,
      default: 0
    },
    paddingY: {
      type: Number,
      default: 0
    },
    comment: Object,
    editable: Boolean
  },
  data () {
    return {
      i18n
    }
  },
  methods: {
    handleMouseMove (event) {
      const { paddingX, paddingY } = this

      const { clientX, clientY } = event

      // TODO: see if possible to optimize
      const { left, top, width, height } = this.$el.getBoundingClientRect()

      const inBoundsX =
        clientX > left - paddingX && clientX < left + width + paddingX
      const inBoundsY =
        clientY > top - paddingY && clientY < top + height + paddingY

      const isNear = inBoundsX && inBoundsY

      if (!isNear) {
        this.$emit('mouseAway')
      }
    }
  },
  mounted () {
    document.addEventListener('mousemove', this.handleMouseMove)
  },
  beforeDestroy () {
    document.removeEventListener('mousemove', this.handleMouseMove)
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/vars";
.highlight__popup {
  background-color: $--highlight-content-background-color;
  color: #ffffff;
  opacity: 0.9;
  font-size: 14px;
  padding: 10px 10px;
  border-radius: 4px;
  max-width: 300px;
  max-height: 100px;

  &.with-ops {
    padding-bottom: 0;
  }

  .ops {
    text-align: center;

    a {
      color: rgba($--highlight-active-color, .9);
      cursor: pointer;
      padding: 8px 0;
      width: 100%;
      display: block;

      &:hover {
        color: $--highlight-active-color;
      }
    }
  }
}
</style>
