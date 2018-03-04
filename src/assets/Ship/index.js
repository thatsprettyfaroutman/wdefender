import {
  TextureLoader,
  MeshBasicMaterial,
} from 'three'

import Point from 'point-geometry'

import Entity from '../Entity'
import Shield from '../Shield'
import Turret from '../Turret'

import TEXTURE from './texture.svg'

export default class Ship extends Entity {
  _hp = 3
  _width = 141.058
  _height = 129.676
  _swayIterator = 0
  _mouse = null
  _shield = new Shield()
  _turret = new Turret()

  constructor() {
    super()
    const material = new MeshBasicMaterial({
      map: new TextureLoader().load(TEXTURE),
      transparent: true,
    })
    this.createMesh(material)

    this._shield.position.z = 1
    this._turret.position.z = 1
    this._turret.position.y = -14.5 * this._scale

    this.add( this._mesh, this._shield, this._turret )
  }

  update = (timeComp, deltaTime) => {
    const { _mouse } = this

    this._swayIterator +=
      timeComp / 100

    this.position.x +=
      Math.sin(this._swayIterator) / 8 * this._scale

    this.position.y +=
      Math.cos(this._swayIterator) / 3 * this._scale

    this.rotation.z +=
      Math.sin(this._swayIterator) / 3600
      - Math.cos(this._swayIterator) / 3600

    if (_mouse) {
      const mousePoint = new Point(_mouse.position.x,_mouse.position.y)
      const turretPos = this.position.clone().add(this._turret.position)
      const turretPoint = new Point( turretPos.x, turretPos.y)
      const angle = mousePoint.angleTo(turretPoint)
      this._turret.set('_angle', angle - Math.PI / 2)
    }

    this._shield.update(timeComp, deltaTime)
    this._turret.update(timeComp, deltaTime)
  }

  getRadius = () => this._shield.getRadius()
  getHp = () => this._shield.getHp() || this._hp
  getTurretAngle = () => this._turret.getAngle()
  getTurretPosition = () => this.position.clone().add(this._turret.position)

  postSet = (path, value) => {
    if (path.includes('_hp')) {
      // console.log(value, this._shield.getHp())
      // if (this._shield.getHp()) {
      //   this._shield.set('_hp', this._shield.getHp() - 1)
      //   return
      // }
      // if (value === 0) alert('ded')
      this._shield.set('_visibleTime', 1000)

    }
  }

}
