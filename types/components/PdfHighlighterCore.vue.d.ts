import type { PdfViewerHandle } from '../lib/viewer-handle';
import type { Highlight, HighlightComment, HighlightContent, ScaledPosition, ScaledRect } from '../types';
type __VLS_Props = {
    highlights?: Highlight[];
    isActive?: boolean;
    editable?: boolean;
    readOnly?: boolean;
    enableAreaSelection?: (event: MouseEvent) => boolean;
    scrollMargin?: number;
    visibleSlide?: boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {
    handleCommand: (command: string, factor?: number) => void;
    scrollTo: (highlight: Highlight) => void;
    hideTipAndSelection: () => void;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
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
    visibleSlide: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
