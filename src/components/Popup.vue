<template>
  <div @mouseover="handleMouseOver" @mouseout="mouseIn = false" @click="handleClick" :class="highlight.className">
    <area-highlight
        v-if="highlight.content && highlight.content.image"
        :is-scrolled-to="isScrolledTo"
        :highlight="highlight"
        :editable="editable"
        :is-ghost="highlight.isGhost"
        @change="handleChange"
    />
    <highlight
        v-else
        :is-ghost="highlight.isGhost"
        :is-scrolled-to="isScrolledTo"
        :position="highlight.position"
        :comment="highlight.comment"
    />
  </div>
</template>

<script>
import MouseMonitor from './MouseMonitor'
import Highlight from './Highlight'
import AreaHighlight from './AreaHighlight'

export default {
  name: 'Popup',
  // eslint-disable-next-line vue/no-unused-components
  components: { AreaHighlight, Highlight, MouseMonitor },
  props: {
    editable: Boolean,
    highlight: Object,
    isScrolledTo: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      mouseIn: false
    }
  },
  computed: {
    comment () {
      return this.highlight.comment || {}
    }
  },
  methods: {
    handleMouseAway () {
      if (this.mouseIn) {
        return
      }
      this.$emit('mouseOut')
    },
    handleDelete () {
      this.$emit('delete', this.highlight)
    },
    handleClick () {
      this.$emit('select', this.highlight)
    },
    handleMouseOver () {
      this.mouseIn = true
      this.$emit('mouseOver', this.$createElement('mouse-monitor', {
        props: {
          paddingX: 60,
          paddingY: 30,
          comment: this.comment,
          editable: this.highlight.editable
        },
        on: {
          mouseAway: this.handleMouseAway,
          delete: this.handleDelete
        }
      }))
    },
    handleChange (boundingRect) {
      this.$emit('change', boundingRect)
    }
  }
}
</script>
