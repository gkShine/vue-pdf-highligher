export interface PageNode {
  node: HTMLElement
  number: number
}

export const getPageFromElement = (target: HTMLElement | null): PageNode | null => {
  const node = target?.closest('.page')

  if (!(node instanceof HTMLElement)) {
    return null
  }

  const number = Number(node.dataset.pageNumber)

  return { node, number }
}

export const getPageFromRange = (range: Range): PageNode | null => {
  const parentElement = range.startContainer.parentNode

  if (!(parentElement instanceof HTMLElement)) {
    return null
  }

  return getPageFromElement(parentElement)
}
