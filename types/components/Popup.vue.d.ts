import type { VNode } from 'vue';
import type { ViewportHighlight, ViewportRect } from '../types';
type __VLS_Props = {
    highlight: ViewportHighlight;
    isScrolledTo?: boolean;
    editable?: boolean;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    delete: (highlight: ViewportHighlight) => any;
    select: (highlight: ViewportHighlight) => any;
    change: (boundingRect: ViewportRect) => any;
    mouseOut: () => any;
    mouseOver: (content: VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onDelete?: ((highlight: ViewportHighlight) => any) | undefined;
    onSelect?: ((highlight: ViewportHighlight) => any) | undefined;
    onChange?: ((boundingRect: ViewportRect) => any) | undefined;
    onMouseOut?: (() => any) | undefined;
    onMouseOver?: ((content: VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>) => any) | undefined;
}>, {
    editable: boolean;
    isScrolledTo: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
