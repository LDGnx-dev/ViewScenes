export default function Silhouettes({ phase }) {
  if (phase !== 'NIGHT') return null;

  return (
    <mesh position={[0, -2, 0.1]}>
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial color="black" transparent opacity={0.9} />
    </mesh>
  );
}