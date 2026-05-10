/**
 * CardObjects.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Four signature 3D objects, one per project category.
 * Each reacts to:
 *   • hovered  — boolean, from card's onMouseEnter/Leave
 *   • pointer  — {x,y} in [-1,1], from card's onMouseMove (parallax tilt)
 *
 * All share:
 *   • Dark base color (#050810) + cyan emissive (#00E5FF)
 *   • Float animation (drei <Float>)
 *   • useFrame hover lerp: scale, emissive intensity, rotation speed
 *   • Pointer parallax: tilts the group toward cursor offset
 *
 * This creates the "physically present" feeling — the object responds
 * to your exact cursor position within the card.
 * ─────────────────────────────────────────────────────────────────────
 */
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Line, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ── Shared constants ─────────────────────────────────── */
const CYAN      = new THREE.Color('#00E5FF');
const DARK_BASE = new THREE.Color('#020810');

interface ObjectProps {
  hovered: boolean;
  pointer: { x: number; y: number };
}

/* ══════════════════════════════════════
   FULL STACK — "Orbital Network"
   3 satellites orbiting a core node,
   connected by glowing cyan lines.
   Represents: multi-tier, interconnected.
══════════════════════════════════════ */
export function FullStackObject({ hovered, pointer }: ObjectProps) {
  const groupRef  = useRef<THREE.Group>(null);
  const coreRef   = useRef<THREE.Mesh>(null);
  const matRef    = useRef<THREE.MeshStandardMaterial>(null);

  /* Satellite positions — 3 small spheres tracing circles */
  const satellites = useMemo(() => [
    { r: 0.68, speed: 0.7,  phase: 0,                  tiltX: 0.4,  tiltZ: 0.1  },
    { r: 0.58, speed: -0.5, phase: Math.PI * 0.66,     tiltX: -0.6, tiltZ: 0.5  },
    { r: 0.72, speed: 0.35, phase: Math.PI * 1.33,     tiltX: 0.2,  tiltZ: -0.4 },
  ], []);

  const satRefs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ] as React.MutableRefObject<THREE.Mesh | null>[];

  /* Line positions buffer — updated each frame */
  const linePoints = useRef<[THREE.Vector3, THREE.Vector3][]>([
    [new THREE.Vector3(), new THREE.Vector3()],
    [new THREE.Vector3(), new THREE.Vector3()],
    [new THREE.Vector3(), new THREE.Vector3()],
  ]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !coreRef.current || !matRef.current) return;
    const t   = clock.elapsedTime;
    const dt  = 0.05; // lerp factor

    /* Hover: emissive + scale lerp */
    const targetEmissive = hovered ? 0.55 : 0.15;
    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity, targetEmissive, dt,
    );
    const targetScale = hovered ? 1.15 : 1.0;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale), dt,
    );

    /* Pointer parallax — tilt group toward cursor */
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, pointer.y * 0.4, dt,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, pointer.x * 0.4, dt,
    );

    /* Core slow spin */
    coreRef.current.rotation.y += 0.004;
    coreRef.current.rotation.x += 0.002;

    /* Satellite orbits */
    satellites.forEach((orb, i) => {
      const sat = satRefs[i].current;
      if (!sat) return;
      const a = t * orb.speed + orb.phase;
      sat.position.x = orb.r * Math.cos(a);
      sat.position.y = orb.r * Math.sin(a) * Math.cos(orb.tiltX);
      sat.position.z = orb.r * Math.sin(a) * Math.sin(orb.tiltX) * 0.5;
    });
  });

  const satMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: DARK_BASE,
    emissive: CYAN,
    emissiveIntensity: 0.8,
    metalness: 0.4,
    roughness: 0.1,
  }), []);

  return (
    <group ref={groupRef}>
      {/* Core */}
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.28, 1]} />
          <meshStandardMaterial
            ref={matRef}
            color={DARK_BASE}
            emissive={CYAN}
            emissiveIntensity={0.15}
            metalness={0.95}
            roughness={0.05}
          />
        </mesh>
      </Float>

      {/* Satellites */}
      {satellites.map((_, i) => (
        <mesh key={i} ref={satRefs[i] as React.MutableRefObject<THREE.Mesh>}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <primitive object={satMat} />
        </mesh>
      ))}

      {/* Orbital rings (static, purely decorative) */}
      {[{ r: 0.68, tX: 0.4, tZ: 0.1 }, { r: 0.58, tX: -0.6, tZ: 0.5 }].map((ring, i) => (
        <mesh key={i} rotation={[ring.tX, 0, ring.tZ]}>
          <torusGeometry args={[ring.r, 0.006, 6, 80]} />
          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={hovered ? 0.45 : 0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ══════════════════════════════════════
   BACK-END — "Torus Knot"
   A (2,3) torus knot — complex, precise,
   elegant. Represents: intricate backend logic.
══════════════════════════════════════ */
export function BackendObject({ hovered, pointer }: ObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef   = useRef<THREE.MeshStandardMaterial>(null);
  const knotRef  = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !matRef.current || !knotRef.current) return;
    const dt = 0.05;

    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity, hovered ? 0.6 : 0.12, dt,
    );
    const ts = hovered ? 1.1 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(ts, ts, ts), dt);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.35, dt);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.35, dt);

    /* Knot self-rotation */
    knotRef.current.rotation.y += hovered ? 0.018 : 0.006;
    knotRef.current.rotation.z += 0.003;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.4}>
        <mesh ref={knotRef}>
          <torusKnotGeometry args={[0.38, 0.1, 160, 16, 2, 3]} />
          <meshStandardMaterial
            ref={matRef}
            color={DARK_BASE}
            emissive={CYAN}
            emissiveIntensity={0.12}
            metalness={0.95}
            roughness={0.04}
          />
        </mesh>

        {/* Faint outer glow duplicate */}
        <mesh>
          <torusKnotGeometry args={[0.38, 0.11, 160, 16, 2, 3]} />
          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={hovered ? 0.06 : 0.02}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Float>
    </group>
  );
}

/* ══════════════════════════════════════
   FRONT-END — "Dodecahedron"
   12-faced polygon + wireframe shell.
   Represents: geometric precision, UI components.
══════════════════════════════════════ */
export function FrontendObject({ hovered, pointer }: ObjectProps) {
  const groupRef  = useRef<THREE.Group>(null);
  const solidRef  = useRef<THREE.Mesh>(null);
  const wireRef   = useRef<THREE.Mesh>(null);
  const matRef    = useRef<THREE.MeshStandardMaterial>(null);
  const wireMat   = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!groupRef.current || !matRef.current || !solidRef.current || !wireRef.current || !wireMat.current) return;
    const dt = 0.05;

    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity, hovered ? 0.5 : 0.1, dt,
    );
    wireMat.current.opacity = THREE.MathUtils.lerp(
      wireMat.current.opacity, hovered ? 0.55 : 0.2, dt,
    );
    const ts = hovered ? 1.12 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(ts, ts, ts), dt);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.4, dt);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.4, dt);

    solidRef.current.rotation.y += 0.007;
    solidRef.current.rotation.x += 0.004;
    wireRef.current.rotation.y  -= 0.004;
    wireRef.current.rotation.z  += 0.003;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2.2} rotationIntensity={0.3} floatIntensity={0.35}>
        {/* Solid core */}
        <mesh ref={solidRef}>
          <dodecahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial
            ref={matRef}
            color={DARK_BASE}
            emissive={CYAN}
            emissiveIntensity={0.1}
            metalness={0.8}
            roughness={0.1}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Wireframe shell — slightly larger */}
        <mesh ref={wireRef}>
          <dodecahedronGeometry args={[0.56, 0]} />
          <meshBasicMaterial
            ref={wireMat}
            color={CYAN}
            wireframe
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Float>
    </group>
  );
}

/* ══════════════════════════════════════
   TOOLING — "Crystal"
   Sharp octahedron with highlighted edges.
   Represents: precise, faceted tool design.
══════════════════════════════════════ */
export function ToolingObject({ hovered, pointer }: ObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef   = useRef<THREE.MeshStandardMaterial>(null);
  const octaRef  = useRef<THREE.Group>(null);

  /* Compute EdgesGeometry once */
  const edgesGeo = useMemo(() => {
    const base = new THREE.OctahedronGeometry(0.52, 0);
    return new THREE.EdgesGeometry(base);
  }, []);

  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame(() => {
    if (!groupRef.current || !matRef.current || !octaRef.current) return;
    const dt = 0.05;

    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity, hovered ? 0.65 : 0.12, dt,
    );
    const ts = hovered ? 1.15 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(ts, ts, ts), dt);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.4, dt);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.4, dt);

    octaRef.current.rotation.y += hovered ? 0.022 : 0.009;
    octaRef.current.rotation.x += 0.004;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2.0} rotationIntensity={0.25} floatIntensity={0.3}>
        <group ref={octaRef}>
          {/* Solid facets */}
          <mesh>
            <octahedronGeometry args={[0.52, 0]} />
            <meshStandardMaterial
              ref={matRef}
              color={DARK_BASE}
              emissive={CYAN}
              emissiveIntensity={0.12}
              metalness={0.98}
              roughness={0.03}
            />
          </mesh>

          {/* Sharp edge highlight */}
          <lineSegments geometry={edgesGeo}>
            <primitive object={edgeMat} />
          </lineSegments>
        </group>
      </Float>
    </group>
  );
}

/* ── Default fallback (used for unrecognized categories) ── */
export function DefaultObject({ hovered, pointer }: ObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef   = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    if (!groupRef.current || !matRef.current) return;
    const dt = 0.05;
    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity, hovered ? 0.5 : 0.12, dt,
    );
    const ts = hovered ? 1.15 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(ts, ts, ts), dt);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.4, dt);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.4, dt);
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.35}>
        <mesh>
          <icosahedronGeometry args={[0.45, 1]} />
          <meshStandardMaterial
            ref={matRef}
            color={DARK_BASE}
            emissive={CYAN}
            emissiveIntensity={0.12}
            metalness={0.9}
            roughness={0.06}
          />
        </mesh>
      </Float>
    </group>
  );
}
