type Messages = Record<string, string>;
export interface I18n {
    t: (key: string) => string;
    set: (overrides?: Messages) => void;
}
declare const i18n: I18n;
export default i18n;
