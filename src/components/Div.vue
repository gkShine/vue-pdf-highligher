<template>
  <div :class="className"><slot /></div>
</template>

<script>
export default {
  name: 'Div',
  data () {
    return {
      className: ''
    }
  }
}
</script>
