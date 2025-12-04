
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppMode } from '../types';
import { COLORS, TREE_CONFIG } from '../constants';

export const TopStar: React.FC = () => {
  const { mode } = useStore();
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const progress = useRef(1);

  // Target: Top of the tree (Tip of the cone)
  // Tree logic: h ranges from 7 (base) to -7 (top) or vice versa?
  // Checking ChristmasTree.tsx: 
  // t=0 (bottom, i=0), h = (1)*height - half = 7. 
  // t=1 (top, i=count), h = 0 - 7 = -7.
  // Wait, in ChristmasTree.tsx:
  // h = (1 - t) * height - (height / 2);
  // If t=0, h = 7. If t=1, h = -7.
  // But radius r = t * radius.
  // At t=0, r=0. At t=1, r=radius.
  // This means the "Top" (pointy part) is at t=0, which is Y=7.
  // So the Star should be at Y = 7.
  const targetPos = useMemo(() => new THREE.Vector3(0, TREE_CONFIG.height / 2, 0), []);
  
  // Chaos: Random position high up
  const chaosPos = useMemo(() => new THREE.Vector3(
    (Math.random() - 0.5) * 30,
    10 + Math.random() * 10,
    (Math.random() - 0.5) * 30
  ), []);

  // Generate 3D Star Geometry (Faceted 5-pointed star)
  const starGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    const points = 5;
    const outerRadius = 1.5;
    const innerRadius = 0.6;
    const depth = 0.4; // Thickness (Front/Back z-offset)

    // Center Front (Index 0)
    vertices.push(0, 0, depth);
    // Center Back (Index 1)
    vertices.push(0, 0, -depth);

    // Generate Ring Points
    for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2; // Start at top
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        
        // Vertices 2 to 11
        vertices.push(
            Math.cos(angle) * r, 
            Math.sin(angle) * r, 
            0
        );
    }

    // Generate Faces
    // We connect Center Front to current and next ring point
    // And Center Back to current and next ring point
    const ringOffset = 2;
    const ringCount = points * 2;
    
    for (let i = 0; i < ringCount; i++) {
        const current = ringOffset + i;
        const next = ringOffset + ((i + 1) % ringCount);
        
        // Front Face (Counter Clockwise)
        indices.push(0, current, next);
        
        // Back Face (Clockwise)
        indices.push(1, next, current);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !materialRef.current) return;

    // Mode interpolation
    const targetProgress = mode === AppMode.FORMED ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, targetProgress, delta * 2);

    // Position Animation
    groupRef.current.position.lerpVectors(chaosPos, targetPos, progress.current);

    // Rotation Animation
    const rotSpeed = mode === AppMode.CHAOS ? 2.0 : 0.5;
    groupRef.current.rotation.y += delta * rotSpeed;
    // Gentle tilt wobble
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1 * progress.current;

    // Pulse Animation (Heartbeat)
    const time = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(time * 2) * 0.05;
    
    // Scale Logic: Full size in Formed, slightly smaller or chaotic in Chaos
    const size = mode === AppMode.CHAOS ? 0.5 : 1.0;
    const finalScale = pulse * size;
    groupRef.current.scale.setScalar(finalScale);

    // Material Animation (Glowing Pulse)
    // Bloom threshold is 0.8, so emissive > 0.8 triggers glow
    const glowIntensity = 1.5 + Math.sin(time * 3) * 0.5; 
    materialRef.current.emissiveIntensity = glowIntensity;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={starGeometry} castShadow receiveShadow>
        <meshStandardMaterial 
          ref={materialRef}
          color={COLORS.gold}
          emissive={COLORS.gold}
          roughness={0.1}
          metalness={1.0}
          toneMapped={false} // Critical for intense bloom
        />
      </mesh>

      {/* Internal Light source for environment reflection */}
      <pointLight 
        color={COLORS.gold} 
        intensity={2} 
        distance={8} 
        decay={2} 
      />
      
      {/* Decorative Sparkles */}
      <Sparkles 
        count={20} 
        scale={3} 
        size={4} 
        speed={0.4} 
        opacity={0.7}
        color="#FFF"
      />
    </group>
  );
};
