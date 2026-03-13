import { OverlayScrollbars } from 'overlayscrollbars'
import { media } from './media'

const scrollbars: WeakMap<HTMLElement, OverlayScrollbars> = new WeakMap()

function createOverlayScrollbars(target: HTMLElement) {
  const theme = target.dataset.scrollbarTheme === 'light' ? 'os-theme-light' : 'os-theme-dark'
  const scrollbar = OverlayScrollbars(target, { scrollbars: { autoHide: 'scroll', theme }, overflow: { x: 'hidden' } })
  scrollbars.set(target, scrollbar)
  return scrollbar
}

function getScrollbar(target: HTMLElement) {
  return scrollbars.get(target)
}

if (!media.isTouch) {
  createOverlayScrollbars(document.body)
}

export { createOverlayScrollbars, getScrollbar }
