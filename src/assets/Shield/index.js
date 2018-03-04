import {
  TextureLoader,
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh,
  RingGeometry,
  DoubleSide,
} from 'three'
import Entity from '../Entity'

import TEXTURE from './texture.svg'

export default class Shield extends Entity {
  _hp = 10
  _width = 576 / 2
  _height = 576 / 2
  _radius = 120
  _visibleTime = 0

  constructor() {
    super()
    const geometry = new PlaneGeometry(
      this._width * this._scale,
      this._height * this._scale
    )
    const material = new MeshBasicMaterial({
      map: new TextureLoader().load(TEXTURE),
      transparent: true,
    })
    this._mesh = new Mesh( geometry, material )

    const ringMaterial = new MeshBasicMaterial({
      color: 0x376362,
      side: DoubleSide,
    })
    const ringGeometry = new RingGeometry(
      this._radius * this._scale,
      (this._radius - 2) * this._scale,
      36
    )
    const ring = new Mesh(ringGeometry, ringMaterial)
    ring.position.z = 1

    this.add( this._mesh, ring )
  }

  update = (_, deltaTime) => {
    if (this._visibleTime < 0) return
    this._mesh.material.opacity = this._visibleTime / 1000
    this._visibleTime -= deltaTime
  }

}
