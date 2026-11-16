export interface OutlineNode {
    title: string;
    pageNumber: number | null;
    items: OutlineNode[];
}
type __VLS_Props = {
    item: OutlineNode;
    depth?: number;
    currentPage?: number;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "page-focus": (pageNumber: number) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onPage-focus"?: ((pageNumber: number) => any) | undefined;
}>, {
    currentPage: number;
    depth: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
