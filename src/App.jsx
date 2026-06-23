import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';

export default function App() {
  const [phase, setPhase] = useState('GROWING');

  useEffect(() => {
    // ... tu lógica de timers
  }, []);

  // Nota: App.jsx NO debe llamar a <Tree /> directamente.
  // Scene.jsx es el único que debe contenerlo dentro de <Canvas>.
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Scene phase={phase} />
    </div>
  );
}