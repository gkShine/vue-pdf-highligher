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
import { computed, onMounted, ref, watch } from 'vue'
import { pageRefsEqual, usePageList } from '@embedpdf/vue/runtime'
import type { PageInfo } from '@embedpdf/vue/runtime'
import { useOutline, useOutlineState } from '@embedpdf/vue/outline'
import type { OutlineItem as EmbedOutlineItem } from '@embedpdf/vue/outline'
import i18n from '../lib/i18n'
import OutlineItem, { type OutlineNode } from './OutlineItem.vue'

defineProps<{
  currentPage?: number
}>()

const emit = defineEmits<{
  'page-focus': [pageNumber: number]
}>()

const outlineCapability = useOutline()
const outlineState = useOutlineState()
const pageList = usePageList()

const error = ref<Error | null>(null)

const loading = computed(
  () => !error.value && (outlineState.status.value === 'idle' || outlineState.status.value === 'loading')
)

const resolvePageNumber = (item: EmbedOutlineItem, pages: readonly PageInfo[]): number | null => {
  const target = item.target
  if (!target || target.kind !== 'goto') return null

  const pageIndex = pages.findIndex(page => pageRefsEqual(page.ref, target.destination.page))
  return pageIndex >= 0 ? pageIndex + 1 : null
}

const buildTree = (items: readonly EmbedOutlineItem[], pages: readonly PageInfo[]): OutlineNode[] => {
  const roots: OutlineNode[] = []
  const nodes = new Map<number, OutlineNode>()

  // items 为深度优先顺序，父节点先于子节点出现
  for (const item of items) {
    const node: OutlineNode = {
      title: item.title || '',
      pageNumber: resolvePageNumber(item, pages),
      items: []
    }
    nodes.set(item.ref.objectNumber, node)

    if (item.parent) {
      nodes.get(item.parent.objectNumber)?.items.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

const outline = computed(() => buildTree(outlineState.items.value, pageList.value))

const onItemClick = (pageNumber: number | null) => {
  if (pageNumber != null) {
    emit('page-focus', pageNumber)
  }
}

watch(
  () => outlineState.status.value,
  status => {
    if (status === 'error') {
      error.value = new Error('Failed to load outline')
    }
  }
)

onMounted(() => {
  outlineCapability.ensureLoaded().catch((e: unknown) => {
    error.value = e instanceof Error ? e : new Error(String(e))
  })
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