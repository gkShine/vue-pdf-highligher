import type { VNode } from 'vue';
import type { ViewportHighlight, ViewportRect } from '../types';
type __VLS_Props = {
    highlight: ViewportHighlight;
    isScrolledTo?: boolean;
    editable?: boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    delete: (highlight: ViewportHighlight) => any;
    change: (boundingRect: ViewportRect) => any;
    select: (highlight: ViewportHighlight) => any;
    mouseOut: () => any;
    mouseOver: (content: VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onDelete?: ((highlight: ViewportHighlight) => any) | undefined;
    onChange?: ((boundingRect: ViewportRect) => any) | undefined;
    onSelect?: ((highlight: ViewportHighlight) => any) | undefined;
    onMouseOut?: (() => any) | undefined;
    onMouseOver?: ((content: VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>) => any) | undefined;
}>, {
    editable: boolean;
    isScrolledTo: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
