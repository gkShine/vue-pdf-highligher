<template>
  <div class="outline-item">
    <div
      class="outline-item__row"
      :class="{
        'outline-item__row--expandable': isExpandable,
        'outline-item__row--selected': isSelected
      }"
      :style="{ paddingLeft: depth * 14 + 8 + 'px' }"
    >
      <span
        v-if="isExpandable"
        class="outline-item__arrow"
        :class="{ 'outline-item__arrow--open': expanded }"
        @click.stop="toggleExpand"
      />
      <span v-else class="outline-item__arrow outline-item__arrow--empty" />
      <span
        class="outline-item__title"
        :title="item.title"
        @click="onTitleClick"
      >{{ item.title }}</span>
    </div>
    <template v-if="hasChildren && expanded">
      <OutlineItem
        v-for="(child, idx) in item.items"
        :key="idx"
        :item="child"
        :depth="depth + 1"
        :current-page="currentPage"
        @page-focus="emit('page-focus', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export interface OutlineNode {
  title: string
  pageNumber: number | null
  items: OutlineNode[]
}

const props = withDefaults(
  defineProps<{
    item: OutlineNode
    depth?: number
    currentPage?: number
  }>(),
  {
    depth: 0,
    currentPage: 1
  }
)

const emit = defineEmits<{
  'page-focus': [pageNumber: number]
}>()

const expanded = ref(props.depth < 2)

const hasChildren = computed(() => (props.item.items?.length ?? 0) > 0)

const isExpandable = computed(() => hasChildren.value)

const isSelected = computed(() => props.item.pageNumber === props.currentPage)

const toggleExpand = () => {
  if (isExpandable.value) {
    expanded.value = !expanded.value
  }
}

const onTitleClick = () => {
  if (props.item.pageNumber != null) {
    emit('page-focus', props.item.pageNumber)
  }
}
</script>

<style scoped lang="scss">
.outline-item {
  &__row {
    display: flex;
    align-items: center;
    min-height: 26px;
    padding-top: 2px;
    padding-bottom: 2px;
    border-radius: 4px;
    transition: background-color 0.1s;

    &--expandable {
      cursor: pointer;
    }

    &--selected {
      background-color: rgba(74, 144, 217, 0.15);

      .outline-item__title {
        color: #4A90D9;
        font-weight: 500;
      }
    }

    &:hover:not(.outline-item__row--selected) {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }

  &__arrow {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 4px;
    flex-shrink: 0;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23666'%3E%3Cpath d='M6 4l4 4-4 4V4z'/%3E%3C/svg%3E") no-repeat center;
    background-size: 14px;
    transition: transform 0.15s;
    cursor: pointer;
    opacity: 0.6;

    &--open {
      transform: rotate(90deg);
      opacity: 0.9;
    }

    &--empty {
      visibility: hidden;
    }

    &:hover {
      opacity: 1;
    }
  }

  &__title {
    flex: 1;
    font-size: 12px;
    line-height: 1.4;
    color: rgba(0, 0, 0, 0.7);
    word-break: break-word;
    padding: 2px 4px;
    border-radius: 3px;
    user-select: none;
    text-decoration: none;
  }
}
</style>
