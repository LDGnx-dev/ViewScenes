import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import Tree from './Tree';
import Sky from './Sky';
import Couple3D from './Couple3D';

// Componente WindyGrass con Geometría de Ramillete Avanzada y RenderOrder Forzado
function WindyGrass({ count = 5000, grassColor }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const clusterGeometry = useMemo(() => {
    const baseGeom = new THREE.ConeGeometry(0.4, 1.0, 3);
    baseGeom.translate(0, 0.5, 0);

    const mergeGeometry = new THREE.Group();
    
    const m1 = new THREE.Mesh(baseGeom);
    m1.scale.set(0.2, 1.0, 0.2);
    mergeGeometry.add(m1);

    const m2 = new THREE.Mesh(baseGeom);
    m2.position.set(-0.06, 0, 0.02);
    m2.rotation.z = 0.2;
    m2.scale.set(0.16, 0.85, 0.16);
    mergeGeometry.add(m2);

    const m3 = new THREE.Mesh(baseGeom);
    m3.position.set(0.06, 0, -0.02);
    m3.rotation.z = -0.15;
    m3.rotation.x = 0.1;
    m3.scale.set(0.18, 0.9, 0.18);
    mergeGeometry.add(m3);

    mergeGeometry.updateMatrixWorld();
    const geometries = [];
    mergeGeometry.traverse((child) => {
      if (child.isMesh) {
        const clonedGeom = child.geometry.clone();
        clonedGeom.applyMatrix4(child.matrixWorld);
        geometries.push(clonedGeom);
      }
    });
    
    return geometries[0];
  }, []);

  const positions = useMemo(() => {
    const list = [];
    let i = 0;
    while (i < count) {
      const x = THREE.MathUtils.randFloat(-0.95, 0.95);
      const z = THREE.MathUtils.randFloat(-0.25, 0.50);
      const r2 = (x * x) + (z * z); 
      
      if (r2 < 0.92) {
        const y = Math.sqrt(1.0 - r2);
        list.push({
          x, y, z,
          rotY: Math.random() * Math.PI,
          scaleY: THREE.MathUtils.randFloat(0.06, 0.12),
          speed: THREE.MathUtils.randFloat(1.8, 2.6),
          phase: Math.random() * 6.0
        });
        i++;
      }
    }
    return list;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    positions.forEach((g, i) => {
      dummy.position.set(g.x, g.y, g.z);
      
      const windFactor = Math.sin(t * g.speed + g.phase) * 0.05;
      dummy.rotation.set(windFactor + 0.03, g.rotY, windFactor * 0.4);
      
      dummy.scale.set(0.03, g.scaleY, 0.03); 
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    // CORRECCIÓN: RenderOrder alto para obligar al césped a pintarse encima de la pareja
    <instancedMesh ref={meshRef} args={[clusterGeometry, null, count]} renderOrder={4}>
      <meshStandardMaterial color={grassColor} roughness={0.9} depthWrite={true} depthTest={true} />
    </instancedMesh>
  );
}

// Componente FallenPetals
function FallenPetals({ count = 300, petalColor }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const petalPlacements = useMemo(() => {
    const list = [];
    let i = 0;
    while (i < count) {
      const x = THREE.MathUtils.randFloat(-0.75, 0.75);
      const z = THREE.MathUtils.randFloat(-0.25, 0.55);
      const r2 = (x * x) + (z * z);
      if (r2 < 0.92) {
        const y = Math.sqrt(1.0 - r2) + 0.002;
        list.push({
          x, y, z,
          scaleX: THREE.MathUtils.randFloat(0.008, 0.016),
          scaleY: THREE.MathUtils.randFloat(0.004, 0.008),
          rotY: Math.random() * Math.PI
        });
        i++;
      }
    }
    return list;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    petalPlacements.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(-Math.PI * 0.5, p.rotY, 0);
      dummy.scale.set(p.scaleX, p.scaleY, 1.0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} renderOrder={3}>
      <circleGeometry args={[1, 8]} />
      <meshStandardMaterial color={petalColor} roughness={0.7} transparent opacity={0.55} depthWrite={false} />
    </instancedMesh>
  );
}

function Hill({ globalTransition }) {
  const colors = useMemo(() => {
    const grassDay     = new THREE.Color('#3a5f25');
    const grassSunset  = new THREE.Color('#1a2612');
    const grassNight   = new THREE.Color('#040807');
    const petalDay     = new THREE.Color('#ffb7cc');
    const petalNight   = new THREE.Color('#4a1d26');

    let currentGrass, currentPetal;
    if (globalTransition <= 0.4) {
        const t = globalTransition / 0.4;
        currentGrass = grassDay.clone().lerp(grassSunset, t);
        currentPetal = petalDay.clone().lerp(petalDay, t);
    } else {
        const t = (globalTransition - 0.4) / 0.6;
        currentGrass = grassSunset.clone().lerp(grassNight, t);
        currentPetal = petalDay.clone().lerp(petalNight, t);
    }
    return { grass: currentGrass, petal: currentPetal };
  }, [globalTransition]);

  return (
    <group position={[0, -3.1, 0]} scale={[5.5, 1.4, 2.5]}>
      {/* Cuerpo principal de la colina */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[1, 40, 40]} />
        <meshStandardMaterial color={colors.grass} roughness={0.9} metalness={0.0} />
      </mesh>

      <WindyGrass count={4500} grassColor={colors.grass} />
      <FallenPetals count={400} petalColor={colors.petal} />

      {/* CORRECCIÓN INTERNA CRÍTICA: La pareja ahora vive dentro del espacio de la colina, 
          lo que hereda el escalado automático. Ponemos un eje local Z adelantado (0.22) 
          para que los ramilletes frontales queden físicamente en su primer plano.
      */}
      <group position={[0.07, 0.94, 0.22]} scale={[0.18, 0.71, 0.4]}>
        <Couple3D globalTransition={globalTransition} isLocal={true} />
      </group>
    </group>
  );
}

export default function Scene() {
  const [phase, setPhase] = useState('GROWING');
  const [globalTransition, setGlobalTransition] = useState(0.0);

  useEffect(() => {
    let target = 0.0;
    if (phase === 'SUNSET') target = 0.4;
    if (phase === 'NIGHT') target = 1.0;

    let animeFrame;
    const updateLerp = () => {
      setGlobalTransition((prev) => {
        const next = prev + (target - prev) * 0.015;
        if (Math.abs(next - target) < 0.001) return target;
        animeFrame = requestAnimationFrame(updateLerp);
        return next;
      });
    };
    animeFrame = requestAnimationFrame(updateLerp);
    return () => cancelAnimationFrame(animeFrame);
  }, [phase]);

  const lights = useMemo(() => {
    return {
      ambient: THREE.MathUtils.lerp(0.6, 0.08, globalTransition),
      directional: THREE.MathUtils.lerp(2.2, 0.15, globalTransition)
    };
  }, [globalTransition]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100,
        display: 'flex', gap: '12px', background: 'rgba(21, 13, 12, 0.85)', padding: '10px 18px',
        borderRadius: '25px', border: '1px solid #ff9ebb', backdropFilter: 'blur(5px)'
      }}>
        <button onClick={() => setPhase('GROWING')} style={{ background: phase === 'GROWING' ? '#ff9ebb' : 'transparent', color: phase === 'GROWING' ? '#150d0c' : '#ff9ebb', border: '1px solid #ff9ebb', padding: '6px 14px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Dia</button>
        <button onClick={() => setPhase('SUNSET')} style={{ background: phase === 'SUNSET' ? '#ff7b4f' : 'transparent', color: phase === 'SUNSET' ? '#150d0c' : '#ff7b4f', border: '1px solid #ff7b4f', padding: '6px 14px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Tarde</button>
        <button onClick={() => setPhase('NIGHT')} style={{ background: phase === 'NIGHT' ? '#7f8fa6' : 'transparent', color: phase === 'NIGHT' ? '#150d0c' : '#7f8fa6', border: '1px solid #7f8fa6', padding: '6px 14px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Noche</button>
      </div>

      <Canvas camera={{ position: [0, 0, 4.8], fov: 52 }}>
        <Sky phase={phase} />
        <ambientLight intensity={lights.ambient} />
        <directionalLight position={[-3, 2, -2]} intensity={lights.directional} color="#ff8b60" />
        
        <Tree globalTransition={globalTransition} />
        <Hill globalTransition={globalTransition} />
      </Canvas>
    </div>
  );
}