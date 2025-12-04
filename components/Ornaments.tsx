import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppMode, GestureType } from '../types';
import { ORNAMENT_PALETTE, TREE_CONFIG } from '../constants';

const tempObj = new THREE.Object3D();
const tempVec = new THREE.Vector3();

export const Ornaments: React.FC = () => {
  const { mode, gesture } = useStore();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const progress = useRef(1);
  const [hoveredId, setHover] = useState<number | null>(null);

  const { targetData, chaosData, colors } = useMemo(() => {
    const count = TREE_CONFIG.ornamentCount;
    const tData = [];
    const cData = [];
    const cols = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Tree Form Positions
      const t = i / count;
      const angle = t * Math.PI * 25; 
      const h = (1 - t) * TREE_CONFIG.height - (TREE_CONFIG.height / 2);
      const r = t * TREE_CONFIG.radius + 0.5; // Slightly outside needles
      
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = h;

      tData.push({ pos: new THREE.Vector3(x, y, z), rot: new THREE.Euler(Math.random(), Math.random(), Math.random()) });

      // Chaos Positions
      cData.push({ 
        pos: new THREE.Vector3((Math.random()-0.5)*25, (Math.random()-0.5)*25, (Math.random()-0.5)*25),
        rot: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0)
      });

      // Color
      color.set(ORNAMENT_PALETTE[Math.floor(Math.random() * ORNAMENT_PALETTE.length)]);
      cols[i*3] = color.r;
      cols[i*3+1] = color.g;
      cols[i*3+2] = color.b;
    }
    return { targetData: tData, chaosData: cData, colors: cols };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetProgress = mode === AppMode.FORMED ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, targetProgress, delta * 2);

    for (let i = 0; i < TREE_CONFIG.ornamentCount; i++) {
      const t = targetData[i];
      const c = chaosData[i];

      // Lerp position
      tempVec.lerpVectors(c.pos, t.pos, progress.current);
      tempObj.position.copy(tempVec);

      // Lerp Rotation (simple approx)
      tempObj.rotation.x = THREE.MathUtils.lerp(c.rot.x, t.rot.x, progress.current);
      tempObj.rotation.y = THREE.MathUtils.lerp(c.rot.y, t.rot.y, progress.current);

      // Animation: Float if hover or chaos
      if (progress.current < 0.5 || hoveredId === i) {
        tempObj.position.y += Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
      }

      // Rotate whole tree effect
      if (progress.current > 0.8) {
        const globalRot = state.clock.elapsedTime * 0.1;
        // Apply rotation around Y axis manually to position
        const cos = Math.cos(globalRot);
        const sin = Math.sin(globalRot);
        const px = tempObj.position.x;
        const pz = tempObj.position.z;
        tempObj.position.x = px * cos - pz * sin;
        tempObj.position.z = px * sin + pz * cos;
        tempObj.rotation.y += globalRot;
      }
      
      // Scaling reaction to gesture
      let scale = 1;
      if (gesture === GestureType.OPEN_PALM && progress.current < 0.1) {
          scale = 1.5; // Pulse in chaos
      }
      tempObj.scale.setScalar(scale);

      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, TREE_CONFIG.ornamentCount]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(e.instanceId!);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(null);
        document.body.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial 
        roughness={0.1} 
        metalness={0.9} 
        envMapIntensity={1.5}
      />
      <instancedBufferAttribute 
        attach="instanceColor" 
        args={[colors, 3]} 
      />
    </instancedMesh>
  );
};
