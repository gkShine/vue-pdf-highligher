import type { PDFPageProxy } from 'pdfjs-dist';
type __VLS_Props = {
    /** pdf.getPage 返回的 PDFPageProxy */
    page: PDFPageProxy;
    scale: number;
    isPageFocused?: boolean;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "page-focus": (pageNumber: number) => any;
    "thumbnail-rendered": (payload: {
        page: PDFPageProxy;
        text: string;
    }) => any;
    "thumbnail-errored": (payload: {
        response: unknown;
        page: PDFPageProxy;
        text: string;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onPage-focus"?: ((pageNumber: number) => any) | undefined;
    "onThumbnail-rendered"?: ((payload: {
        page: PDFPageProxy;
        text: string;
    }) => any) | undefined;
    "onThumbnail-errored"?: ((payload: {
        response: unknown;
        page: PDFPageProxy;
        text: string;
    }) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
