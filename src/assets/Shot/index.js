import {
  TextureLoader,
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh,
  RingGeometry,
  DoubleSide,
  Vector3,
} from 'three'
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
  _power = 20 + Math.random() * 0.2 - 0.1
  _velocity = new Vector3(0, 0, 0)

  constructor(size=3) {
    super()

    const geometry = new PlaneGeometry(
      this._width * this._scale,
      this._height * this._scale
    )
    this._mesh = new Mesh( geometry, material )

    const ringMaterial = new MeshBasicMaterial({
      color: 0xff00ff,
      side: DoubleSide,
    })
    const ringGeometry = new RingGeometry(
      this._radius * this._scale,
      (this._radius - 2) * this._scale,
      36
    )
    const ring = new Mesh(ringGeometry, ringMaterial)
    ring.position.z = 1

    this.add( this._mesh, ring )
  }

  shootAt = angle => {
    const angleRandom = angle + Math.random() * 0.1 - 0.05
    const moveAngle = angleRandom + Math.PI / 2
    const velocity = this.calculateVelocityFromAngle(moveAngle)
    this._velocity = velocity.multiply(
      new Vector3(this._power, this._power, 0)
    )
    this.rotation.z = angleRandom
  }

  update = timeComp => {
    this.position.add(this._velocity)
  }
}
