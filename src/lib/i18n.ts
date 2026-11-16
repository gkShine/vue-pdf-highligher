type Messages = Record<string, string>

const messages: Messages = {
  'hint-message': 'Click and Drag',
  delete: 'DELETE',
  save: 'SAVE',
  cancel: 'CANCEL',
  add: 'NEW',
  placeholder: 'Add a Comment...',
  'outline-tab': '目录',
  'thumbnail-tab': '缩略图',
  'bookmark-tab': '文档大纲',
  'outline-empty': '此文档没有大纲',
  'page-jump-label': '页码',
  'page-jump-separator': ' / '
}

export interface I18n {
  t: (key: string) => string
  set: (overrides?: Messages) => void
}

const i18n: I18n = {
  t(key: string): string {
    return messages[key] ?? key
  },
  set(overrides: Messages = {}): void {
    Object.assign(messages, overrides)
  }
}

export default i18n
