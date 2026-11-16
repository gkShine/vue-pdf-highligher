/**
 * 视口坐标系下的矩形（CSS 像素，相对于页面左上角）
 */
export interface ViewportRect {
    left: number;
    top: number;
    width: number;
    height: number;
}
/**
 * PDF 缩放坐标系下的矩形（按页面宽高归一化存储）
 */
export interface ScaledRect {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
}
export interface ScaledPosition {
    boundingRect: ScaledRect;
    rects: ScaledRect[];
    pageNumber: number;
    /** 使用 PDF 原生坐标系（y 轴自下而上） */
    usePdfCoordinates?: boolean;
}
export interface ViewportPosition {
    boundingRect: ViewportRect;
    rects: ViewportRect[];
    pageNumber: number;
}
export interface HighlightComment {
    text?: string;
    emoji?: string;
}
export interface HighlightContent {
    /** 文本批注选中的文字 */
    text?: string;
    /** 框选批注的截图（dataURL） */
    image?: string;
}
export interface Highlight {
    /** 幽灵批注（未保存的临时批注）没有 id */
    id?: string | number;
    comment?: HighlightComment;
    content?: HighlightContent;
    position: ScaledPosition;
    /** 幽灵批注：刚创建尚未保存的临时批注 */
    isGhost?: boolean;
    className?: string;
    editable?: boolean;
}
/**
 * 转换为视口坐标后的批注（组件内部使用）
 */
export interface ViewportHighlight extends Omit<Highlight, 'position'> {
    position: ViewportPosition;
}
/**
 * Tip 弹层定位信息
 */
export interface TipPosition {
    left: number;
    top: number;
    bottom: number;
}
/**
 * 截图区域（视口坐标）
 */
export type AreaRect = ViewportRect;
