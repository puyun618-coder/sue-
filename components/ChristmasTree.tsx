import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppMode } from '../types';
import { COLORS, TREE_CONFIG } from '../constants';

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  
  attribute vec3 chaosPos;
  attribute vec3 targetPos;
  attribute float size;
  attribute float speed;
  
  varying vec3 vColor;
  
  void main() {
    // Lerp between positions
    vec3 pos = mix(chaosPos, targetPos, uProgress);
    
    // Add some organic wind movement
    float wind = sin(uTime * speed + pos.y * 0.5) * 0.1;
    pos.x += wind * (1.0 - uProgress); // More wind in chaos
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = size * (300.0 / -mvPosition.z);
    
    // Color mixing (Emerald to Gold highlights)
    vColor = mix(vec3(0.0, 0.34, 0.29), vec3(1.0, 0.84, 0.0), sin(uTime * speed) * 0.5 + 0.5);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Circular particle
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    
    // Soft glow
    float glow = 1.0 - r;
    gl_FragColor = vec4(vColor, glow * 0.8);
  }
`;

export const ChristmasTree: React.FC = () => {
  const { mode } = useStore();
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Current animation progress (0 = Chaos, 1 = Formed)
  const progress = useRef(1);

  const { positions, chaosPositions, sizes, speeds } = useMemo(() => {
    const count = TREE_CONFIG.needleCount;
    const pos = new Float32Array(count * 3);
    const chaos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const sp = new Float32Array(count);
    
    const { height, radius } = TREE_CONFIG;

    for (let i = 0; i < count; i++) {
      // Formed: Cone Spiral
      const t = i / count;
      const angle = t * Math.PI * 60; // Many turns
      const h = (1 - t) * height - (height / 2); // Bottom to top
      const r = t * radius;
      
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = h;
      
      // Jitter for volume
      pos[i * 3] = x + (Math.random() - 0.5);
      pos[i * 3 + 1] = y + (Math.random() - 0.5);
      pos[i * 3 + 2] = z + (Math.random() - 0.5);
      
      // Chaos: Sphere cloud
      const cx = (Math.random() - 0.5) * 30;
      const cy = (Math.random() - 0.5) * 30;
      const cz = (Math.random() - 0.5) * 30;
      
      chaos[i * 3] = cx;
      chaos[i * 3 + 1] = cy;
      chaos[i * 3 + 2] = cz;
      
      sz[i] = Math.random() * 0.3 + 0.1;
      sp[i] = Math.random() + 0.5;
    }
    
    return { positions: pos, chaosPositions: chaos, sizes: sz, speeds: sp };
  }, []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    
    // Animate Progress
    const targetProgress = mode === AppMode.FORMED ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, targetProgress, delta * 2);
    
    materialRef.current.uniforms.uProgress.value = progress.current;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Rotate slowly
    if (meshRef.current && progress.current > 0.8) {
        meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // This acts as targetPos for ShaderMaterial, but strictly it's the geometry pos
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-targetPos"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-chaosPos"
          count={chaosPositions.length / 3}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-speed"
          count={speeds.length}
          array={speeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 1 }
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
