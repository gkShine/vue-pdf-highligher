import type { PageInfo } from '@embedpdf/vue/runtime';
type __VLS_Props = {
    /** EmbedPDF 页面布局信息（usePageList 返回项） */
    page: PageInfo;
    focusedPage?: number;
    scrollTop?: number;
    clientHeight?: number;
    enablePageJump?: boolean;
};
declare const __VLS_template: () => {
    __VLS_Slots: {
        default?: (props: {
            isPageFocused: boolean;
            isElementFocused: boolean;
        }) => any;
    };
};
type __VLS_Slots = ReturnType<typeof __VLS_template>['__VLS_Slots'];
declare const __VLS_base: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    pageJump: (scrollTop: number) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onPageJump?: ((scrollTop: number) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
