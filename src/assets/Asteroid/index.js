import {
  TextureLoader,
  PlaneGeometry,
  MeshBasicMaterial,
  Vector3,
  Mesh,
} from 'three'
import random from 'lodash.random'
import cubicBezier from 'cubic-bezier'
import Entity from '../Entity'

import TEXTURE from './texture-full-health.svg'
import TEXTURE_EXPLOSION from './texture-explosion.svg'

import TEXTURE_PART_1 from './texture-part-1.svg'
import TEXTURE_PART_2 from './texture-part-2.svg'
import TEXTURE_PART_3 from './texture-part-3.svg'
import TEXTURE_PART_4 from './texture-part-4.svg'

const materialFullHealth = new MeshBasicMaterial({
  map: new TextureLoader().load(TEXTURE),
  transparent: true,
})

const materialExplosion = new MeshBasicMaterial({
  map: new TextureLoader().load(TEXTURE_EXPLOSION),
  transparent: true,
})

const partMaterials = [
  TEXTURE_PART_1,
  TEXTURE_PART_3,
  TEXTURE_PART_4,
  TEXTURE_PART_2,
].map(x => new MeshBasicMaterial({
  map: new TextureLoader().load(x),
  transparent: true,
}))

const resize = size => size / 2 / 3

const DYING_TIME = 400

const deathBezier = cubicBezier(0, 0.89, 0.27, 1, 10)

export default class Asteroid extends Entity {
  _hp = 1
  _width = resize(265.4)
  _height = resize(259.12)
  _radius = 20
  _size = 3
  _fullHp = 0
  _velocity = new Vector3(
    random(-2, 2, true),
    random(-5, -10, true),
    0
  )
  _rotationVelocity = random(-0.05, 0.05, true)
  _dying = false
  _dyingTime = 0

  _explosionSize = {
    width: resize(436.9),
    height: resize(335.32),
  }
  _explosion = null

  _partSizes = [
    {
      width: resize(138.92),
      height: resize(67.16),
      ox: -1,
      oy: 15,
    }, {
      width: resize(187.3),
      height: resize(226.84),
      ox: -8,
      oy: -5,
    }, {
      width: resize(121.76),
      height: resize(192.36),
      ox: 10,
      oy: -8,
    }, {
      width: resize(95.54),
      height: resize(140.94),
      ox: 12,
      oy: 4,
    },
  ]
  _parts = []

  constructor(size=3) {
    super()
    this._size = size
    this._hp = this._fullHp = size

    this.createMesh(materialFullHealth)
    // this.createParts()
    // this.createRing()

    this.position.z = random(1) ? -10 : 10
  }

  scaleWithSize = size => size * this._scale * this._size

  createParts() {
    partMaterials.forEach((material, i) => {
      const partSize = this._partSizes[i]
      const geometry = new PlaneGeometry(
        this.scaleWithSize(partSize.width),
        this.scaleWithSize(partSize.height)
      )
      const mesh = new Mesh( geometry, material )
      mesh.position.x = this.scaleWithSize(partSize.ox)
      mesh.position.y = this.scaleWithSize(partSize.oy)
      this._parts.push(mesh)
      this.add(mesh)
    })
  }

  createExplosion() {
    const geometry = new PlaneGeometry(
      this.scaleWithSize(this._explosionSize.width),
      this.scaleWithSize(this._explosionSize.height)
    )
    const mesh = new Mesh( geometry, materialExplosion )
    this._explosion = mesh
    this.add(mesh)
  }

  update = (timeComp, deltaTime) => {
    this.position.x += this._velocity.x * timeComp
    this.position.y += this._velocity.y * timeComp

    if (this._mesh) {
      this.rotation.z += this._rotationVelocity * timeComp
    }

    this._parts.forEach((part, i) => {
      const partSize = this._partSizes[i]
      const v = new Vector3(
        partSize.ox * timeComp / 3,
        partSize.oy * timeComp / 3,
        0
      )
      part.position.add(v)
      part.rotation.z += this._rotationVelocity * timeComp

      part.material.opacity = deathBezier(this._dyingTime / DYING_TIME)
    })

    if (this._dying) {
      this._dyingTime -= deltaTime

      if (this._dyingTime < 0) {
        this._hp = -1
      }
    }

    if (this._explosion) {
      this._explosion.material.opacity =
        deathBezier(this._dyingTime / DYING_TIME)
    }

  }

  postSet = (path, value) => {
    if (this._dying) return

    if (path.includes('_hp')) {
      if (value === 0) {
        this.remove(this._mesh)
        this._mesh = null

        this.createExplosion()
        this.createParts()

        this._dying = true
        this._dyingTime = DYING_TIME
      }
    }
  }

}
