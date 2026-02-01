import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarsProps {
  count?: number;
  speed?: number;
}

function Stars({ count = 2000, speed = 0.05 }: StarsProps) {
  const meshRef = useRef<THREE.Points>(null);
  
  const [positions, velocities] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;
      velocities[i] = Math.random() * 0.5 + 0.1;
    }
    
    return [positions, velocities];
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const positionArray = meshRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Move stars toward camera
      positionArray[i3 + 2] += velocities[i] * speed * (1 + Math.sin(time * 0.5) * 0.3);
      
      // Reset stars that pass camera
      if (positionArray[i3 + 2] > 50) {
        positionArray[i3 + 2] = -50;
        positionArray[i3] = (Math.random() - 0.5) * 100;
        positionArray[i3 + 1] = (Math.random() - 0.5) * 100;
      }
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.rotation.z = time * 0.02;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#00ff88"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function NebulaClouds() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.01;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -30]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial
        color="#a855f7"
        transparent
        opacity={0.03}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export const Starfield = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000000']} />
        <Stars count={1500} speed={0.08} />
        <NebulaClouds />
      </Canvas>
    </div>
  );
};
