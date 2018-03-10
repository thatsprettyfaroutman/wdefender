import {
  Geometry,
  Vector3,
  LineBasicMaterial,
  Line,
} from 'three'
import random from 'lodash.random'
import { getViewport } from '../../utils'
import Entity from '../Entity'

export default class Space extends Entity {
  _stars = 100
  _lines = []
  _colors = [ 0x1db4db, 0xffffff, 0xe0cc36, 0xea6a2b ]
  _materials = []

  constructor() {
    super()
    this._materials = this._colors.map(color => {
      return new LineBasicMaterial({
        color,
      })
    })

    for (let i = 0; i < this._stars; i++) {
      const line = this.createLine()
      this._lines.push(line)
      this.add(line)
    }
  }


  createLine = () => {
    const vy = random(-10, -20)
    const geometry = new Geometry()
    geometry.vertices.push(new Vector3(0, 0, 0))
    geometry.vertices.push(new Vector3(0, -vy * 4, 0))
    const line =
      new Line(geometry, this._materials[random(this._materials.length)])
    line._vy = vy
    this.resetLinePosition(line)
    return line
  }

  resetLinePosition = line => {
    const viewport = getViewport()

    line.position.x =
      random(-viewport.width / 2, viewport.width / 2)

    line.position.y =
      viewport.height + random(viewport.height)

    line.position.z = -10
  }

  update = timeComp => {
    const viewport = getViewport()
    this._lines.forEach(line => {
      line.position.y += line._vy

      if (line.position.y < -viewport.height) {
        this.resetLinePosition(line)
      }
    })
  }
}
