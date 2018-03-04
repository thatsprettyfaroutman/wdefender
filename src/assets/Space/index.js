import {
  Geometry,
  Vector3,
  PointsMaterial,
  Points,
} from 'three'
import Entity from '../Entity'

export default class Space extends Entity {
  _geometry = null

  constructor() {
    super()
    this._geometry = new Geometry()

    for ( let i = 0; i < 1000; i++ ) {
      const vertex = new Vector3()
      vertex.x = Math.random() * 4000 - 2000
      vertex.y = Math.random() * 4000 - 2000
      vertex.z = -10
      this._geometry.vertices.push( vertex )
    }

    const material = new PointsMaterial({
      color: 0xffffff,
      opacity: 0.2,
      size: 0.1,
    })

    const particles = new Points( this._geometry, material )
    this.add( particles )
  }

  update = timeComp => {
    for ( let i = 0, n = this._geometry.vertices.length; i < n; i++ ) {
      const vertex = this._geometry.vertices[i]
      vertex.y -= 2 * timeComp
      if (vertex.y < -2000) {
        vertex.x = Math.random() * 4000 - 2000
        vertex.y = 2000
      }
    }
    this._geometry.verticesNeedUpdate = true
  }
}
