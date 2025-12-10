"use client"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    __liquidApp?: {
      dispose?: () => void;
      loadImage?: (url: string) => void;
      liquidPlane?: any;
      setRain?: (val: boolean) => void;
    };
  }
}

export function LiquidEffectAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const script = document.createElement("script")
    script.type = "module"
    script.textContent = `
      import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
      const canvas = document.getElementById('liquid-canvas');
      if (canvas) {
        const app = LiquidBackground(canvas);
        app.loadImage('https://i.pinimg.com/1200x/38/71/c9/3871c9c7a6066df6763c97dc3285c907.jpg');
        app.liquidPlane.material.metalness = 0.75;
        app.liquidPlane.material.roughness = 0.25;
        app.liquidPlane.uniforms.displacementScale.value = 5;
        app.setRain(false);
        window.__liquidApp = app;
      }
    `
    document.body.appendChild(script)
    return () => {
      if (window.__liquidApp && window.__liquidApp.dispose) window.__liquidApp.dispose()
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="fixed inset-0 m-0 w-full h-full touch-none overflow-hidden -z-10">
      <canvas ref={canvasRef} id="liquid-canvas" className="fixed inset-0 w-full h-full" />
      {/* THE WARM PAPER OVERLAY - Critical for the vibe */}
      <div className="absolute inset-0 bg-paper/90 mix-blend-overlay opacity-90" />
      <div className="absolute inset-0 bg-paper/80" />
    </div>
  )
}
