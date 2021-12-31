import 'pdfjs-dist/legacy/web/pdf_viewer.css'
import {
  PDFViewer,
  PDFLinkService,
  EventBus
} from 'pdfjs-dist/legacy/web/pdf_viewer'

const pdfjs = require('pdfjs-dist/legacy/build/pdf')
pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.entry')

export {
  PDFViewer,
  PDFLinkService,
  EventBus
}

export default pdfjs
