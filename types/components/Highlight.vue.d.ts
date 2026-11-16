import type { HighlightComment, ViewportPosition } from '../types';
type __VLS_Props = {
    isGhost?: boolean;
    isScrolledTo?: boolean;
    position: ViewportPosition;
    comment?: HighlightComment;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    click: (event: MouseEvent) => any;
    mouseout: (event: MouseEvent) => any;
    mouseover: (event: MouseEvent) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClick?: ((event: MouseEvent) => any) | undefined;
    onMouseout?: ((event: MouseEvent) => any) | undefined;
    onMouseover?: ((event: MouseEvent) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
