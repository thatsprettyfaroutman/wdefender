import {
  TextureLoader,
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh,
  RingGeometry,
  DoubleSide,
} from 'three'
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
  _width = 265.4 / 2 / 3
  _height = 259.12 / 2 / 3
  _radius = 20
  _size = 3
  _fullHp = 0
  _velocity = {
    x: Math.random() * 10 - 5,
    y: Math.random() * -10 - 10,
    r: Math.random() * 0.5 - 0.25,
  }

  constructor(size=3) {
    super()
    this._size = size
    this._hp = this._fullHp = size
    const geometry = new PlaneGeometry(
      this._width * this._scale * this._size,
      this._height * this._scale * this._size
    )
    this._mesh = new Mesh( geometry, materialFullHealth )

    const ringMaterial = new MeshBasicMaterial({
      color: 0xff00ff,
      side: DoubleSide,
    })
    const ringGeometry = new RingGeometry(
      this._radius * this._scale * this._size,
      (this._radius * this._size - 2) * this._scale,
      36
    )
    const ring = new Mesh(ringGeometry, ringMaterial)
    ring.position.z = 1

    this.add( this._mesh, ring )
  }

  update = timeComp => {
    this.position.x += this._velocity.x * timeComp
    this.position.y += this._velocity.y * timeComp
    this._mesh.rotation.z += this._velocity.r * timeComp
  }

  postSet = (path, value) => {
    if (this._dying) return

    if (path.includes('_hp')) {
      if (value === 0) {
        this._mesh.material = materialDead
        this.position.z = 1
        setTimeout(() => {
          this._dying = true
          this._hp = -1
        }, 400)
      }
    }
  }
}
