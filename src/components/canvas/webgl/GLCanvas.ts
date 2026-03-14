import Tempus from 'tempus'
import * as THREE from 'three'
import { Canvas } from '../Canvas'
import { Display } from './display/Display'

export class GLCanvas {
  private readonly renderer: THREE.WebGLRenderer

  private readonly display: Display
  private readonly disconnectResizeObserver: () => void
  private readonly unsubscribeAnimationLoop?: () => void

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = this.createRenderer(canvas)

    this.display = new Display(this.renderer)

    this.disconnectResizeObserver = this.resize()
    this.unsubscribeAnimationLoop = Tempus.add(this.render.bind(this))
  }

  private createRenderer(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    return renderer
  }

  private resize() {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { inlineSize: width, blockSize: height } = entry.contentBoxSize[0]
        this.renderer.setSize(width, height)
        this.display.resize(width, height)
      }
    })
    resizeObserver.observe(Canvas.Element!)
    return resizeObserver.disconnect
  }

  private render() {
    this.display.render()
  }

  dispose() {
    this.disconnectResizeObserver()
    this.unsubscribeAnimationLoop?.()
  }
}
