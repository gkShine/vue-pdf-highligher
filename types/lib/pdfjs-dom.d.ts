export interface PageNode {
    node: HTMLElement;
    number: number;
}
export declare const getPageFromElement: (target: HTMLElement | null) => PageNode | null;
export declare const getPageFromRange: (range: Range) => PageNode | null;
