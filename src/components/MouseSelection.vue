<template>
  <div class="mouse-selection-container">
    <div
        v-if="start && end"
        class="mouse-selection"
        :style="formatStyle(getBoundingRect(start, end))"
    />
  </div>
</template>

<script>
export default {
  name: 'MouseSelection',
  props: {
    shouldStart: {
      type: Function,
      default: () => false
    }
  },
  data () {
    return {
      locked: false,
      start: null,
      end: null
    }
  },
  methods: {
    formatStyle (style) {
      const object = {}
      for (const key in style) {
        object[key] = style[key] + 'px'
      }
      return object
    },
    reset () {
      this.$emit('dragend')
      Object.assign(this, { start: null, end: null, locked: false })
    },
    shouldRender (boundingRect) {
      return boundingRect.width >= 1 && boundingRect.height >= 1
    },
    getBoundingRect (start, end) {
      return {
        left: Math.min(end.x, start.x),
        top: Math.min(end.y, start.y),

        width: Math.abs(end.x - start.x),
        height: Math.abs(end.y - start.y)
      }
    }
  },
  mounted () {
    const container = this.$el.parentElement

    if (!(container instanceof HTMLElement)) {
      return
    }

    let containerBoundingRect = null

    const containerCoords = (pageX, pageY) => {
      if (!containerBoundingRect) {
        containerBoundingRect = container.getBoundingClientRect()
      }

      return {
        x: pageX - containerBoundingRect.left + container.scrollLeft,
        y: pageY - containerBoundingRect.top + container.scrollTop
      }
    }

    container.addEventListener('mousemove', event => {
      const { start, locked } = this

      if (!start || locked) {
        return
      }

      this.end = containerCoords(event.pageX, event.pageY)
    })

    container.addEventListener('mousedown', (event) => {
      if (!this.shouldStart(event)) {
        this.reset()
        return
      }

      const startTarget = event.target

      if (!(startTarget instanceof HTMLElement)) {
        return
      }

      this.$emit('dragstart')

      Object.assign(this, {
        start: containerCoords(event.pageX, event.pageY),
        end: null,
        locked: false
      })

      const onMouseUp = event => {
        // emulate listen once
        event.currentTarget.removeEventListener('mouseup', onMouseUp)

        const { start } = this

        if (!start) {
          return
        }

        const end = containerCoords(event.pageX, event.pageY)

        const boundingRect = this.getBoundingRect(start, end)

        if (
          !(event.target instanceof HTMLElement) ||
          !container.contains(event.target) ||
          !this.shouldRender(boundingRect)
        ) {
          this.reset()
          return
        }

        this.end = end
        this.locked = true

        this.$nextTick(() => {
          const { start, end } = this

          if (!start || !end) {
            return
          }

          if (event.target instanceof HTMLElement) {
            this.$emit('selection', startTarget, boundingRect, this.reset)

            this.$emit('dragend')
          }
        })
      }

      if (document.body) {
        document.body.addEventListener('mouseup', onMouseUp)
      }
    })
  },
  updated () {
    const { start, end } = this

    const isVisible = Boolean(start && end)

    this.$emit('change', isVisible)
  }
}
</script>

<style scoped lang="scss">
@import "../assets/vars";
.mouse-selection {
  position: absolute;
  border: $--highlight-selection-border-width solid $--highlight-color;
  background: rgba($--highlight-color, .2);
  mix-blend-mode: multiply;
}
</style>
