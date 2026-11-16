import type { PdfViewerHandle } from '../lib/viewer-handle';
import type { Highlight, HighlightComment, HighlightContent, ScaledPosition, ScaledRect } from '../types';
type __VLS_Props = {
    url?: string;
    password?: string;
    /** 如何启用框选批注（返回 true 时按下鼠标开始框选） */
    enableAreaSelection?: (event: MouseEvent) => boolean;
    highlights?: Highlight[];
    /** 是否激活 */
    isActive?: boolean;
    /** 允许更新高亮 */
    editable?: boolean;
    /** 只读模式: 只初始化 pdf 预览，不提供批注交互 */
    readOnly?: boolean;
    /**
     * 渲染方式。EmbedPDF 统一使用 PDFium 光栅渲染，
     * 保留该属性仅为向后兼容。
     */
    renderer?: 'canvas' | 'svg';
    lang?: Record<string, string>;
    /** EmbedPDF (PDFium) 内置 CJK 支持，保留该属性仅为向后兼容 */
    cMapUrl?: string;
    scrollMargin?: number;
    withCredentials?: boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {
    handleCommand: (command: string, factor?: number) => void;
    scrollTo: (highlight: Highlight) => void;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    error: (error: unknown, retry: (password?: string) => void) => any;
    change: (payload: {
        viewer: PdfViewerHandle;
        page: {
            current: number;
            total: number;
        };
    }) => any;
    scroll: () => any;
    loaded: (payload: {
        viewer: PdfViewerHandle;
        page: {
            current: number;
            total: number;
        };
    }) => any;
    "add-highlight": (payload: {
        content: HighlightContent;
        position: ScaledPosition;
        comment: HighlightComment;
    }) => any;
    "update-highlight": (id: string | number, position: {
        boundingRect: ScaledRect;
    }, content: {
        image: string;
    }) => any;
    "remove-highlight": (highlight: Highlight) => any;
    "select-highlight": (highlight: Highlight) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onError?: ((error: unknown, retry: (password?: string) => void) => any) | undefined;
    onChange?: ((payload: {
        viewer: PdfViewerHandle;
        page: {
            current: number;
            total: number;
        };
    }) => any) | undefined;
    onScroll?: (() => any) | undefined;
    onLoaded?: ((payload: {
        viewer: PdfViewerHandle;
        page: {
            current: number;
            total: number;
        };
    }) => any) | undefined;
    "onAdd-highlight"?: ((payload: {
        content: HighlightContent;
        position: ScaledPosition;
        comment: HighlightComment;
    }) => any) | undefined;
    "onUpdate-highlight"?: ((id: string | number, position: {
        boundingRect: ScaledRect;
    }, content: {
        image: string;
    }) => any) | undefined;
    "onRemove-highlight"?: ((highlight: Highlight) => any) | undefined;
    "onSelect-highlight"?: ((highlight: Highlight) => any) | undefined;
}>, {
    editable: boolean;
    highlights: Highlight[];
    isActive: boolean;
    readOnly: boolean;
    renderer: "canvas" | "svg";
    withCredentials: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
