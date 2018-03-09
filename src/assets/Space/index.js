import {
  Geometry,
  Vector3,
  PointsMaterial,
  Points,
  Line,
} from 'three'
import random from 'lodash.random'
import Entity from '../Entity'

export default class Space extends Entity {
  _stars = 100 // window.innerWidth * this._scale
  _lines = []
  _colors = [ 0x1db4db, 0xffffff, 0xe0cc36, 0xea6a2b ]
  _materials = []

  constructor() {
    super()
    this._materials = this._colors.map(color => {
      return new PointsMaterial({
        color,
        opacity: 0.2,
        size: 0.1,
      })
      // const geometry = new Geometry()
      //
      // for (let i = 0; i < this._stars / this._colors.length; i++) {
      //   const vertex = new Vector3()
      //   vertex.x =
      //     random(-window.innerWidth / 2, window.innerWidth / 2) * this._scale
      //
      //   vertex.y =
      //     window.innerHeight / 2 * this._scale + random(window.innerHeight)
      //     // window.innerHeight / 2 + starI
      //
      //   vertex.z = -10
      //   vertex._vy = random(-10, -20)
      //   geometry.vertices.push(vertex)
      //   starI++
      // }
      //
      // const material = new PointsMaterial({
      //   color,
      //   opacity: 0.2,
      //   size: 0.1,
      // })
      //
      // const particles = new Line( geometry, material )
      // this.add( particles )
      //
      // return geometry
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
    geometry.vertices.push(new Vector3(0, -vy * this._scale * 2, 0))
    const line =
      new Line(geometry, this._materials[random(this._materials.length)])
    line._vy = vy
    this.resetLinePosition(line)
    return line
  }

  resetLinePosition = line => {
    line.position.x =
      random(-window.innerWidth / 2, window.innerWidth / 2) * this._scale

    line.position.y =
      window.innerHeight * this._scale + random(window.innerHeight)

    line.position.z = -10
  }

  update = timeComp => {
    this._lines.forEach(line => {
      line.position.y += line._vy

      if (line.position.y < -window.innerHeight * this._scale) {
        this.resetLinePosition(line)
      }

      // for ( let i = 0, n = geometry.vertices.length; i < n; i++ ) {
      //   const vertex = geometry.vertices[i]
      //   vertex.y += vertex._vy * timeComp
      //   if (vertex.y < -window.innerHeight / 2 * this._scale) {
      //     vertex.x =
      //       random(-window.innerWidth / 2, window.innerWidth / 2) * this._scale
      //
      //     vertex.y =
      //       window.innerHeight / 2 * this._scale + random(window.innerHeight)
      //
      //   }
      // }
      // geometry.verticesNeedUpdate = true
    })
  }
}
