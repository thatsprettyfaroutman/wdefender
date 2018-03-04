import {
  Group,
  Vector3,
  MeshBasicMaterial,
  DoubleSide,
  RingGeometry,
  PlaneGeometry,
  Mesh,
} from 'three'

import noop from 'lodash.noop'
import set from 'lodash.set'

export default class Entity extends Group {
  _hp = 1
  _width = 0
  _height = 0
  _scale = 2
  _size = 1
  _radius = 1
  _angle = 0
  _dying = false
  _mesh = null
  _velocity = new Vector3(0, 0, 0)

  set = (path, value) => {
    set(this, path, value)
    this.postSet(path, value)
  }

  getWidth = () => this._width * this._size * this._scale
  getHeight = () => this._width * this._size * this._scale
  getRadius = () => this._radius * this._size * this._scale
  getAngle = () => this._angle
  getVelocity = () => this._velocity
  getHp = () => this._hp


  createMesh = material => {
    const geometry = new PlaneGeometry(
      this._width * this._scale * this._size,
      this._height * this._scale * this._size
    )
    this._mesh = new Mesh( geometry, material )
    this.add(this._mesh)
  }

  createRing = (color=0xff00ff) => {
    const ringMaterial = new MeshBasicMaterial({
      color,
      side: DoubleSide,
    })
    const ringGeometry = new RingGeometry(
      this._radius * this._scale * this._size,
      (this._radius * this._size - 2) * this._scale,
      36
    )
    const ring = new Mesh(ringGeometry, ringMaterial)
    ring.position.z = 1
    this.add(ring)
  }

  calculateVelocityFromAngle(angle) {
    return new Vector3(
       Math.cos(angle),
       Math.sin(angle),
       0
    )
  }

  update = noop
  postSet = noop
}
