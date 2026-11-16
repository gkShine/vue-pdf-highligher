import { nextTick, type Directive, type DirectiveBinding } from 'vue'

const instances = new WeakMap<HTMLElement, IntersectionObserver>()

const disconnectObserver = (el: HTMLElement) => {
  const observer = instances.get(el)
  if (observer) {
    observer.disconnect()
    instances.delete(el)
  }
}

const createObserver = (
  el: HTMLElement,
  modifiers: DirectiveBinding['modifiers'],
  callback: () => void
): IntersectionObserver => {
  const observer = new IntersectionObserver(entries => {
    const entry = entries[0]
    if (entry.isIntersecting) {
      callback()
      if (modifiers.once) {
        disconnectObserver(el)
      }
    }
  })

  // 元素插入 DOM 后再观察
  nextTick(() => observer.observe(el))

  return observer
}

const bindObserver = (el: HTMLElement, binding: DirectiveBinding) => {
  if (typeof window.IntersectionObserver === 'undefined') {
    console.warn('IntersectionObserver API is not available in your browser.')
    return
  }

  const callback = binding.value as (() => void) | undefined
  if (typeof callback !== 'function') return

  const observer = createObserver(el, binding.modifiers, callback)
  instances.set(el, observer)
}

const vVisible: Directive<HTMLElement, () => void> = {
  mounted(el, binding) {
    bindObserver(el, binding)
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return
    disconnectObserver(el)
    bindObserver(el, binding)
  },
  unmounted(el) {
    disconnectObserver(el)
  }
}

export default vVisible
