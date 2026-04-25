/**
 * Card3DWindow.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Creates a "3D window" inside a project card by:
 *   1. Rendering a tracked <div> (the window frame) in the card's DOM
 *   2. Registering a <View track={windowRef}> that portals into the
 *      global R3F Canvas via drei's tunnel mechanism
 *   3. Managing DOM hover state and mouse position within the window
 *   4. Passing those values as props to the 3D object
 *
 * WHY THIS FEELS LIKE "SAME PHYSICAL SPACE":
 *   The canvas renders the 3D object at the exact screen coordinates
 *   of the tracked div. Since the canvas is transparent everywhere else,
 *   the object appears to float directly on top of the card — no iframe,
 *   no separate context. The pointer parallax (mouse position → 3D tilt)
 *   reinforces the depth illusion: the object rotates toward your cursor
 *   as if it were a real object on the desk behind the screen.
 *
 * USAGE:
 *   <Card3DWindow category={project.category} index={i} />
 *   — Drop inside any project card JSX. Self-contained.
 * ─────────────────────────────────────────────────────────────────────
 */
'use client';

import { useRef, useState, useCallback, Suspense } from 'react';
import { View, PerspectiveCamera, Environment } from '@react-three/drei';
import {
  FullStackObject,
  BackendObject,
  FrontendObject,
  ToolingObject,
  DefaultObject,
} from './CardObjects';
import styles from './Card3DWindow.module.css';

interface Props {
  category: string;
  index: number;
}

/* Map category → 3D object component */
function CategoryObject({
  category, hovered, pointer,
}: {
  category: string;
  hovered: boolean;
  pointer: { x: number; y: number };
}) {
  const shared = { hovered, pointer };
  switch (category) {
    case 'Full Stack':  return <FullStackObject {...shared} />;
    case 'Back-end':    return <BackendObject   {...shared} />;
    case 'Front-end':   return <FrontendObject  {...shared} />;
    case 'Tooling':     return <ToolingObject   {...shared} />;
    default:            return <DefaultObject   {...shared} />;
  }
}

export default function Card3DWindow({ category, index }: Props) {
  /* The DOM element that <View> will track for screen position */
  const windowRef = useRef<HTMLDivElement>(null);

  /* DOM-driven interaction state — no raycasting needed */
  const [hovered, setHovered] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  /* Normalize mouse position within the window to [-1, 1] */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x =  ((e.clientX - rect.left)  / rect.width  - 0.5) * 2;
    const y = -((e.clientY - rect.top)   / rect.height - 0.5) * 2; // flip Y
    setPointer({ x, y });
  }, []);

  const handleEnter = useCallback(() => setHovered(true),  []);
  const handleLeave = useCallback(() => {
    setHovered(false);
    setPointer({ x: 0, y: 0 }); // reset tilt on leave
  }, []);

  return (
    <div
      ref={windowRef}
      className={`${styles.window} ${hovered ? styles.windowHovered : ''}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMouseMove}
      aria-hidden="true"
    >
      {/* ── Decorative frame ──────────────────────────────
        Corner accents that glow on hover. Pure CSS/DOM —
        NOT Three.js. This reinforces the "window" metaphor
        and makes the card feel premium even before hover.   */}
      <div className={styles.corner} data-pos="tl" />
      <div className={styles.corner} data-pos="tr" />
      <div className={styles.corner} data-pos="bl" />
      <div className={styles.corner} data-pos="br" />

      {/* ── Scan-line overlay ── */}
      <div className={styles.scanline} aria-hidden="true" />

      {/* ── Category label ── */}
      <span className={styles.label}>{getLabel(category, index)}</span>

      {/*
        The View portals into the global R3F Canvas.
        Everything inside is R3F JSX (Three.js), not HTML.
        track={windowRef} binds it to this DOM element's screen rect.
      */}
      <View track={windowRef as React.MutableRefObject<HTMLElement>}>
        {/* Each View needs its own camera */}
        <PerspectiveCamera makeDefault position={[0, 0, 3.2]} fov={50} />

        {/* Lighting — per View, not shared */}
        <ambientLight intensity={0.25} color="#112244" />
        <pointLight position={[2, 2, 3]}  intensity={3.5} color="#00E5FF" />
        <pointLight position={[-2, -1, 2]} intensity={1.5} color="#0044BB" />
        {/* Rim light from below for depth */}
        <pointLight position={[0, -2, 1]}  intensity={1.0} color="#00E5FF" />

        <Suspense fallback={null}>
          <CategoryObject
            category={category}
            hovered={hovered}
            pointer={pointer}
          />
        </Suspense>
      </View>
    </div>
  );
}

/* ── Helper: unique monospace label per card ── */
function getLabel(category: string, index: number): string {
  const map: Record<string, string> = {
    'Full Stack':  'SYS.FULL',
    'Back-end':    'SYS.BACK',
    'Front-end':   'SYS.FRNT',
    'Tooling':     'SYS.TOOL',
  };
  const num = String(index + 1).padStart(2, '0');
  return `${map[category] ?? 'SYS.NODE'} // v${num}`;
}
