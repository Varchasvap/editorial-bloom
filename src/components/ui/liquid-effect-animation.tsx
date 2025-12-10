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
        // Arashiyama Bamboo Grove Image
        app.loadImage('https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=2992&auto=format&fit=crop');
        app.liquidPlane.material.metalness = 0.1; // Low shine for natural look
        app.liquidPlane.material.roughness = 0.9; // Matte texture
        app.liquidPlane.uniforms.displacementScale.value = 2; // Gentle ripples
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
      {/* Light Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-white/20" />
    </div>
  )
}
