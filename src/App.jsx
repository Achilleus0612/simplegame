import React, { useState, useEffect, useCallback } from 'react'

function App() {
  const [gameState, setGameState] = useState('menu') // 'menu', 'playing', 'gameOver'
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [targetColor, setTargetColor] = useState('')
  const [colorGrid, setColorGrid] = useState([])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [gameTimer, setGameTimer] = useState(null)
  const [highScore, setHighScore] = useState(0)

  // Color palette for the game
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#85C1E9', '#F7DC6F', '#A9CCE3'
  ]

  // Generate a new round
  const generateNewRound = useCallback(() => {
    const shuffledColors = [...colors].sort(() => Math.random() - 0.5)
    const targetColorIndex = Math.floor(Math.random() * 16)
    const newTargetColor = shuffledColors[targetColorIndex]
    
    setTargetColor(newTargetColor)
    setColorGrid(shuffledColors)
    setCorrectIndex(targetColorIndex)
  }, [])

  // Start the game
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setTimeLeft(30)
    generateNewRound()
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    setGameTimer(timer)
  }

  // End the game
  const endGame = () => {
    setGameState('gameOver')
    if (gameTimer) {
      clearInterval(gameTimer)
    }
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('colorRushHighScore', score.toString())
    }
  }

  // Handle tile click
  const handleTileClick = (index) => {
    if (index === correctIndex) {
      setScore(prev => prev + 10)
      generateNewRound()
    } else {
      // Wrong choice - game over
      endGame()
    }
  }

  // Share score function
  const shareScore = () => {
    const text = `🎮 I scored ${score} points in Color Rush! Can you beat my score? 🏆`
    const url = window.location.href
    
    if (navigator.share) {
      navigator.share({
        title: 'Color Rush Score',
        text: text,
        url: url
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${text} ${url}`)
      alert('Score copied to clipboard!')
    }
  }

  // Load high score on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('colorRushHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (gameTimer) {
        clearInterval(gameTimer)
      }
    }
  }, [gameTimer])

  const renderMenu = () => (
    <div className="game-container">
      <h1 className="game-title">🎨 Color Rush</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
        Match the target color as fast as you can!
      </p>
      {highScore > 0 && (
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ffd700' }}>
          🏆 High Score: {highScore}
        </p>
      )}
      <button className="start-button" onClick={startGame}>
        🚀 Start Game
      </button>
    </div>
  )

  const renderGame = () => (
    <div className="game-container">
      <h1 className="game-title">🎨 Color Rush</h1>
      <div className="score">Score: {score}</div>
      <div className="timer">⏱️ Time: {timeLeft}s</div>
      
      <div className="target-color" style={{ backgroundColor: targetColor }}></div>
      <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
        Find this color!
      </p>
      
      <div className="game-grid">
        {colorGrid.map((color, index) => (
          <div
            key={index}
            className="color-tile"
            style={{ backgroundColor: color }}
            onClick={() => handleTileClick(index)}
          ></div>
        ))}
      </div>
    </div>
  )

  const renderGameOver = () => (
    <div className="game-container">
      <h1 className="game-title">🎨 Color Rush</h1>
      <div className="game-over">Game Over!</div>
      <div className="final-score">Final Score: {score}</div>
      
      {score > highScore && (
        <div style={{ fontSize: '1.2rem', color: '#ffd700', marginBottom: '1rem' }}>
          🎉 New High Score! 🎉
        </div>
      )}
      
      <div className="share-section">
        <p style={{ marginBottom: '1rem' }}>Share your score!</p>
        <button className="share-button" onClick={shareScore}>
          📤 Share Score
        </button>
      </div>
      
      <button className="restart-button" onClick={startGame}>
        🔄 Play Again
      </button>
    </div>
  )

  return (
    <div>
      {gameState === 'menu' && renderMenu()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'gameOver' && renderGameOver()}
    </div>
  )
}

export default App 