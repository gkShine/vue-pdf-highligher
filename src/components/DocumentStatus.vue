<template>
  <!-- 无渲染组件：监听文档状态并向宿主派发 error/retry -->
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useDocument, useDocuments } from '@embedpdf/vue/runtime'

const props = defineProps<{
  url?: string
  password?: string
}>()

const emit = defineEmits<{
  error: [error: unknown, retry: (password?: string) => void]
}>()

const documents = useDocuments()
const document = useDocument()

watch(
  [() => document.status.value, () => document.passwordProvided.value],
  ([status]) => {
    const id = document.id.value
    if (!id) return

    if (status === 'locked') {
      const error = Object.assign(new Error('Document is password protected'), {
        name: 'PasswordException'
      })
      emit('error', error, (retryPassword?: string) => {
        void documents
          .unlock(id, { password: retryPassword ?? props.password ?? '' })
          .catch(() => {})
      })
    } else if (status === 'error') {
      emit('error', document.error.value ?? new Error('Failed to load document'), () => {
        void documents.retry(id).catch(() => {})
      })
    }
  }
)

watch(
  () => props.url,
  (url, oldUrl) => {
    if (url === oldUrl) return
    void documents
      .closeAll()
      .then(() => {
        if (url) {
          return documents.open({ kind: 'url', url }, { password: props.password })
        }
      })
      .catch(() => {})
  }
)
</script>