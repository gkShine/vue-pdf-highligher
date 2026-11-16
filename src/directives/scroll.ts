import { throttle } from 'lodash'
import type { Directive, DirectiveBinding } from 'vue'

const handlers = new WeakMap<HTMLElement, () => void>()

const mounted = (el: HTMLElement, binding: DirectiveBinding) => {
  const callback = binding.value as () => void

  if (binding.modifiers.immediate) {
    callback()
  }

  const throttledScroll = throttle(callback, 300)
  el.addEventListener('scroll', throttledScroll, true)
  handlers.set(el, throttledScroll)
}

const unmounted = (el: HTMLElement) => {
  const handler = handlers.get(el)
  if (handler) {
    el.removeEventListener('scroll', handler, true)
    handlers.delete(el)
  }
}

const vScroll: Directive<HTMLElement, () => void> = {
  mounted,
  unmounted
}

export default vScroll
