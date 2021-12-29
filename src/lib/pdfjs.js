import 'pdfjs-dist/web/pdf_viewer.css'
import {
  PDFViewer,
  PDFLinkService,
  EventBus
} from 'pdfjs-dist/web/pdf_viewer'

const pdfjs = require('pdfjs-dist')
pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry')

export {
  PDFViewer,
  PDFLinkService,
  EventBus
}

export default pdfjs
