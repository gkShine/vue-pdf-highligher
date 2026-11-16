// portable 入口：wasm/worker 全部内联，UMD 单文件产物不依赖外部资产
import { localEngine } from '@embedpdf/engine/portable'
import { stagePlugin } from '@embedpdf/vue/stage'
import { renderPlugin } from '@embedpdf/vue/render'
import { interactionPlugin } from '@embedpdf/vue/interaction'
import { selectionPlugin } from '@embedpdf/vue/selection'
import { outlinePlugin } from '@embedpdf/vue/outline'
import { linkPlugin } from '@embedpdf/vue/link'
import type { AnyPlugin } from '@embedpdf/vue/runtime'

// 模块级单例：Viewer 借用而不销毁，多个实例共享同一 PDFium worker
// encoderWorker 用内联 blob，避免依赖外部 encoder-worker.js 文件
export const engine = localEngine({ encoderWorker: 'inline' })

export const plugins: AnyPlugin[] = [
  stagePlugin({
    minZoom: 0.1,
    maxZoom: 10,
    padding: 10
  }),
  renderPlugin(),
  interactionPlugin(),
  selectionPlugin(),
  outlinePlugin(),
  linkPlugin()
]