import type { ViewportRect } from '../types';
type __VLS_Props = {
    x: number;
    y: number;
    w: number;
    h: number;
    disabled?: boolean;
};
declare const __VLS_template: () => {
    __VLS_Slots: {
        default?: (props: {}) => any;
    };
};
type __VLS_Slots = ReturnType<typeof __VLS_template>['__VLS_Slots'];
declare const __VLS_base: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    dragstop: (rect: ViewportRect) => any;
    resizestop: (rect: ViewportRect) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onDragstop?: ((rect: ViewportRect) => any) | undefined;
    onResizestop?: ((rect: ViewportRect) => any) | undefined;
}>, {
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
