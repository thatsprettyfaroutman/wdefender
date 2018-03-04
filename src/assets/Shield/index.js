import {
  TextureLoader,
  MeshBasicMaterial,
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

    const material = new MeshBasicMaterial({
      map: new TextureLoader().load(TEXTURE),
      transparent: true,
    })

    this.createMesh(material)
    this.createRing(0x376362)
  }

  update = (_, deltaTime) => {
    if (this._visibleTime < 0) return
    this._mesh.material.opacity = this._visibleTime / 1000
    this._visibleTime -= deltaTime
  }

}
