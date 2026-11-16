import 'pdfjs-dist/web/pdf_viewer.css'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs'
import {
  PDFViewer,
  PDFLinkService,
  EventBus
} from 'pdfjs-dist/web/pdf_viewer.mjs'
import PdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker&inline'

// 使用内联 Worker，保证库产物为单文件、无需额外配置 worker 路径
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfjsWorker()

export { PDFViewer, PDFLinkService, EventBus }
export default pdfjsLib
