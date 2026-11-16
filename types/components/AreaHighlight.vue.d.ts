import type { ViewportHighlight, ViewportRect } from '../types';
type __VLS_Props = {
    isGhost?: boolean;
    isScrolledTo?: boolean;
    highlight: ViewportHighlight;
    editable?: boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    change: (rect: ViewportRect) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: ((rect: ViewportRect) => any) | undefined;
}>, {
    editable: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
