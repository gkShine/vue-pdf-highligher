import type { ViewportRect } from '../types';
interface Point {
    x: number;
    y: number;
}
type __VLS_Props = {
    shouldStart?: (event: MouseEvent) => boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {
    reset: () => void;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    change: (isVisible: boolean) => any;
    dragend: () => any;
    dragstart: () => any;
    selection: (startPoint: Point, boundingRect: ViewportRect, reset: () => void) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: ((isVisible: boolean) => any) | undefined;
    onDragend?: (() => any) | undefined;
    onDragstart?: (() => any) | undefined;
    onSelection?: ((startPoint: Point, boundingRect: ViewportRect, reset: () => void) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
