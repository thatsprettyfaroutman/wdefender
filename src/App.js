import './App.css'

import React, { Component } from 'react'

class App extends Component {
  state = {
    Game: null
  }
  mounted = false

  componentWillMount() {
    this.mounted = true
    this.loadGame()
  }

  componentWillUnmount() { this.mounted = false }

  loadGame = async () => {
    const Game = await (
      await import('./Game.js')
    ).default
    setTimeout(() => {
      if (this.mounted) this.setState({ Game })
    }, 2000)
  }

  render() {
    const { Game } = this.state

    if (!Game) return (
      <div className="App App--loading">loading</div>
    )

    return (
      <div className="App">
        <Game />
      </div>
    )
  }
}

export default App
