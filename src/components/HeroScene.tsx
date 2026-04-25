/**
 * HeroScene.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Holographic "Quantum Core" — a floating 3D object that sits in the
 * right column of the hero section without touching any existing layout.
 *
 * SCENE COMPOSITION:
 *   Core sphere      → IcosahedronGeometry, glossy dark + cyan emissive
 *   Glow corona      → BackSide sphere, additive blending
 *   Wireframe shell  → IcosahedronGeometry, additive cyan lines
 *   2 torus rings    → thin, tilted at different angles, gently rotating
 *   3 orbiting nodes → small spheres tracing elliptical paths
 *   Particle cloud   → 350 points with additive blending
 *
 * ANIMATIONS (GSAP):
 *   Entrance         → scale 0 → 1 with elastic ease on mount
 *   Idle float       → sinusoidal y movement (GSAP yoyo repeat)
 *   Idle rotation    → delta-time RAF loop, slow on all axes
 *   Mouse parallax   → scene.rotation reacts to cursor position
 *   Orbit nodes      → custom RAF update on each node's angle
 *
 * INSERTION:
 *   Import and add <HeroScene /> directly inside the hero <section>,
 *   right after the .heroBg motion.div. The canvas is position:absolute,
 *   pointer-events:none, z-index:0 — sits between background and content.
 *
 * PERFORMANCE:
 *   • No textures, no post-processing, no heavy shaders
 *   • AdditiveBlending for glow without bloom pass overhead
 *   • ResizeObserver for clean renderer resizing
 *   • Full dispose on unmount (geometries, materials, renderer)
 *   • Hidden on mobile via CSS (performance + layout)
 * ─────────────────────────────────────────────────────────────────────
 */
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

/* ── Cyan palette ────────────────────────────────────── */
const C = {
  CYAN:       0x00E5FF,
  CYAN_DIM:   0x004466,
  DARK_CORE:  0x000d1a,
  WHITE_BLUE: 0x88ddff,
};

/* ── Helpers ─────────────────────────────────────────── */

/** Create a thin flat ring (TorusGeometry) with additive blending */
function makeRing(radius: number, tube: number, tiltX: number, tiltZ: number) {
  const geo = new THREE.TorusGeometry(radius, tube, 6, 180);
  const mat = new THREE.MeshBasicMaterial({
    color: C.CYAN,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = tiltX;
  mesh.rotation.z = tiltZ;
  return mesh;
}

/** Create a small orbiting satellite node */
function makeNode(radius: number, emissiveIntensity: number) {
  const geo = new THREE.SphereGeometry(0.055, 12, 12);
  const mat = new THREE.MeshStandardMaterial({
    color: C.CYAN,
    emissive: C.CYAN,
    emissiveIntensity,
    metalness: 0.3,
    roughness: 0.1,
  });
  return new THREE.Mesh(geo, mat);
}

/** Create the particle field surrounding the core */
function makeParticles(count: number, spread: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    /* Distribute in a sphere volume, denser toward edges */
    const phi   = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r     = spread * (0.6 + Math.random() * 0.4);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: C.CYAN,
    size: 0.025,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

/* ── Component ───────────────────────────────────────── */
export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,       // transparent background
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.cssText = `
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 0;
    `;
    container.appendChild(renderer.domElement);

    /* ── Scene + Camera ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1, 100,
    );
    camera.position.set(0, 0, 8);

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    /* ── Lighting ── */
    // Soft ambient fill
    scene.add(new THREE.AmbientLight(0x112233, 0.6));

    // Primary cyan key light
    const keyLight = new THREE.PointLight(C.CYAN, 4.5, 12);
    keyLight.position.set(4, 3, 4);
    scene.add(keyLight);

    // Cool blue-white fill from opposite side
    const fillLight = new THREE.PointLight(C.WHITE_BLUE, 2.0, 10);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    // Subtle rim from below
    const rimLight = new THREE.PointLight(C.CYAN, 1.2, 8);
    rimLight.position.set(0, -4, 1);
    scene.add(rimLight);

    /* ── Master group — offset right to align with photo column ── */
    const mainGroup = new THREE.Group();
    mainGroup.position.set(2.6, 0, 0);
    scene.add(mainGroup);

    /* ── 1. Solid core sphere ── */
    const coreGeo = new THREE.IcosahedronGeometry(1.18, 4);
    const coreMat = new THREE.MeshStandardMaterial({
      color: C.DARK_CORE,
      emissive: C.CYAN,
      emissiveIntensity: 0.12,
      metalness: 0.9,
      roughness: 0.08,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    /* ── 2. Inner glow corona (BackSide trick) ── */
    const glowGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: C.CYAN,
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    mainGroup.add(new THREE.Mesh(glowGeo, glowMat));

    /* ── 3. Wide soft glow halo ── */
    const haloGeo = new THREE.SphereGeometry(2.0, 24, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: C.CYAN,
      transparent: true,
      opacity: 0.018,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    mainGroup.add(new THREE.Mesh(haloGeo, haloMat));

    /* ── 4. Outer wireframe shell ── */
    const wireGeo  = new THREE.IcosahedronGeometry(1.55, 2);
    const wireEdge = new THREE.EdgesGeometry(wireGeo);
    const wireMat  = new THREE.LineBasicMaterial({
      color: C.CYAN,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wireMesh = new THREE.LineSegments(wireEdge, wireMat);
    mainGroup.add(wireMesh);

    /* ── 5. Inner wireframe (slightly smaller, different detail) ── */
    const wire2Geo  = new THREE.IcosahedronGeometry(1.26, 1);
    const wire2Edge = new THREE.EdgesGeometry(wire2Geo);
    const wire2Mat  = new THREE.LineBasicMaterial({
      color: C.CYAN,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wire2Mesh = new THREE.LineSegments(wire2Edge, wire2Mat);
    mainGroup.add(wire2Mesh);

    /* ── 6. Torus rings ── */
    const ring1 = makeRing(1.95, 0.007, Math.PI * 0.12,  Math.PI * 0.06);
    const ring2 = makeRing(2.45, 0.005, -Math.PI * 0.08, Math.PI * 0.14);
    const ring3 = makeRing(2.85, 0.004, Math.PI * 0.45,  Math.PI * 0.22);
    (ring3.material as THREE.MeshBasicMaterial).opacity = 0.28;
    mainGroup.add(ring1, ring2, ring3);

    /* ── 7. Orbiting nodes ── */
    const node1 = makeNode(1.0, 2.8); // close, bright
    const node2 = makeNode(0.8, 2.2); // medium
    const node3 = makeNode(0.6, 1.6); // distant, dimmer
    mainGroup.add(node1, node2, node3);

    // Each node has orbit params: { radius, speed, phase, tiltX, tiltZ }
    const nodeOrbits = [
      { mesh: node1, r: 1.78, speed: 0.65, phase: 0,              tiltX: 0.3,  tiltZ: 0.1  },
      { mesh: node2, r: 2.30, speed: 0.42, phase: Math.PI * 0.6,  tiltX: -0.5, tiltZ: 0.4  },
      { mesh: node3, r: 2.80, speed: 0.28, phase: Math.PI * 1.2,  tiltX: 0.7,  tiltZ: -0.2 },
    ];

    /* ── 8. Particle cloud ── */
    const particles = makeParticles(350, 3.2);
    mainGroup.add(particles);

    /* ── GSAP: entrance animation ── */
    mainGroup.scale.set(0, 0, 0);
    gsap.to(mainGroup.scale, {
      x: 1, y: 1, z: 1,
      duration: 1.4,
      delay: 0.4,
      ease: 'elastic.out(1, 0.55)',
    });

    /* ── GSAP: idle floating (vertical sine) ── */
    gsap.to(mainGroup.position, {
      y: 0.28,
      duration: 2.8,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    /* ── GSAP: pulsing glow intensity ── */
    gsap.to(coreMat, {
      emissiveIntensity: 0.22,
      duration: 2.1,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    /* ── Mouse parallax ── */
    const mouse = { x: 0, y: 0 };
    const target = { rx: 0, ry: 0 };

    function onMouseMove(e: MouseEvent) {
      // Normalize to [-0.5, 0.5]
      mouse.x = (e.clientX / window.innerWidth)  - 0.5;
      mouse.y = (e.clientY / window.innerHeight) - 0.5;
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    /* ── Render loop ── */
    let rafId = 0;
    let last  = 0;

    function tick(t: number) {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min((t - last) / 1000, 0.05); // cap delta at 50ms
      last = t;

      /* Core + wireframe rotation — subtle, different axes */
      coreMesh.rotation.y  += dt * 0.14;
      coreMesh.rotation.x  += dt * 0.06;
      wireMesh.rotation.y  -= dt * 0.09;
      wireMesh.rotation.z  += dt * 0.04;
      wire2Mesh.rotation.y += dt * 0.18;
      wire2Mesh.rotation.x -= dt * 0.07;

      /* Rings rotate on their own axis */
      ring1.rotation.y += dt * 0.22;
      ring2.rotation.y -= dt * 0.16;
      ring3.rotation.x += dt * 0.08;

      /* Particle cloud slow spin */
      particles.rotation.y += dt * 0.04;
      particles.rotation.z += dt * 0.02;

      /* Orbiting nodes — circular path on tilted planes */
      const now = t / 1000;
      nodeOrbits.forEach(({ mesh, r, speed, phase, tiltX, tiltZ }) => {
        const angle = now * speed + phase;
        // Position on a tilted circle
        mesh.position.x = r * Math.cos(angle);
        mesh.position.y = r * Math.sin(angle) * Math.cos(tiltX) - r * 0.5 * Math.sin(tiltX);
        mesh.position.z = r * Math.sin(angle) * Math.sin(tiltX) * 0.6 + Math.cos(tiltZ) * 0.3;
      });

      /* Mouse parallax — LERP toward target for smooth lag */
      target.rx += (mouse.y *  0.35 - target.rx) * 0.04;
      target.ry += (mouse.x * -0.35 - target.ry) * 0.04;
      scene.rotation.x = target.rx;
      scene.rotation.y = target.ry;

      renderer.render(scene, camera);
    }
    rafId = requestAnimationFrame(tick);

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);

      // Dispose all geometries and materials
      [
        coreGeo, glowGeo, haloGeo, wireGeo, wireEdge,
        wire2Geo, wire2Edge,
        ring1.geometry, ring2.geometry, ring3.geometry,
        node1.geometry, node2.geometry, node3.geometry,
        particles.geometry,
      ].forEach(g => g.dispose());

      [
        coreMat, glowMat, haloMat, wireMat, wire2Mat,
        ring1.material, ring2.material, ring3.material,
        node1.material, node2.material, node3.material,
        particles.material,
      ].forEach(m => (m as THREE.Material).dispose());

      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    /**
     * This div covers the entire hero section (absolute + inset-0).
     * pointer-events: none ensures hero links and buttons remain clickable.
     * z-index: 0 places it above the dot/grid background (no z-index)
     * but below heroInner (z-index: 1).
     *
     * Hidden on small screens via .heroScene CSS class (< 1024px)
     * to avoid performance impact on mobile.
     */
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      className="heroScene"
    />
  );
}
