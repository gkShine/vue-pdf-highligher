import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
type __VLS_Props = {
    pdfDocument: PDFDocumentProxy;
    scale?: number;
    currentPage?: number;
    pageCount?: number;
    isPreviewEnabled?: boolean;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "pages-fetch": (currentPage?: number | undefined) => any;
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
    "onPages-fetch"?: ((currentPage?: number | undefined) => any) | undefined;
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
}>, {
    currentPage: number;
    scale: number;
    pageCount: number;
    isPreviewEnabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
