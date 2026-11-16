import type { VNode } from 'vue';
import type { PageContextValue } from '@embedpdf/vue/runtime';
import type { ViewportLike } from '../lib/coordinates';
import type { Highlight, ViewportRect } from '../types';
type __VLS_Props = {
    page: PageContextValue;
    /** 该页的高亮（ScaledPosition，含 ghost） */
    highlights: Highlight[];
    /** 页面 point 尺寸 */
    pageSize: ViewportLike;
    editable?: boolean;
    scrolledToId?: string | number;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    delete: (highlight: Highlight) => any;
    change: (highlight: Highlight, rect: ViewportRect) => any;
    select: (highlight: Highlight) => any;
    "mouse-over": (highlight: Highlight, content: VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>) => any;
    "mouse-out": () => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onDelete?: ((highlight: Highlight) => any) | undefined;
    onChange?: ((highlight: Highlight, rect: ViewportRect) => any) | undefined;
    onSelect?: ((highlight: Highlight) => any) | undefined;
    "onMouse-over"?: ((highlight: Highlight, content: VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>) => any) | undefined;
    "onMouse-out"?: (() => any) | undefined;
}>, {
    editable: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
