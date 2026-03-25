import React, { useState, useEffect } from 'react';
import { useSimulation } from './store/simulation';
import Scene3D from './components/Scene3D';
import DashboardUI from './components/DashboardUI';

export default function App() {
  const { state, setScenario } = useSimulation();
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [isLightMode]);

  return (
    <div className="relative w-screen h-screen bg-sg-dark overflow-hidden font-sans">
      {/* 3D Background Scene */}
      <Scene3D state={state} isLightMode={isLightMode} />
      
      {/* 2D Overlay UI */}
      <DashboardUI state={state} setScenario={setScenario} isLightMode={isLightMode} setIsLightMode={setIsLightMode} />
    </div>
  );
}
