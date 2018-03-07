import {
  TextureLoader,
  MeshBasicMaterial,
  Vector3,
} from 'three'
import random from 'lodash.random'
import Entity from '../Entity'
import TEXTURE from './texture.svg'

const material = new MeshBasicMaterial({
  map: new TextureLoader().load(TEXTURE),
  transparent: true,
})

export default class Shot extends Entity {
  _hp = 1
  _width = 32.94 / 2
  _height = 41.32 / 2
  _radius = 10
  _speed = 20 + random(-0.1, 0.1, true)
  _velocity = new Vector3(0, 0, 0)

  constructor() {
    super()
    this.createMesh(material)
    // this.createRing()
  }

  shootAt = angle => {
    const angleRandom = angle + random(-0.05, 0.05, true)
    const moveAngle = angleRandom + Math.PI / 2
    const velocity = this.calculateVelocityFromAngle(moveAngle)
    this._velocity = velocity.multiply(
      new Vector3(this._speed, this._speed, 0)
    )
    this.rotation.z = angleRandom
  }

  update = timeComp => {
    this.position.x += this._velocity.x * timeComp
    this.position.y += this._velocity.y * timeComp
  }

  postSet = (path, value) => {
    if (this._dying) return

    if (path.includes('_hp')) {
      if (value === 0) {
        setTimeout(() => {
          this._dying = true
          this._hp = -1
        }, 100)
      }
    }
  }

}
