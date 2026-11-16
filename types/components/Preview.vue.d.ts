import type { PageInfo } from '@embedpdf/vue/runtime';
type __VLS_Props = {
    scale?: number;
    currentPage?: number;
    pageCount?: number;
    isPreviewEnabled?: boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "pages-fetch": (currentPage?: number | undefined) => any;
    "page-focus": (pageNumber: number) => any;
    "thumbnail-rendered": (payload: {
        page: PageInfo;
        text: string;
    }) => any;
    "thumbnail-errored": (payload: {
        response: unknown;
        page: PageInfo;
        text: string;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onPages-fetch"?: ((currentPage?: number | undefined) => any) | undefined;
    "onPage-focus"?: ((pageNumber: number) => any) | undefined;
    "onThumbnail-rendered"?: ((payload: {
        page: PageInfo;
        text: string;
    }) => any) | undefined;
    "onThumbnail-errored"?: ((payload: {
        response: unknown;
        page: PageInfo;
        text: string;
    }) => any) | undefined;
}>, {
    pageCount: number;
    currentPage: number;
    scale: number;
    isPreviewEnabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
