import {
  TextureLoader,
  MeshBasicMaterial,
  Vector3,
} from 'three'
import random from 'lodash.random'
import Entity from '../Entity'

import TEXTURE from './texture-full-health.svg'
import TEXTURE_DEAD from './texture-dead.svg'

const materialFullHealth = new MeshBasicMaterial({
  map: new TextureLoader().load(TEXTURE),
  transparent: true,
})

const materialDead = new MeshBasicMaterial({
  map: new TextureLoader().load(TEXTURE_DEAD),
  transparent: true,
})

export default class Asteroid extends Entity {
  _hp = 1
  _width = 265.4 / 2 / 3
  _height = 259.12 / 2 / 3
  _radius = 20
  _size = 3
  _fullHp = 0
  _velocity = new Vector3(
    random(-2, 2, true),
    random(-5, -10, true),
    0
  )
  _rotationVelocity = random(-0.1, 0.1, true)


  constructor(size=3) {
    super()
    this._size = size
    this._hp = this._fullHp = size
    this.createMesh(materialFullHealth)
    // this.createRing()
    this.position.z = random(1) ? -2 : 2
  }

  update = timeComp => {
    this.position.x += this._velocity.x * timeComp
    this.position.y += this._velocity.y * timeComp
    this._mesh.rotation.z += this._rotationVelocity * timeComp
  }

  postSet = (path, value) => {
    if (this._dying) return

    if (path.includes('_hp')) {
      if (value === 0) {
        this._mesh.material = materialDead
        setTimeout(() => {
          this._dying = true
          this._hp = -1
        }, 400)
      }
    }
  }

}
