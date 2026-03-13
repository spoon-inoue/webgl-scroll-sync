import * as THREE from 'three'
import { RawShaderMaterial } from '../modules/ExtendedMaterials'
import fragmentShader from './shader/display.fs'
import vertexShader from './shader/display.vs'
import { Canvas } from '@components/canvas/Canvas'

type ThumbnailMap = WeakMap<HTMLElement, THREE.Mesh<THREE.PlaneGeometry, RawShaderMaterial>>

export class Display {
  private readonly scene: THREE.Scene
  private readonly camera: THREE.OrthographicCamera
  private readonly thumbnailMap: ThumbnailMap
  private readonly thumbnails: HTMLElement[]

  constructor(private readonly renderer: THREE.WebGLRenderer) {
    this.scene = new THREE.Scene()
    this.camera = this.createCamera()

    this.thumbnails = Array.from(document.querySelectorAll<HTMLElement>('.contents .card .thumbnail'))
    this.thumbnailMap = this.create(this.thumbnails)

    this.loadTextures(this.thumbnails, this.thumbnailMap)
  }

  private createCamera() {
    const camera = new THREE.OrthographicCamera()
    camera.near = 0.01
    camera.far = 10
    camera.position.z = 5
    return camera
  }

  private async loadTextures(thumbnails: HTMLElement[], thumbnailMap: ThumbnailMap) {
    const loader = new THREE.TextureLoader()

    Promise.all(
      thumbnails.map(async (thumbnail) => {
        const texture = await loader.loadAsync(thumbnail.dataset.path!)
        texture.userData.aspect = texture.source.data.width / texture.source.data.height
        if (thumbnailMap.has(thumbnail)) {
          const mesh = thumbnailMap.get(thumbnail)!
          mesh.material.uniforms.map.value = texture
          mesh.material.uniforms.aspect.value = texture.width / texture.height
          this.renderer.initTexture(texture)
        }
      }),
    )
  }

  private create(thumbnails: HTMLElement[]) {
    const thumbnailMap: ThumbnailMap = new WeakMap()

    let count = 0
    for (const thumbnailEl of thumbnails) {
      const geo = new THREE.PlaneGeometry()
      const mat = new RawShaderMaterial({
        uniforms: {
          map: { value: null },
          aspect: { value: null },
          seed: { value: ++count },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
      })
      const mesh = new THREE.Mesh(geo, mat)
      thumbnailMap.set(thumbnailEl, mesh)
      this.scene.add(mesh)
    }

    return thumbnailMap
  }

  private syncMesh(canvasWidth: number, canvasHeight: number) {
    // viewport上部からはみ出させたキャンバスのパディング分のオフセット
    const offsetY = Canvas.Element!.getBoundingClientRect().y

    for (const thumbnailEl of this.thumbnails) {
      if (this.thumbnailMap.has(thumbnailEl)) {
        const mesh = this.thumbnailMap.get(thumbnailEl)!
        const rect = thumbnailEl.getBoundingClientRect()
        mesh.scale.set(rect.width, rect.height, 1)

        const x = (rect.width - canvasWidth) * 0.5 + rect.x
        const y = (canvasHeight - rect.height) * 0.5 - rect.y - scrollY + offsetY
        // scrollY：リサイズ時にスクロール位置の保持を考慮する
        // offsetY：オフセットを考慮する
        mesh.position.set(x, y, 0)
        mesh.userData.pos0 = { x, y }
      }
    }
  }

  resize(width: number, height: number) {
    const [w2, h2] = [width * 0.5, height * 0.5]
    this.camera.left = -w2
    this.camera.right = w2
    this.camera.top = h2
    this.camera.bottom = -h2
    this.camera.updateProjectionMatrix()

    this.syncMesh(width, height)
  }

  private scrollSyncMesh() {
    for (const thumbnailEl of this.thumbnails) {
      if (this.thumbnailMap.has(thumbnailEl)) {
        const mesh = this.thumbnailMap.get(thumbnailEl)!
        mesh.position.y = scrollY + (mesh.userData.pos0?.y ?? 0)
      }
    }
  }

  render() {
    this.scrollSyncMesh()

    this.renderer.setRenderTarget(null)
    this.renderer.render(this.scene, this.camera)
  }
}
