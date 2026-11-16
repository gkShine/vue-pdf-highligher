import type { ViewportRect } from '../types';
type __VLS_Props = {
    shouldStart?: (event: MouseEvent) => boolean;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {
    reset: () => void;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    dragstart: () => any;
    dragend: () => any;
    change: (isVisible: boolean) => any;
    selection: (startTarget: HTMLElement, boundingRect: ViewportRect, reset: () => void) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onDragstart?: (() => any) | undefined;
    onDragend?: (() => any) | undefined;
    onChange?: ((isVisible: boolean) => any) | undefined;
    onSelection?: ((startTarget: HTMLElement, boundingRect: ViewportRect, reset: () => void) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
