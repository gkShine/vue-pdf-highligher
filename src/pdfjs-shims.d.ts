/**
 * pdfjs-dist v6 未配置 exports/typesVersions，子路径导入缺少类型声明。
 * 这里补充组件实际使用到的 API 类型。
 */
declare module 'pdfjs-dist/build/pdf.mjs' {
  export * from 'pdfjs-dist/types/src/pdf'
}

declare module 'pdfjs-dist/web/pdf_viewer.mjs' {
  export class EventBus {
    on(eventName: string, listener: (...args: any[]) => void): void
    off(eventName: string, listener: (...args: any[]) => void): void
    dispatch(eventName: string, data?: unknown): void
  }

  export class PDFLinkService {
    setDocument(pdfDocument: unknown): void
    setViewer(viewer: unknown): void
  }

  export interface PDFViewerOptions {
    container: HTMLElement
    viewer?: HTMLElement
    eventBus: EventBus
    linkService?: PDFLinkService
    removePageBorders?: boolean
    textLayerMode?: number
    [option: string]: unknown
  }

  export class PDFViewer {
    constructor(options: PDFViewerOptions)
    container: HTMLElement
    viewer: HTMLElement | null
    currentScale: number
    currentScaleValue: string
    setDocument(pdfDocument: unknown): void
    getPageView(index: number): any
    scrollPageIntoView(options: object): void
  }
}
