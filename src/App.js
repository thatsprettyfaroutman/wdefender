import './App.css'

import React, { Component, Fragment } from 'react'
import raf from 'raf'
import {
  OrthographicCamera,
  Scene,
  WebGLRenderer,
  Color,
  // GridHelper,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'
import Stats from 'stats.js'

import Ship from './assets/Ship'
import Asteroid from './assets/Asteroid'
import Shot from './assets/Shot'
import Space from './assets/Space'

class App extends Component {
  dom = null
  statsDom = null
  lastUpdateTime = Date.now()
  swayIterator = 0
  targetMs = 1000 / 60
  scale = 2
  stats = new Stats()

  mouse = {
    raycaster: new Raycaster(),
    vector2: new Vector2(0, 0),
    position: new Vector3(0, 0, 0),
  }

  mouseHelper = null
  space = null
  ship = null
  asteroids = []
  shots = []

  componentDidMount() {
    // Disable right click menu
    this.dom.oncontextmenu = e => e.preventDefault()

    // Init
    this.initGame()

    // Listen
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('click', this.handleClick)
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('click', this.handleClick)
  }

  initGame() {
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = window.innerHeight * this.scale

    this.camera = new OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000)
    this.camera.position.z = 10

    this.scene = new Scene()
    this.scene.background = new Color( 0x130F40 )
    this.scene.add(this.camera)

    // const gridHelper = new GridHelper( window.innerWidth * this.scale, 20 )
    // gridHelper.rotation.x = Math.PI / 2
		// this.scene.add( gridHelper )


    // ASSETS
    this.mouseHelper = new Mesh(
      new BoxGeometry(50, 50, 50),
      new MeshBasicMaterial({
        wireframe: true,
        color: 0xff00ff
      })
    )
    this.scene.add(this.mouseHelper)

    this.ship = new Ship()
    this.ship.position.y = -window.innerHeight + this.ship.getHeight()
    this.ship.set('_mouse', this.mouse)
    this.scene.add(this.ship)

    this.space = new Space()
    this.scene.add(this.space)

    // Stuff

    this.renderer = new WebGLRenderer({ antialias: false })
    this.renderer.setSize(window.innerWidth * this.scale, window.innerHeight * this.scale)
    this.dom.appendChild(this.renderer.domElement)

    this.stats.showPanel(0)
    this.dom.appendChild( this.stats.dom );

    this.renderLoop()
    this.updateLoopInterval = setInterval(this.updateLoop, this.targetMs)
    this.asteroidInterval = setInterval(this.asteroidLoop, 500)
    // this.asteroidInterval = setInterval(this.asteroidLoop, this.targetMs / 2)
  }

  updateLoop = () => {
    const now = Date.now()
    const deltaTime = now - this.lastUpdateTime
    const timeComp = deltaTime / this.targetMs
    this.lastUpdateTime = now

    this.space.update(timeComp, deltaTime)
    this.ship.update(timeComp, deltaTime)
    this.asteroids.forEach(x => x.update(timeComp, deltaTime))
    this.shots.forEach(x => x.update(timeComp, deltaTime))
    this.handleCollisions()

    this.mouseHelper.position.x = this.mouse.position.x
    this.mouseHelper.position.y = this.mouse.position.y
    this.mouseHelper.position.z = this.mouse.position.z

    this.asteroids = this.asteroids.filter(asteroid => {
      if (asteroid.position.y < -2000 || asteroid.getHp() < 0) {
        this.scene.remove(asteroid)
        return false
      }
      return true
    })
    this.shots = this.shots.filter(shot => {
      if (shot.position.y > 2000 || shot.position.y < -2000 || shot.getHp() < 0) {
        this.scene.remove(shot)
        return false
      }
      return true
    })

    this.statsDom.innerHTML =
      `asteroids ${this.asteroids.length}<br />shots ${this.shots.length}`
  }

  asteroidLoop = () => {
    const asteroid = new Asteroid(Math.ceil(Math.random() * 3))
    asteroid.position.y = 2000
    asteroid.position.z = -10
    asteroid.position.x = Math.random() * window.innerWidth - window.innerWidth / 2
    this.asteroids.push(asteroid)
    this.scene.add(asteroid)
  }

  handleCollisions() {
    const shipR = this.ship.getRadius()
    const shipCollisionBorder = -window.innerHeight + this.ship.getHeight() * 3

    // Shot collisions
    this.shots.forEach(shot => {
      if (shot.getHp() < 1) return

      const shotWidth = shot.getWidth()
      const shotHeight = shot.getHeight()

      this.asteroids.forEach(asteroid => {
        if (asteroid.getHp() < 1) return
        const distanceDirty = asteroid.position.clone().sub(shot.position)

        if (Math.abs(distanceDirty.x) > asteroid.getWidth() + shotWidth)
          return

        if (Math.abs(distanceDirty.y) > asteroid.getHeight() + shotHeight)
          return

        const distance = asteroid.position.distanceTo(shot.position)
        if (distance < shot.getRadius() + asteroid.getRadius()) {
          shot.set('_hp', shot.getHp() - 1)
          if (shot.getHp() === 0) {
            shot.set('_velocity', new Vector3(0, 0, 0))
          }

          asteroid.set('_hp', asteroid.getHp() - 1)
          if (asteroid.getHp() === 0) {
            asteroid.set('_rotationVelocity', 0)
          }
        }
      })
    })

    this.asteroids.forEach(asteroid => {
      if (asteroid.getHp() < 1) return
      if (asteroid.position.y > shipCollisionBorder) return
      const distance = asteroid.position.distanceTo(this.ship.position)
      if(distance < shipR + asteroid.getRadius()) {
        asteroid.set('_velocity.x', 0)
        asteroid.set('_velocity.y', 0)
        asteroid.set('_rotationVelocity', 0)
        asteroid.set('_hp', 0)
        this.ship.set('_hp', this.ship.getHp() - 1)
      }
    })

  }

  handleMouseMove = e => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    this.mouse.vector2.x = ( clientX / innerWidth ) * 2 - 1
    this.mouse.vector2.y = - ( clientY / innerHeight ) * 2 + 1
    this.mouse.raycaster.setFromCamera(this.mouse.vector2, this.camera)
    const pos3 = this.mouse.raycaster.ray.origin
    this.mouse.position.x = pos3.x
    this.mouse.position.y = pos3.y
    this.mouse.position.z = pos3.z
  }

  handleClick = e => {
    // for (let i = 0; i < 20; i++) {
      const shot = new Shot()
      const turretPos = this.ship.getTurretPosition()
      shot.position.x = turretPos.x // + (i-10) * 50
      shot.position.y = turretPos.y // + Math.random() * 2 - 1
      shot.shootAt(this.ship.getTurretAngle())
      this.shots.push(shot)
      this.scene.add(shot)
    // }
  }

  renderLoop = () => {
    this.stats.begin()
    this.renderer.render(this.scene, this.camera)
    this.stats.end()
    raf(this.renderLoop)
  }

  render() {
    return (
      <Fragment>
        <div className="Game" ref={dom => this.dom = dom} />
        <div className="GameStats" ref={dom => this.statsDom = dom} />
      </Fragment>
    )
  }
}

export default App
