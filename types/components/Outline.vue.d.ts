import type { PDFDocumentProxy } from 'pdfjs-dist';
type __VLS_Props = {
    pdfDocument: PDFDocumentProxy;
    currentPage?: number;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "page-focus": (pageNumber: number) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onPage-focus"?: ((pageNumber: number) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
