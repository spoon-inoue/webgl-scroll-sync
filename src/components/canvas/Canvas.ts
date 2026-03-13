import Tempus from 'tempus'
import { GLCanvas } from './webgl/GLCanvas'

export class Canvas extends HTMLElement {
  private static readonly NAME = 'webgl-canvas'

  static Define() {
    customElements.get(this.NAME) || customElements.define(this.NAME, this)
  }

  static get Element() {
    return document.querySelector<Canvas>(this.NAME)
  }

  private glCanvas?: GLCanvas

  private disposeAnime?: () => void

  connectedCallback() {
    if (!this.isConnected) return
    this.disposeAnime = Tempus.add(this.anime.bind(this))
    this.glCanvas = new GLCanvas(this.querySelector<HTMLCanvasElement>('canvas')!)
  }

  private anime() {
    this.style.setProperty('top', `${scrollY}px`)
  }

  disconnectedCallback() {
    this.disposeAnime?.()
    this.glCanvas?.dispose()
  }
}
