import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Torus, Box, Cylinder, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

export const SecurityLock = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef}>
        {/* Lock body */}
        <Box args={[1.5, 1.2, 0.6]} position={[0, -0.3, 0]}>
          <MeshDistortMaterial
            color="#0ea5e9"
            emissive="#0ea5e9"
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
            distort={0.1}
            speed={2}
          />
        </Box>
        
        {/* Lock shackle */}
        <Torus args={[0.5, 0.12, 16, 32, Math.PI]} position={[0, 0.6, 0]} rotation={[0, 0, 0]}>
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </Torus>
        
        {/* Shackle vertical bars */}
        <Cylinder args={[0.12, 0.12, 0.6, 16]} position={[-0.5, 0.3, 0]}>
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </Cylinder>
        <Cylinder args={[0.12, 0.12, 0.6, 16]} position={[0.5, 0.3, 0]}>
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </Cylinder>
        
        {/* Keyhole */}
        <Cylinder args={[0.1, 0.1, 0.7, 16]} position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#020617" metalness={0.5} roughness={0.5} />
        </Cylinder>
        <Box args={[0.08, 0.25, 0.7]} position={[0, -0.4, 0]}>
          <meshStandardMaterial color="#020617" metalness={0.5} roughness={0.5} />
        </Box>
      </group>
    </Float>
  );
};
