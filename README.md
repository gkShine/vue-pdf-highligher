# vue-pdf-highlighter

`vue-pdf-highlighter` 是基于 [Vue 3](https://vuejs.org/) + TypeScript 的 PDF 批注组件库，构建于 Mozilla [PDF.js](https://github.com/mozilla/pdf.js) 之上。支持文本高亮与矩形框选批注，批注数据采用与视口无关的归一化坐标，适合保存到服务端。

## 技术栈

- Vue 3（`<script setup>` + Composition API）
- TypeScript（严格模式）
- Vite 6（开发服务器 + 库构建）
- pdf.js v6

## 本地开发

```bash
yarn install
yarn dev      # 启动 demo（http://localhost:8082）
```

## 构建

```bash
yarn build       # 类型声明生成 + 库构建（dist/、types/）
yarn type-check  # 仅做类型检查
```

构建产物：

- `dist/index.mjs` / `dist/index.js`：ES Module / UMD 产物（PDF.js worker 已内联，无需额外配置）
- `dist/style.css`：样式文件
- `types/`：TypeScript 类型声明

## 使用

```vue
<template>
  <PdfHighlighter
    ref="pdfRef"
    :url="pdfUrl"
    :highlights="highlights"
    :enable-area-selection="event => event.altKey"
    @add-highlight="onAddHighlight"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PdfHighlighter from 'pdf-highligher'
import 'pdf-highligher/style.css'
import type { Highlight } from 'pdf-highligher'

const pdfRef = ref<InstanceType<typeof PdfHighlighter> | null>(null)
const highlights = ref<Highlight[]>([])

const onAddHighlight = ({ content, position, comment }) => {
  highlights.value.push({
    id: Date.now(),
    content,
    position,
    comment
  })
}
</script>
```

通过 ref 调用组件方法：`pdfRef.value?.handleCommand('zoomIn' | 'zoomOut' | 'toggleSlide' | 'presentationMode')`、`pdfRef.value?.scrollTo(highlight)`。

## 说明

- PDF.js v6 已移除 SVG 渲染器，`renderer` 属性仅为向后兼容保留，实际统一使用 canvas 渲染。
- 文本批注：在文字上拖选后弹出操作气泡；矩形框选：按住 `Alt`（可通过 `enable-area-selection` 自定义）拖拽框选。

### FAQ

##### Can I get a new PDF with the highlights embedded into the document?

Take a look at https://pdf-lib.js.org.

##### I'm trying the demo with my PDF and it is not loading!

Please check the [CORS headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) on your url.
