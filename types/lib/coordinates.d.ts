import type { ScaledRect, ViewportRect } from '../types';
/**
 * 坐标转换所需的 viewport 最小结构
 */
export interface ViewportLike {
    width: number;
    height: number;
    convertToViewportRectangle(rect: number[]): number[];
    convertToPdfPoint(x: number, y: number): number[];
}
export declare const viewportToScaled: (rect: ViewportRect, { width, height }: {
    width: number;
    height: number;
}) => ScaledRect;
export declare const scaledToViewport: (scaled: ScaledRect, viewport: ViewportLike, usePdfCoordinates?: boolean) => ViewportRect;
