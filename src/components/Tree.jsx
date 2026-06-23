import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Lluvia de pétalos acotada localmente por rama (CORREGIDO)
function BranchPetals({ count = 8 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        x: THREE.MathUtils.randFloat(-1.0, 1.0),
        y: THREE.MathUtils.randFloat(0.0, 1.5),
        z: THREE.MathUtils.randFloat(-1.0, 1.0),
        fallSpeed: THREE.MathUtils.randFloat(0.5, 1.1),
        swingSpeed: THREE.MathUtils.randFloat(1.8, 3.2),
        swingRange: THREE.MathUtils.randFloat(0.1, 0.22),
        seed: Math.random() * 100,
        scale: [THREE.MathUtils.randFloat(0.06, 0.09), THREE.MathUtils.randFloat(0.12, 0.18), 0.01],
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotSpeedX: THREE.MathUtils.randFloat(1.2, 2.5),
        rotSpeedY: THREE.MathUtils.randFloat(1.5, 3.0)
      });
    }
    return list;
  }, [count]);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    data.forEach((p, i) => {
      p.y -= p.fallSpeed * delta;
      p.rotX += p.rotSpeedX * delta;
      p.rotY += p.rotSpeedY * delta;

      const currentX = p.x + Math.sin(p.y * p.swingSpeed + p.seed) * p.swingRange;
      const currentRotZ = Math.cos(p.y * p.swingSpeed + p.seed) * 0.25;

      if (p.y < -3.0) {
        p.y = THREE.MathUtils.randFloat(0.5, 1.8);
        p.x = THREE.MathUtils.randFloat(-1.0, 1.0);
      }

      dummy.position.set(currentX, p.y, p.z);
      dummy.rotation.set(Math.sin(p.rotX) * 0.4, p.rotY, currentRotZ);
      dummy.scale.set(p.scale[0], p.scale[1], p.scale[2]);
      dummy.updateMatrix();

      mesh.current.setMatrixAt(i, dummy.matrix);
    });

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]} renderOrder={2}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshStandardMaterial color="#ff9ebb" roughness={0.6} metalness={0.0} />
    </instancedMesh>
  );
}

function Branch({ depth, maxDepth, length, thickness, globalTransition }) {
  if (depth === 0) return null;

  // Sincronización tonal suave basada en el lerp amortiguado del padre
  const colors = useMemo(() => {
    const trunkSunset = new THREE.Color('#2d1a18');
    const trunkNight   = new THREE.Color('#0b0808');
    const currentTrunk = trunkSunset.clone().lerp(trunkNight, globalTransition);

    const leafSunset  = new THREE.Color('#ff9ebb');
    const leafNight   = new THREE.Color('#5c2835');
    const currentLeaf  = leafSunset.clone().lerp(leafNight, globalTransition);

    return { trunk: currentTrunk, leaf: currentLeaf };
  }, [globalTransition]);

  const branchData = useMemo(() => {
    const rotX = (Math.random() - 0.5) * 0.4;
    const rotY = Math.random() * Math.PI * 2;
    const rotZ = 0.4 + Math.random() * 0.3;   

    const isMainTrunk = depth >= maxDepth - 1;
    const hasRain = depth === maxDepth - 1 || depth === maxDepth - 2;
    const cloudCount = isMainTrunk ? 0 : depth <= 3 ? 4 : 2;

    const cloudList = [];
    for (let i = 0; i < cloudCount; i++) {
      cloudList.push({
        yPos: (Math.random() * 0.5 + 0.5) * length,
        scale: [0.8 + Math.random() * 0.7, 0.6 + Math.random() * 0.5, 0.8 + Math.random() * 0.7],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
      });
    }

    return { rotX, rotY, rotZ, cloudList, hasRain };
  }, [depth, maxDepth, length, thickness]);

  return (
    <group>
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[thickness * 0.5, thickness, length, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.85} />
      </mesh>

      {branchData.cloudList.map((c, i) => (
        <mesh key={i} position={[0, c.yPos, 0]} rotation={c.rotation} scale={c.scale}>
          <dodecahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial color={colors.leaf} roughness={0.75} transparent opacity={0.96} />
        </mesh>
      ))}

      {branchData.hasRain && <BranchPetals count={8} />}

      <group position={[0, length, 0]} rotation={[branchData.rotX, branchData.rotY, 0]}>
        <group rotation={[0, 0, branchData.rotZ]}>
          <Branch depth={depth - 1} maxDepth={maxDepth} length={length * 0.75} thickness={thickness * 0.55} globalTransition={globalTransition} />
        </group>
        <group rotation={[0, 0, -branchData.rotZ]}>
          <Branch depth={depth - 1} maxDepth={maxDepth} length={length * 0.75} thickness={thickness * 0.55} globalTransition={globalTransition} />
        </group>
      </group>
    </group>
  );
}

export default function Tree({ globalTransition = 0.0 }) {
  const group = useRef();
  const maxDepth = 6; 

  return (
    <group ref={group} scale={[1, 1, 1]} position={[0, -1.9, 0]}>
      <group rotation={[0.0, 0.2, 0]}>
        <Branch depth={maxDepth} maxDepth={maxDepth} length={1.1} thickness={0.18} globalTransition={globalTransition} />
      </group>
    </group>
  );
}