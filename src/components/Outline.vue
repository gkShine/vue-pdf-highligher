<template>
  <div class="pdf-outline">
    <div v-if="loading" class="pdf-outline__status">Loading...</div>
    <div v-else-if="error" class="pdf-outline__status">Failed: {{ error.message || error }}</div>
    <div v-else-if="outline.length === 0" class="pdf-outline__status">
      {{ i18n.t('outline-empty') }}
    </div>
    <div v-else class="pdf-outline__tree">
      <OutlineItem
        v-for="(item, index) in outline"
        :key="index"
        :item="item"
        :depth="0"
        :current-page="currentPage"
        @page-focus="onItemClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import i18n from '../lib/i18n'
import OutlineItem, { type OutlineNode } from './OutlineItem.vue'

const props = defineProps<{
  pdfDocument: PDFDocumentProxy
  currentPage?: number
}>()

const emit = defineEmits<{
  'page-focus': [pageNumber: number]
}>()

const outline = ref<OutlineNode[]>([])
const loading = ref(true)
const error = ref<Error | null>(null)

interface RawOutlineItem {
  title?: string
  dest?: string | unknown[] | null
  items?: RawOutlineItem[]
}

const resolveDestination = async (dest: RawOutlineItem['dest']): Promise<number | null> => {
  if (!dest) return null

  let destArray: unknown = dest
  if (typeof dest === 'string') {
    try {
      destArray = await props.pdfDocument.getDestination(dest)
    } catch {
      return null
    }
  }

  if (!Array.isArray(destArray) || !destArray[0]) return null

  try {
    const pageRef = destArray[0]
    const pageIndex = await props.pdfDocument.getPageIndex(pageRef as never)
    return pageIndex + 1
  } catch {
    return null
  }
}

const resolveOutlineItems = async (items?: RawOutlineItem[]): Promise<OutlineNode[]> => {
  if (!items || !Array.isArray(items)) return []

  return Promise.all(
    items.map(async item => {
      const pageNumber = await resolveDestination(item.dest)
      const childItems = item.items ? await resolveOutlineItems(item.items) : []
      return {
        title: item.title || '',
        pageNumber,
        items: childItems
      }
    })
  )
}

const onItemClick = (pageNumber: number | null) => {
  if (pageNumber != null) {
    emit('page-focus', pageNumber)
  }
}

onMounted(async () => {
  try {
    const rawOutline = (await props.pdfDocument.getOutline()) as RawOutlineItem[] | null
    outline.value = await resolveOutlineItems(rawOutline || [])
  } catch (e) {
    error.value = e as Error
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.pdf-outline {
  padding: 6px 0;
  overflow-y: auto;
  height: 100%;
}

.pdf-outline__tree {
  padding: 2px 0;
}

.pdf-outline__status {
  padding: 20px 12px;
  color: rgba(0, 0, 0, 0.4);
  font-size: 12px;
  text-align: center;
}
</style>
