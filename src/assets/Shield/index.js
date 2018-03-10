import {
  TextureLoader,
  MeshBasicMaterial,
} from 'three'
import Entity from '../Entity'

import TEXTURE from './texture.svg'

const TIME_DEATH = 400
const TIME_VISIBLE = 1000

export default class Shield extends Entity {
  _hp = 3
  _width = 576
  _height = 576
  _radius = 240
  _visibleTime = TIME_VISIBLE
  _deathTime = 0
  _dying = false

  constructor() {
    super()

    const material = new MeshBasicMaterial({
      map: new TextureLoader().load(TEXTURE),
      transparent: true,
    })

    this.createMesh(material)
    this.createRing(0x376362)
  }

  update = (_, deltaTime) => {
    this.updateVisibility(deltaTime)
    this.updateDeath(deltaTime)
  }

  updateVisibility = deltaTime => {
    if (this._visibleTime <= 0) return
    this._mesh.material.opacity = this._visibleTime / TIME_VISIBLE
    this._visibleTime -= deltaTime
  }

  updateDeath = deltaTime => {
    if (!this._dying || this._deathTime <= 0) return

    this._deathTime -= deltaTime

    // delay if more than TIME_DEATH
    if (this._deathTime > TIME_DEATH) return

    let scale = Math.round((this._deathTime / TIME_DEATH) * 100) / 100
    if (scale < 0.01) scale = 0.01
    this._ring.scale.x = scale
    this._ring.scale.y = scale
  }

  postSet = (path, value) => {
    if (path.includes('_hp')) {
      this._visibleTime = TIME_VISIBLE

      if (value < 1) {
        this._dying = true
        this._deathTime = TIME_DEATH + TIME_VISIBLE
      }
    }
  }

}
