import {
  TextureLoader,
  MeshBasicMaterial,
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
    const material = new MeshBasicMaterial({
      map: new TextureLoader().load(TEXTURE),
      transparent: true,
    })
    this.createMesh(material)

    this._mesh.position.y = 4 * this._scale
    this._mesh.position.x = 0.5 * this._scale
    this._mesh.position.z = 2
  }

  update = (_, deltaTime) => {
    this.rotation.z = this._angle
  }
}
