import type { HighlightComment } from '../types';
type __VLS_Props = {
    paddingX?: number;
    paddingY?: number;
    comment?: HighlightComment;
    editable?: boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    delete: () => any;
    mouseAway: () => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onDelete?: (() => any) | undefined;
    onMouseAway?: (() => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
