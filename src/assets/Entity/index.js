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
  _size = 1
  _radius = 1
  _angle = 0
  _dying = false
  _mesh = null
  _ring = null
  _velocity = new Vector3(0, 0, 0)

  set = (path, value) => {
    set(this, path, value)
    this.postSet(path, value)
  }

  getWidth = () => this._width * this._size
  getHeight = () => this._width * this._size
  getRadius = () => this._radius * this._size
  getAngle = () => this._angle
  getVelocity = () => this._velocity
  getHp = () => this._hp


  createMesh = material => {
    const geometry = new PlaneGeometry(
      this._width * this._size,
      this._height * this._size
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
      this._radius * this._size,
      (this._radius * this._size - 2),
      36 * 2
    )
    const ring = new Mesh(ringGeometry, ringMaterial)
    ring.position.z = 1
    this._ring = ring
    this.add(ring)
  }

  calculateVelocityFromAngle = angle => {
    return new Vector3(
       Math.cos(angle),
       Math.sin(angle),
       0
    )
  }

  getDistanceTo = entity => {
    const v = {
      x: this.position.x - entity.position.x,
      y: this.position.y - entity.position.y,
    }
    return Math.hypot(v.x, v.y)
  }

  mayCollideWith = entity => {
    const diff = {
      x: Math.abs(this.position.x - entity.position.x),
      y: Math.abs(this.position.y - entity.position.y),
    }

    if (diff.x > this.getWidth() + entity.getWidth())
      return false

    if (diff.y > this.getHeight() + entity.getHeight())
      return false

    return true
  }

  collidesWith = entity => {
    if (!this.mayCollideWith(entity)) return false
    const distance = this.getDistanceTo(entity)
    return distance <= this.getRadius() + entity.getRadius()
  }

  update = noop
  postSet = noop
}
