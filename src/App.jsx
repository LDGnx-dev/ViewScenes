import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';

export default function App() {
  const [phase, setPhase] = useState('GROWING');

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Scene phase={phase} />
    </div>
  );
}