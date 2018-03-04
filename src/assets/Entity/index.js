import {
  Group,
  Vector3,
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
  _dying = false

  set = (path, value) => {
    set(this, path, value)
    this.postSet(path, value)
  }

  getWidth = () => this._width * this._size * this._scale
  getHeight = () => this._width * this._size * this._scale
  getRadius = () => this._radius * this._size * this._scale
  getHp = () => this._hp

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
