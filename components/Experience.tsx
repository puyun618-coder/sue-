
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { ChristmasTree } from './ChristmasTree';
import { Ornaments } from './Ornaments';
import { PhotoGallery } from './PhotoGallery';
import { TopStar } from './TopStar';
import { CosmicBackground } from './CosmicBackground';
import { CAMERA_POS, COLORS } from '../constants';

export const Experience: React.FC = () => {
  return (
    <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: false, alpha: false }}
    >
      <color attach="background" args={[COLORS.darkBg]} />
      
      <PerspectiveCamera makeDefault position={[...CAMERA_POS]} fov={50} />
      <OrbitControls 
        enablePan={false} 
        minDistance={8} 
        maxDistance={25} 
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={false}
      />

      {/* Cosmic Environment */}
      <CosmicBackground />

      {/* Lighting - Dramatic Space Lighting */}
      <ambientLight intensity={0.1} color="#b0c4de" /> {/* Cold ambient */}
      <pointLight position={[10, 10, 10]} intensity={1.5} color={COLORS.warmLight} />
      <pointLight position={[-15, 0, -5]} intensity={1} color="#4b0082" /> {/* Purple rim light */}
      <spotLight 
        position={[0, 20, 5]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color="#FFF"
      />

      {/* Reflections */}
      <Environment preset="city" background={false} blur={0.8} />

      <Suspense fallback={null}>
        {/* Centered Tree Group */}
        <group position={[0, 0, 0]}>
          <ChristmasTree />
          <Ornaments />
          <PhotoGallery />
          <TopStar />
        </group>
      </Suspense>

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.7} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.5}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    </Canvas>
  );
};
