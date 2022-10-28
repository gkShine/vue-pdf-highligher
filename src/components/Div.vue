<template>
  <div :class="className"><slot /></div>
</template>

<script>
export default {
  name: 'Block',
  data () {
    return {
      className: ''
    }
  }
}
</script>
