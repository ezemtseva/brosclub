'use client'

import React, { useEffect, useRef, useMemo, useCallback } from 'react'

const Snowfall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const lastUpdateTimeRef = useRef<number>(0)

  const createSnowflakes = useCallback((width: number, height: number) => {
    const snowflakes = []
    const snowflakeCount = Math.min(150, Math.floor((width * height) / 10000))
    for (let i = 0; i < snowflakeCount; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 4,
        speed: Math.random() * 1 + 0.5,
        rotation: Math.random() * Math.PI * 2
      })
    }
    return snowflakes
  }, [])

  const drawSnowflake = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, -size)
      ctx.moveTo(0, -size * 0.6)
      ctx.lineTo(-size * 0.3, -size * 0.9)
      ctx.moveTo(0, -size * 0.6)
      ctx.lineTo(size * 0.3, -size * 0.9)
      ctx.stroke()
    }
    
    ctx.restore()
  }, [])

  const updateAndDrawSnowflakes = useCallback((ctx: CanvasRenderingContext2D, snowflakes: any[], width: number, height: number, deltaTime: number) => {
    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = 'rgba(173, 216, 230, 0.8)'
    ctx.lineWidth = 1

    for (let flake of snowflakes) {
      flake.y += flake.speed * deltaTime / 16
      flake.rotation += 0.02 * deltaTime / 16
      if (flake.y > height) {
        flake.y = 0
        flake.x = Math.random() * width
      }
      drawSnowflake(ctx, flake.x, flake.y, flake.size, flake.rotation)
    }
  }, [drawSnowflake])

  const animate = useCallback((time: number) => {
    if (!canvasRef.current) return

    const deltaTime = time - lastUpdateTimeRef.current
    if (deltaTime < 16) {  // Cap at ~60 FPS
      animationRef.current = requestAnimationFrame(animate)
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    updateAndDrawSnowflakes(ctx, snowflakesRef.current, canvas.width, canvas.height, deltaTime)

    lastUpdateTimeRef.current = time
    animationRef.current = requestAnimationFrame(animate)
  }, [updateAndDrawSnowflakes])

  const snowflakesRef = useRef<any[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      snowflakesRef.current = createSnowflakes(canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, createSnowflakes])

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

