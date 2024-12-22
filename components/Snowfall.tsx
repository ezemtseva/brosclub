'use client'

import React, { useEffect, useRef } from 'react'

const Snowfall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()

    const snowflakes: { x: number; y: number; size: number; speed: number; rotation: number }[] = []

    // Create snowflakes with random positions and sizes
    for (let i = 0; i < 150; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 4, // Size between 4 and 12
        speed: Math.random() * 1 + 0.5,
        rotation: Math.random() * Math.PI * 2 // Random initial rotation
      })
    }

    function drawSnowflake(x: number, y: number, size: number, rotation: number) {
      if (!ctx) return

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      
      // Draw the six arms of the snowflake
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3) // Rotate by 60 degrees
        ctx.beginPath()
        // Main arm
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -size)
        
        // Left branch
        ctx.moveTo(0, -size * 0.6)
        ctx.lineTo(-size * 0.3, -size * 0.9)
        
        // Right branch
        ctx.moveTo(0, -size * 0.6)
        ctx.lineTo(size * 0.3, -size * 0.9)
        
        ctx.stroke()
      }
      
      ctx.restore()
    }

    function drawSnowflakes() {
      if (!ctx || !canvas) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = 'rgba(173, 216, 230, 0.8)' // Light blue color
      ctx.lineWidth = 1

      for (let flake of snowflakes) {
        drawSnowflake(flake.x, flake.y, flake.size, flake.rotation)
      }
      
      moveSnowflakes()
    }

    function moveSnowflakes() {
      if (!canvas) return
      for (let flake of snowflakes) {
        flake.y += flake.speed
        flake.rotation += 0.02 // Slowly rotate each snowflake
        if (flake.y > canvas.height) {
          flake.y = 0
          flake.x = Math.random() * canvas.width
        }
      }
    }

    function animate() {
      drawSnowflakes()
      requestAnimationFrame(animate)
    }

    animate()

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  )
}

export default Snowfall

