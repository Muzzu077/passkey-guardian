import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { SecurityLock } from "./SecurityLock";
import { ParticleField } from "./ParticleField";

interface Scene3DProps {
  showLock?: boolean;
  interactive?: boolean;
  className?: string;
}

export const Scene3D = ({ showLock = true, interactive = false, className = "" }: Scene3DProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
          
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#0ea5e9" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
          <spotLight
            position={[0, 10, 0]}
            angle={0.3}
            penumbra={1}
            intensity={0.8}
            color="#0ea5e9"
          />
          
          {/* 3D Objects */}
          {showLock && <SecurityLock />}
          <ParticleField count={300} spread={12} />
          
          {/* Environment */}
          <Environment preset="night" />
          
          {/* Controls */}
          {interactive && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 3}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};
