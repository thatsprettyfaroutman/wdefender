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
import random from 'lodash.random'

import Ship from './assets/Ship'
import Asteroid from './assets/Asteroid'
import Shot from './assets/Shot'
import Space from './assets/Space'

const STATUS_GAME = 'STATUS_GAME'
const STATUS_LEADERBOARDS = 'STATUS_LEADERBOARDS'

class App extends Component {
  state = {
    status: STATUS_GAME
  }

  running = false

  dom = null
  statsDom = null
  lastUpdateTime = Date.now()
  swayIterator = 0
  targetMs = 1000 / 60
  scale = 2
  stats = null

  asteroidI = 0

  updateLoopInterval = null
  asteroidInterval = null
  difficultyInterval = null
  difficulty = 1000

  mouse = {}

  mouseHelper = null
  space = null
  ship = null
  asteroids = []
  shots = []

  score = 0

  componentDidMount() {
    // Disable right click menu
    this.dom.oncontextmenu = e => e.preventDefault()

    // Init
    this.initGame()

  }

  componentWillUnmount() {
    this.endGame()
  }

  initGame = () => {
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = window.innerHeight * this.scale

    this.score = 0
    this.running = true
    this.difficulty = 1000
    this.stats = new Stats()
    this.asteroidI = 0

    this.mouse = {
      raycaster: new Raycaster(),
      vector2: new Vector2(0, 0),
      position: new Vector3(0, 0, 0),
    }

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
    this.ship.position.y = -window.innerHeight / 2 * this.scale + this.ship.getHeight()
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
    this.difficultyInterval = setInterval(this.difficultyLoop, 10000)
    // this.asteroidInterval = setInterval(this.asteroidLoop, 500)
  }

  endGame = () => {
    this.running = false
    clearInterval(this.difficultyInterval)
    clearInterval(this.updateLoopInterval)
    clearInterval(this.asteroidInterval)
    while (this.scene.children.length) {
      this.scene.remove(this.scene.children[0])
    }
    this.scene = null
    this.camera = null
    this.renderer = null
    this.stats = null
    this.mouse = null
    this.mouseHelper = null
    this.space = null
    this.ship = null
    this.asteroids = []
    this.shots = []

    this.dom.innerHTML = ''

    this.setState({ status: STATUS_LEADERBOARDS })
  }

  difficultyLoop = () => {
    clearInterval(this.asteroidInterval)
    this.asteroidInterval = setInterval(this.asteroidLoop, this.difficulty)
    this.difficulty *= 0.9
  }

  updateLoop = () => {
    const now = Date.now()
    const deltaTime = now - this.lastUpdateTime
    const timeComp = deltaTime / this.targetMs
    this.lastUpdateTime = now

    if (this.ship.getHp() < 1) {
      this.endGame()
      return
    }

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

    this.statsDom.innerHTML = `

asteroids ${this.asteroids.length}<br />
shots ${this.shots.length}<br />
shieldHp ${this.ship.getShieldHp()}<br />
shipHp ${this.ship.getHp()}<br />
<br />
score ${this.score}

    `
  }

  asteroidLoop = () => {
    let size = random(1, 3)
    if (this.asteroidI >= 500 && this.asteroidI % 500 === 0) size = 8

    const asteroid = new Asteroid(size)
    asteroid.position.y = 2000
    asteroid.position.z = -10
    asteroid.position.x = random(-window.innerWidth / 2, window.innerWidth / 2)
    this.asteroids.push(asteroid)
    this.scene.add(asteroid)

    this.asteroidI++
  }

  filterDead = x => x.getHp() > 0

  handleCollisions() {
    this.shots
      .filter(this.filterDead)
      .forEach(shot => {
        this.asteroids
          .filter(this.filterDead)
          .filter(shot.collidesWith)
          .forEach(asteroid => {
            this.handleShotAsteroidCollision(shot, asteroid)
          })
    })

    this.asteroids
      .filter(this.filterDead)
      .filter(this.ship.collidesWith)
      .forEach(asteroid => {
        this.handleShipAsteroidCollision(this.ship, asteroid)
      })
  }

  handleShotAsteroidCollision = (shot, asteroid) => {
    this.score += 100 + Math.round(shot.getDistanceTo(asteroid))
    shot.set('_hp', shot.getHp() - 1)
    if (shot.getHp() === 0) {
      shot.set('_velocity', new Vector3(0, 0, 0))
    }

    asteroid.set('_hp', asteroid.getHp() - 1)
    if (asteroid.getHp() === 0) {
    }
  }

  handleShipAsteroidCollision = (ship, asteroid) =>{
    asteroid.set('_velocity.x', 0)
    asteroid.set('_velocity.y', 0)
    asteroid.set('_hp', 0)

    ship.setShieldHp(ship.getShieldHp())

    // if (ship.getShieldHp() > 0) {
      // ship.setShieldHp(ship.getShieldHp() - 1)
    // } else {
    //   ship.set('_hp', this.ship.getHp() - 1)
    // }
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
      shot.position.y = turretPos.y
      shot.shootAt(this.ship.getTurretAngle())
      this.shots.push(shot)
      this.scene.add(shot)
    // }
  }

  renderLoop = () => {
    if (!this.running) return
    this.stats.begin()
    this.renderer.render(this.scene, this.camera)
    this.stats.end()
    raf(this.renderLoop)
  }

  render() {

    if (this.state.status === STATUS_LEADERBOARDS) return (
      <div className="GameLeaderboards">
        you died, score: { this.score }
        <button
          onClick={() => {
            this.setState({ status: STATUS_GAME }, () => {
              this.initGame()
            })
          }}
          children="Restart"
        />
      </div>
    )

    return (
      <Fragment>
        <div
          className="Game"
          ref={dom => this.dom = dom}
          onMouseMove={this.handleMouseMove}
          onClick={this.handleClick}
        />
        <div className="GameStats" ref={dom => this.statsDom = dom} />
      </Fragment>
    )
  }
}

export default App
