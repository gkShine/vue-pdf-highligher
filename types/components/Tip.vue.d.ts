import type { HighlightComment } from '../types';
declare const _default: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    cancel: () => any;
    open: () => any;
    confirm: (comment: HighlightComment) => any;
}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{
    onCancel?: (() => any) | undefined;
    onOpen?: (() => any) | undefined;
    onConfirm?: ((comment: HighlightComment) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
