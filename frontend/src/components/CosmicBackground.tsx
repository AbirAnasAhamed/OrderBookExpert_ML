"use client"

import { useEffect, useRef } from "react"

// Animated Canvas Starfield for True 3D Warp Effect
export const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    const stars: { x: number, y: number, z: number, size: number, speed: number, alpha: number }[] = []
    const numStars = 1500

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 4000,
        y: (Math.random() - 0.5) * 4000,
        z: Math.random() * 2000,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 3 + 1,
        alpha: Math.random() * 1 + 1.5
      })
    }

    let mouseX = 0
    let mouseY = 0
    let targetMouseX = 0
    let targetMouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.1
      targetMouseY = (e.clientY - height / 2) * 0.1
    }

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      
      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      const fov = 300
      const maxZ = 2000

      stars.forEach(star => {
        // Move star away (rear window effect)
        star.z += star.speed

        // Reset if passed far distance
        if (star.z > maxZ) {
          star.z = 1
          star.x = (Math.random() - 0.5) * 4000
          star.y = (Math.random() - 0.5) * 4000
          star.speed = Math.random() * 3 + 1
        }

        // Project 3D to 2D
        const projectedX = (star.x / star.z) * fov + width / 2 + mouseX * (maxZ / Math.max(1, star.z))
        const projectedY = (star.y / star.z) * fov + height / 2 + mouseY * (maxZ / Math.max(1, star.z))
        
        // Scale based on distance
        const scale = fov / star.z
        const currentSize = star.size * scale
        
        // Calculate opacity based on distance (fade out into the distance, and start invisible at z=0 to avoid popping)
        let opacity = 0
        if (star.z < 50) {
          opacity = star.z / 50 // Fade in fast
        } else {
          opacity = Math.max(0, 1 - (star.z / maxZ)) // Fade out slowly
        }
        opacity = Math.min(1, opacity * star.alpha)

        // Only draw if on screen and visible
        if (opacity > 0.01 && projectedX >= 0 && projectedX <= width && projectedY >= 0 && projectedY <= height) {
          ctx.beginPath()
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.arc(projectedX, projectedY, Math.max(0.1, currentSize), 0, Math.PI * 2)
          ctx.fill()
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-nebula-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5vw, 5vh) scale(1.1); }
        }
        @keyframes float-nebula-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5vw, -5vh) scale(1.2); }
        }
        @keyframes float-nebula-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-3vw, 8vh) scale(1.1); }
        }
        .animate-nebula-1 { animation: float-nebula-1 25s ease-in-out infinite; }
        .animate-nebula-2 { animation: float-nebula-2 30s ease-in-out infinite; }
        .animate-nebula-3 { animation: float-nebula-3 35s ease-in-out infinite; }
      `}} />
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none opacity-80"
      />
    </>
  )
}

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      {/* Deep space background base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-black to-black" />
      
      {/* Moving Blurry Nebula Glows */}
      <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-white/10 blur-[130px] animate-nebula-1" />
      <div className="absolute top-[30%] -right-[10%] w-[50%] h-[70%] rounded-full bg-neutral-400/10 blur-[160px] animate-nebula-2" />
      <div className="absolute -bottom-[20%] left-[10%] w-[70%] h-[50%] rounded-full bg-neutral-600/15 blur-[120px] animate-nebula-3" />

      {/* Dynamic Moving Star Field */}
      <StarField />
      
      {/* Subtle grid overlay for tech feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
    </div>
  )
}
