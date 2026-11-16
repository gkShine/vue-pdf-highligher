import type { PDFPageProxy } from 'pdfjs-dist';
type __VLS_Props = {
    /** pdf.getPage 返回的 PDFPageProxy */
    page: PDFPageProxy;
    focusedPage?: number;
    scrollTop?: number;
    clientHeight?: number;
    enablePageJump?: boolean;
};
declare var __VLS_1: {
    isPageFocused: boolean;
    isElementFocused: boolean;
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    pageJump: (scrollTop: number) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onPageJump?: ((scrollTop: number) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
