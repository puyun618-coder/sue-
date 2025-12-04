import React, { useRef, useState } from 'react';
import { Image, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppMode, GestureType } from '../types';

interface PhotoProps {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

const PhotoFrame: React.FC<PhotoProps> = ({ url, position, rotation }) => {
  const { mode, gesture } = useStore();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  
  // Local animation state
  const targetScale = useRef(1);
  const targetPos = useRef(new THREE.Vector3(...position));

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Movement logic linked to Tree mode
    if (mode === AppMode.CHAOS) {
      // Float randomly in chaos
      // We can use a noise function or simple sine waves based on position
      const time = state.clock.elapsedTime;
      const offset = Math.sin(time + position[0]) * 5;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1] + offset, delta);
      groupRef.current.rotation.z += delta * 0.2;
    } else {
      // Return to tree position
       // Rotate whole tree effect
       const globalRot = state.clock.elapsedTime * 0.1;
       const cos = Math.cos(globalRot);
       const sin = Math.sin(globalRot);
       const px = position[0];
       const pz = position[2];
       
       const rotX = px * cos - pz * sin;
       const rotZ = px * sin + pz * cos;

       groupRef.current.position.lerp(new THREE.Vector3(rotX, position[1], rotZ), delta * 2);
       groupRef.current.rotation.y = -globalRot + rotation[1];
       groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, rotation[2], delta * 2);
    }

    // Interaction Logic
    let s = 1;
    if (hovered) s = 1.2;
    if (gesture === GestureType.PINCH && hovered) {
       // Simulate "Pinch" zooming in (or out, but let's say pinch activates focus)
       s = 2.5;
       setZoomed(true);
    } else if (gesture !== GestureType.PINCH) {
       setZoomed(false);
    }
    
    groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), delta * 5);
  });

  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
    >
      {/* Polaroid Frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[1.2, 1.5, 0.1]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
      </mesh>
      
      {/* Image */}
      <Image 
        url={url} 
        position={[0, 0.15, 0.06]}
        scale={[1, 1]}
        transparent
      />
      
      {/* Text Label */}
      <Text
        position={[0, -0.6, 0.06]}
        fontSize={0.1}
        color="#333"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
      >
        Memories
      </Text>
    </group>
  );
};

export const PhotoGallery: React.FC = () => {
  const { photos } = useStore();
  return (
    <>
      {photos.map(p => (
        <PhotoFrame key={p.id} {...p} />
      ))}
    </>
  );
};
