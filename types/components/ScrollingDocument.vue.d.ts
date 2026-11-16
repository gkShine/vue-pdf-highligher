import type { PageInfo } from '@embedpdf/vue/runtime';
type __VLS_Props = {
    pages: readonly PageInfo[];
    enablePageJump?: boolean;
    currentPage?: number;
    isParentVisible?: boolean;
};
declare const __VLS_template: () => {
    __VLS_Slots: {
        default?: (props: {
            page: PageInfo;
            isPageFocused: boolean;
            isElementFocused: boolean;
        }) => any;
    };
};
type __VLS_Slots = ReturnType<typeof __VLS_template>['__VLS_Slots'];
declare const __VLS_base: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
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
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
