"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import styles from "./LiquidOrb.module.css";

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  varying float vPulse;

  float wave(vec3 p) {
    return
      sin(p.x * 3.2 + uTime * 0.68) * 0.36 +
      sin(p.y * 4.8 + uTime * 0.52) * 0.24 +
      sin((p.x + p.z) * 5.4 - uTime * 0.46) * 0.18 +
      sin(length(p.xy) * 7.0 - uTime * 0.72) * 0.14;
  }

  void main() {
    vec3 p = position;
    float mousePull = dot(normalize(normal.xy + 0.001), normalize(uMouse + 0.001));
    float liquid = wave(normal + vec3(uMouse * 0.22, 0.0));
    float displacement = liquid * 0.12 + mousePull * 0.045;
    p += normal * displacement;

    vec4 worldPosition = modelMatrix * vec4(p, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vPositionW = worldPosition.xyz;
    vPulse = liquid;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  varying float vPulse;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vPositionW);
    float fresnel = pow(1.0 - max(dot(viewDirection, normalize(vNormalW)), 0.0), 2.4);
    float bands = sin(vPositionW.y * 7.0 + uTime * 0.55 + vPulse) * 0.5 + 0.5;
    float core = smoothstep(0.12, 1.0, fresnel + bands * 0.12);

    vec3 deep = vec3(0.0, 0.08, 0.105);
    vec3 cyan = vec3(0.0, 0.78, 0.92);
    vec3 hot = vec3(0.66, 0.98, 1.0);
    vec3 color = mix(deep, cyan, core);
    color = mix(color, hot, fresnel * 0.55);

    float alpha = 0.5 + fresnel * 0.56 + bands * 0.12;
    gl_FragColor = vec4(color, alpha);
  }
`;

function LiquidCore() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const targetMouse = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      targetMouse.current.set(
        (event.clientX / window.innerWidth - 0.5) * 2,
        -(event.clientY / window.innerHeight - 0.5) * 2
      );
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    mouse.current.lerp(targetMouse.current, 0.045);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uMouse.value.copy(mouse.current);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18;
      groupRef.current.rotation.x +=
        (mouse.current.y * 0.18 - groupRef.current.rotation.x) * 0.035;
      groupRef.current.rotation.z +=
        (mouse.current.x * 0.12 - groupRef.current.rotation.z) * 0.035;
    }
  });

  return (
    <group ref={groupRef} position={[0.12, -0.02, 0]} scale={1.25}>
      <mesh>
        <sphereGeometry args={[1.12, 96, 96]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh rotation={[0.2, 0.6, -0.18]} scale={1.18}>
        <icosahedronGeometry args={[1.18, 2]} />
        <meshBasicMaterial
          color="#00e5ff"
          wireframe
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function LiquidOrb() {
  return (
    <div className={styles.orb} aria-hidden="true">
      <Canvas
        className={styles.canvas}
        camera={{ position: [0, 0, 4.1], fov: 44 }}
        dpr={[1, 1.45]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
      >
        <ambientLight intensity={0.18} />
        <pointLight position={[2.8, 2.2, 2.8]} intensity={2.2} color="#00e5ff" />
        <pointLight position={[-2.6, -1.8, 2]} intensity={0.85} color="#6befff" />
        <Float speed={0.72} rotationIntensity={0.18} floatIntensity={0.58}>
          <LiquidCore />
        </Float>
      </Canvas>
    </div>
  );
}
