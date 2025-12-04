
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const nebulaVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragment = `
  uniform float uTime;
  varying vec2 vUv;

  // Simplex Noise (simplified)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    // Moving noise coordinates
    vec2 uv = vUv * 2.0 + vec2(uTime * 0.02, uTime * 0.01);
    float n = snoise(uv);
    float n2 = snoise(uv * 2.0 - vec2(uTime * 0.05));
    
    // Blue Cosmic Palette
    vec3 colorA = vec3(0.01, 0.02, 0.1); // Deep Navy/Black
    vec3 colorB = vec3(0.0, 0.15, 0.4); // Royal Blue
    vec3 colorC = vec3(0.0, 0.4, 0.8); // Bright Cyan
    
    float mixFactor = n * 0.5 + 0.5;
    vec3 finalColor = mix(colorA, colorB, mixFactor);
    finalColor += colorC * (n2 * 0.4); // Highlights
    
    // Vignette / Depth fade
    float dist = distance(vUv, vec2(0.5));
    finalColor *= (1.2 - dist);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const Stardust = () => {
  const count = 2000;
  const mesh = useRef<THREE.Points>(null);
  
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
        // Sphere distribution
        const r = 15 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i*3+2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (mesh.current) {
        mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15} 
        color="#88CCFF" // Light Cyan stardust
        transparent 
        opacity={0.7} 
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
};

export const CosmicBackground: React.FC = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((state) => {
        if(materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <group>
            {/* Infinite Nebula Sphere */}
            <mesh scale={[100, 100, 100]}>
                <sphereGeometry args={[1, 64, 64]} />
                <shaderMaterial 
                    ref={materialRef}
                    side={THREE.BackSide}
                    vertexShader={nebulaVertex}
                    fragmentShader={nebulaFragment}
                    uniforms={{ uTime: { value: 0 }}}
                />
            </mesh>
            {/* Floating Stardust */}
            <Stardust />
        </group>
    );
};
