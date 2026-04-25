'use client';

/**
 * Scene3D — Organic blob sphere (Lusion / threejs.org inspired)
 *
 * Composition:
 *   • Inner sphere with shader-based noise distortion (MeshDistortMaterial)
 *     → soft, wobbling "liquid" core. Hover = more distortion + faster speed.
 *       Click = burst: distort + speed spike that decays.
 *   • Outer low-poly icosahedron wireframe acting as scaffolding (rotates
 *     in the opposite direction — a visual beat you see on Lusion/threejs
 *     showreels).
 *   • Particle halo orbiting the pair for depth.
 *   • Gentle Float bob (drei) so the whole group breathes.
 *   • Scroll adjusts distortion amplitude — the blob "tenses up" as you scroll.
 *
 * Camera is fixed; no OrbitControls (the canvas is embedded in a frame,
 * not a full viewport — orbiting inside a small frame feels bad).
 */

import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

const CYAN = '#00E5FF';
const CYAN_EDGE = '#00B8D4';
const PARTICLE_COUNT = 400;
const PARTICLE_RADIUS = 4;

/* ─── Blob — distorted sphere core ──────────── */

function Blob() {
  const meshRef = useRef<THREE.Mesh>(null);
  // MeshDistortMaterial doesn't export a typed ref — any is fine here
  const matRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const pressedRef = useRef(0); // 0..1, decays after click

  useFrame((state, delta) => {
    const { pointer } = state;
    const scroll =
      typeof window !== 'undefined'
        ? Math.min(window.scrollY / window.innerHeight, 1)
        : 0;

    // Core mesh: slow rotation + mouse tilt
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.25;
      meshRef.current.rotation.x +=
        (pointer.y * 0.35 - meshRef.current.rotation.x) * 0.05;
    }

    // Press decay
    if (pressedRef.current > 0) {
      pressedRef.current = Math.max(0, pressedRef.current - delta * 1.4);
    }

    // Morph distortion in response to state
    if (matRef.current) {
      const targetDistort =
        0.3 + (hovered ? 0.18 : 0) + pressedRef.current * 0.4 + scroll * 0.2;
      const targetSpeed =
        1.8 + (hovered ? 1.8 : 0) + pressedRef.current * 4 + scroll * 1.5;
      matRef.current.distort += (targetDistort - matRef.current.distort) * 0.08;
      matRef.current.speed += (targetSpeed - matRef.current.speed) * 0.08;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        if (typeof document !== 'undefined') document.body.style.cursor = '';
      }}
      onClick={(e) => {
        e.stopPropagation();
        pressedRef.current = 1;
      }}
    >
      <sphereGeometry args={[1.15, 128, 128]} />
      <MeshDistortMaterial
        ref={matRef}
        color={CYAN_EDGE}
        emissive={CYAN}
        emissiveIntensity={0.35}
        roughness={0.1}
        metalness={0.75}
        distort={0.3}
        speed={1.8}
      />
    </mesh>
  );
}

/* ─── Wireframe scaffolding ─────────────────── */

function Scaffold() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y -= delta * 0.18;
    ref.current.rotation.x += delta * 0.08;
    ref.current.rotation.z += delta * 0.04;
    // Gentle breathing
    const s = 1 + Math.sin(state.clock.getElapsedTime() * 0.6) * 0.015;
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.6, 1]} />
      <meshBasicMaterial
        color={CYAN}
        wireframe
        transparent
        opacity={0.22}
      />
    </mesh>
  );
}

/* ─── Particle halo ─────────────────────────── */

function Particles() {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Shell-biased distribution so most particles sit near radius
      const r =
        PARTICLE_RADIUS * (0.55 + Math.pow(Math.random(), 0.5) * 0.45);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.04;
    ref.current.rotation.x += delta * 0.015;
    ref.current.rotation.z = state.pointer.x * 0.08;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        transparent
        color={CYAN}
        size={0.022}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </points>
  );
}

/* ─── Camera responsive adjust ──────────────── */

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useFrame(() => {
    const target = size.width < 500 ? 4.5 : 3.8;
    camera.position.z += (target - camera.position.z) * 0.08;
  });
  return null;
}

/* ─── Exported scene ────────────────────────── */

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.8], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 4, 4]} intensity={1.4} color={CYAN} />
      <pointLight position={[-3, -2, 2]} intensity={0.7} color="#ffffff" />
      <pointLight position={[0, 0, -4]} intensity={0.5} color={CYAN} />

      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.6}>
          <Blob />
          <Scaffold />
        </Float>
        <Particles />
      </Suspense>

      <ResponsiveCamera />
    </Canvas>
  );
}
