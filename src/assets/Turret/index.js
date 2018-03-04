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

export default class Turret extends Entity {
  _radius = 14
  _width = 46.12 / 2
  _height = 63.34 / 2
  _angle = 0

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
    this._mesh.position.y = 4 * this._scale
    this._mesh.position.x = 0.5 * this._scale
    this._mesh.position.z = 2

    const ringMaterial = new MeshBasicMaterial({
      color: 0xff00ff,
      side: DoubleSide,
    })
    const ringGeometry = new RingGeometry(
      this._radius * this._scale,
      (this._radius - 2) * this._scale,
      36
    )
    const ring = new Mesh(ringGeometry, ringMaterial)
    ring.position.z = 1

    this.add( this._mesh )
  }

  update = (_, deltaTime) => {
    this.rotation.z = this._angle
  }

  getAngle = () => this._angle

}
