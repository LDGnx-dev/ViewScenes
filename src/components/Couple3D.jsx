import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Componente para el corazón 3D procedural estilizado con animación flotante
function StylizedHeart({ color, position, intensity, bobSeed }) {
  const heartRef = useRef();

  // Animación exclusiva para los corazones: levitación y rotación sutil
  useFrame((state) => {
    if (!heartRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Movimiento vertical suave independiente usando el bobSeed
    heartRef.current.position.y = position[1] + Math.sin(t * 1.5 + bobSeed) * 0.025;
    // Giro milimétrico magnético
    heartRef.current.rotation.y = Math.sin(t * 0.8 + bobSeed) * 0.08;
  });

  return (
    <group ref={heartRef} position={position} scale={[0.11, 0.11, 0.11]}>
      {/* Lóbulo izquierdo */}
      <mesh position={[-0.16, 0.16, 0]} rotation={[0, 0, 0.7]}>
        <cylinderGeometry args={[0.18, 0.18, 0.4, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity * 10.0} />
      </mesh>
      
      {/* Lóbulo derecho */}
      <mesh position={[0.16, 0.16, 0]} rotation={[0, 0, -0.7]}>
        <cylinderGeometry args={[0.18, 0.18, 0.4, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity * 10.0} />
      </mesh>

      {/* Punta inferior */}
      <mesh position={[0, -0.12, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.26, 0.48, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity * 10.0} />
      </mesh>

      {/* Rastro luminoso de neón suave en el entorno */}
      <pointLight 
        intensity={intensity * 1.8} 
        distance={2.5} 
        decay={1.8} 
        color={color} 
      />
    </group>
  );
}

export default function Couple3D({ globalTransition }) {
  const group = useRef();

  // Color adaptativo integrado a la penumbra nocturna
  const adaptiveColor = useMemo(() => {
    const sunsetTone = new THREE.Color('#1f0f0c');
    const nightTone  = new THREE.Color('#121622'); // Azul noche nítido
    return sunsetTone.clone().lerp(nightTone, globalTransition);
  }, [globalTransition]);

  // Encendido progresivo de los neones al anochecer
  const glowIntensity = useMemo(() => {
    if (globalTransition < 0.5) return 0.0;
    return (globalTransition - 0.5) * 2.0;
  }, [globalTransition]);

  return (
    // Posición y altura fija que ya habías calibrado perfectamente
    <group ref={group} position={[0, 0, 0]} scale={[1, 1, 1]} renderOrder={2}>
      
      {/* ================= CHICO: PIXEL (IZQUIERDA - ESTABLE Y FIJO) ================= */}
      <group position={[0.15, 0, 0]} rotation={[0, Math.PI - 0.05, 0]}>
        {/* Cabeza */}
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.068, 16, 16]} />
          <meshBasicMaterial color={adaptiveColor} />
        </mesh>
        
        {/* Cuello */}
        <mesh position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.02, 0.035, 0.06, 8]} />
          <meshBasicMaterial color={adaptiveColor} />
        </mesh>

        {/* Torso restaurado al 100% y estático */}
        <mesh position={[0, 0.25, -0.01]} rotation={[-0.14, 0, -0.02]}>
          <cylinderGeometry args={[0.065, 0.08, 0.34, 12]} />
          <meshBasicMaterial color={adaptiveColor} />
        </mesh>

        {/* TU CORAZÓN: MORADO (#BF00FF) CON ANIMACIÓN */}
        <StylizedHeart 
          color="#bf00ff" 
          position={[0, 0.76, -0.02]} 
          intensity={glowIntensity}
          bobSeed={2.5}
        />

        {/* Brazos */}
        <mesh position={[-0.08, 0.18, 0.06]} rotation={[0.5, 0, -0.08]}>
          <cylinderGeometry args={[0.016, 0.016, 0.24, 8]} />
          <meshBasicMaterial color={adaptiveColor} />
        </mesh>

        {/* Piernas */}
        <mesh position={[-0.04, 0.06, 0.14]} rotation={[1.1, 0, -0.02]}>
          <cylinderGeometry args={[0.028, 0.034, 0.28, 8]} />
          <meshBasicMaterial color={adaptiveColor} />
        </mesh>
        <mesh position={[0.04, 0.06, 0.12]} rotation={[1.08, 0, 0.02]}>
          <cylinderGeometry args={[0.028, 0.034, 0.28, 8]} />
          <meshBasicMaterial color={adaptiveColor} />
        </mesh>
      </group>

      {/* ================= CHICA: TSUKI (DERECHA - ESTABLE Y FIJA) ================= */}
      <group position={[0.31, -0.01, 0.02]} rotation={[0, Math.PI + 0.05, 0.08]}>
        {/* Cabeza */}
        <mesh position={[0, 0.51, 0]}>
          <sphereGeometry args={[0.062, 16, 16]} />
          <meshBasicMaterial color={adaptiveColor} />
        </mesh>

        {/* Cabello largo */}
        <mesh position={[0.0, 0.33, 0.05]} scale={[1.1, 1.3, 0.8]}>
          <sphereGeometry args={[0.066, 12, 12]} />
          <meshBasicMaterial color={adaptiveColor} />
        </mesh>

        {/* Torso restaurado al 100% y estático */}
        <mesh position={[0, 0.23, -0.01]} rotation={[-0.12, 0, 0.02]}>
          <cylinderGeometry args={[0.048, 0.095, 0.32, 12]} />
          <meshBasicMaterial color={adaptiveColor} />
        </mesh>

        {/* SU CORAZÓN: VERDE (#39FF14) CON ANIMACIÓN */}
        <StylizedHeart 
          color="#39ff14" 
          position={[0.01, 0.72, -0.03]} 
          intensity={glowIntensity}
          bobSeed={3.5} // Ritmo flotante desfasado
        />

        {/* Brazos */}
        <mesh position={[0.05, 0.16, 0.06]} rotation={[0.6, 0.1, 0.05]}>
          <cylinderGeometry args={[0.015, 0.015, 0.22, 8]} />
          <meshBasicMaterial color={adaptiveColor} />
        </mesh>

        {/* Piernas */}
        <mesh position={[-0.02, 0.05, 0.12]} rotation={[1.05, -0.1, -0.05]}>
          <cylinderGeometry args={[0.026, 0.032, 0.26, 8]} />
          <meshBasicMaterial color={adaptiveColor} />
        </mesh>
      </group>

    </group>
  );
}