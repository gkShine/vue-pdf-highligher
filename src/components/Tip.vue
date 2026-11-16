<template>
  <div class="tip">
    <div v-if="compact" class="tip__compact">
      <a @click="handleClick">{{ i18n.t('add') }}</a>
      <a @click="handleCancel">{{ i18n.t('cancel') }}</a>
    </div>
    <form v-else class="tip__card" @submit.prevent="handleSubmit">
      <textarea
        ref="textareaRef"
        v-model="text"
        width="100%"
        :placeholder="i18n.t('placeholder')"
      />
      <div class="buttons">
        <button type="submit">{{ i18n.t('save') }}</button>
        <button type="button" @click="handleCancel">{{ i18n.t('cancel') }}</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import i18n from '../lib/i18n'
import type { HighlightComment } from '../types'

const emit = defineEmits<{
  open: []
  cancel: []
  confirm: [comment: HighlightComment]
}>()

const compact = ref(true)
const text = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const handleClick = () => {
  emit('open')
  compact.value = false
  nextTick(() => textareaRef.value?.focus())
}

const handleSubmit = () => {
  emit('confirm', { text: text.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped lang="scss">
.tip__compact {
  padding: 5px;

  a {
    cursor: pointer;
    background-color: #243247;
    opacity: 0.9;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 14px;

    &:last-child {
      margin-left: 6px;
      background-color: #F09E1F;
    }
  }
}

.tip__card {
  padding: 10px;
  background: #fff;
  background-clip: padding-box;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(37, 40, 43, 0.2);

  textarea {
    font-size: 14px;
    width: 220px;
    height: 80px;
    border: none;
    resize: none;
    outline: none;
  }

  .buttons {
    text-align: right;

    button {
      background: none;
      border: none;
      cursor: pointer;
      color: #999999;
      font-size: 14px;
      outline: none;

      &[type="submit"] {
        color: #4291EB;
      }

      &:hover {
        color: #66b1ff;
        background: none;
      }

      &:active {
        color: #4291EB;
        background: none;
      }
    }
  }
}
</style>
