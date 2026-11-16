import type { PdfRect } from '@embedpdf/engine';
import type { ScaledRect, ViewportRect } from '../types';
/**
 * 坐标转换所需的页面尺寸（PDF point，未旋转的 crop 尺寸）。
 * usePdfCoordinates 数据还需要页面的 PDF 原生 cropBox。
 */
export interface ViewportLike {
    width: number;
    height: number;
    pdfCropBox?: PdfRect;
}
export declare const viewportToScaled: (rect: ViewportRect, { width, height }: {
    width: number;
    height: number;
}) => ScaledRect;
export declare const scaledToViewport: (scaled: ScaledRect, viewport: ViewportLike, usePdfCoordinates?: boolean) => ViewportRect;
