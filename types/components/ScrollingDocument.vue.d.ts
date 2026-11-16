import type { PDFPageProxy } from 'pdfjs-dist';
type __VLS_Props = {
    pages: PDFPageProxy[];
    enablePageJump?: boolean;
    currentPage?: number;
    isParentVisible?: boolean;
};
declare var __VLS_8: {
    page: import("pdfjs-dist/types/src/display/api").PDFPageProxy;
    isPageFocused: boolean;
    isElementFocused: boolean;
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_8) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "pages-fetch": (currentPage?: number | undefined) => any;
    "pages-reset": () => any;
    "page-jump": (scrollTop: number) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onPages-fetch"?: ((currentPage?: number | undefined) => any) | undefined;
    "onPages-reset"?: (() => any) | undefined;
    "onPage-jump"?: ((scrollTop: number) => any) | undefined;
}>, {
    enablePageJump: boolean;
    currentPage: number;
    isParentVisible: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
