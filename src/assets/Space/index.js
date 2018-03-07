import {
  Geometry,
  Vector3,
  PointsMaterial,
  Points,
} from 'three'
import random from 'lodash.random'
import Entity from '../Entity'

export default class Space extends Entity {
  _stars = 1000
  _geometries = []
  _colors = [ 0x1db4db, 0xffffff, 0xe0cc36, 0xea6a2b ]


  constructor() {
    super()

    this._geometries = this._colors.map(color => {
      const geometry = new Geometry()

      for (let i = 0; i < this._stars / this._colors.length; i++) {
        const vertex = new Vector3()
        vertex.x =
          random(-window.innerWidth / 2 * 2, window.innerWidth / 2 * 2)

        vertex.y =
          random(-window.innerHeight / 2 * 2, window.innerHeight / 2 * 2)

        vertex.z = -10
        vertex._vy = random(-4, -8)
        geometry.vertices.push(vertex)
      }

      const material = new PointsMaterial({
        color,
        opacity: 0.2,
        size: 0.1,
      })

      const particles = new Points( geometry, material )
      this.add( particles )

      return geometry
    })
  }

  update = timeComp => {
    this._geometries.forEach(geometry => {
      for ( let i = 0, n = geometry.vertices.length; i < n; i++ ) {
        const vertex = geometry.vertices[i]
        vertex.y += vertex._vy * timeComp
        if (vertex.y < -window.innerHeight / 2 * 2) {
          vertex.x =
            random(-window.innerWidth / 2 * 2, window.innerWidth / 2 * 2)

          vertex.y =
            window.innerHeight / 2 * 2 + random(window.innerHeight)

        }
      }
      geometry.verticesNeedUpdate = true
    })
  }
}
