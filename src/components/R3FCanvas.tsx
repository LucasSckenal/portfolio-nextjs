/**
 * R3FCanvas.tsx
 * ─────────────────────────────────────────────────────────────────────
 * One global Canvas for the entire app, injected at the bottom of <body>
 * via layout.tsx. All <View> instances from any page portal their content
 * here through drei's tunnel-rat mechanism.
 *
 * Z-INDEX LAYERING:
 *   body bg          z: 0  (page)
 *   Card backgrounds z: auto (normal flow)
 *   This Canvas      z: 50  (3D objects float above card bg, below header)
 *   Header           z: 100
 *   Modals           z: 2000
 *
 * pointer-events: none — all interaction goes through the DOM elements.
 * DOM hover state is passed as props into the 3D scene (no raycasting needed).
 * ─────────────────────────────────────────────────────────────────────
 */
'use client';

import { Canvas } from '@react-three/fiber';
import { View, Preload } from '@react-three/drei';
import { Suspense } from 'react';

export default function R3FCanvas() {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50,
      }}
      gl={{
        antialias: true,
        alpha: true,          // transparent background everywhere except View objects
        powerPreference: 'high-performance',
        stencil: false,
      }}
      dpr={[1, 1.5]}          // cap at 1.5 for performance with multiple Views
      shadows={false}         // no shadows — cheaper
      camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 100 }}
    >
      {/*
        View.Port is the "receiver" — it draws the content of every
        <View track={ref}> that has been registered anywhere in the app.
        Suspense catches the async geometry/texture loads gracefully.
      */}
      <Suspense fallback={null}>
        <View.Port />
      </Suspense>

      {/* Preload any async assets in View scenes */}
      <Preload all />
    </Canvas>
  );
}
