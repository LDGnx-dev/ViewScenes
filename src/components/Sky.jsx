import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import skyFragment from '../shaders/sky.frag';

export default function Sky({ phase }) {
  const materialRef = useRef();

  // Generamos la semilla aleatoria para las nubes una sola vez al montar el componente
  const cloudSeed = useMemo(() => {
    return new THREE.Vector2(Math.random() * 120.0, Math.random() * 120.0);
  }, []);

  const uniforms = useMemo(() => ({
    uTransition: { value: 0.0 },
    uTime: { value: 0.0 },
    uCloudOffset: { value: cloudSeed }
  }), [cloudSeed]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

    let target = 0.0;
    if (phase === 'SUNSET') target = 0.4;
    if (phase === 'NIGHT') target = 1.0;
    
    materialRef.current.uniforms.uTransition.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uTransition.value,
      target,
      delta * 0.6
    );
  });

  return (
    <mesh position={[0, 0, -10]} renderOrder={0}>
      <planeGeometry args={[30, 20]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={skyFragment}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}