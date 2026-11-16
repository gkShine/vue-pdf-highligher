import type { StageCapability } from '@embedpdf/vue/stage';
import type { RenderCapability } from '@embedpdf/vue/render';
import type { SelectionCapability } from '@embedpdf/vue/selection';
import type { ViewportRect } from '../types';
/**
 * loaded / change 事件载荷中的 viewer 句柄。
 * 替代旧版 pdfjs PDFViewer，包装 EmbedPDF 的常用控制方法。
 * 页码均为 1 起始。
 */
export interface PdfViewerHandle {
    /** 当前缩放比例（1 = 100%） */
    getScale(): number;
    zoomIn(): void;
    zoomOut(): void;
    zoomTo(level: number): void;
    fitWidth(): void;
    fitPage(): void;
    goToPage(pageNumber: number): void;
    /** 滚动到某页的指定区域（页面 point 坐标，左上角原点） */
    reveal(pageNumber: number, rect?: ViewportRect): void;
    getCurrentPage(): number;
    getPageCount(): number;
    /** 底层 EmbedPDF 能力，供高级用法 */
    readonly stage: StageCapability;
    readonly render: RenderCapability;
    readonly selection: SelectionCapability;
}
export declare const createViewerHandle: (stage: StageCapability, render: RenderCapability, selection: SelectionCapability) => PdfViewerHandle;
