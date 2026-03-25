import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  OrthographicCamera, 
  RoundedBox, 
  Html,
  Line,
  Sphere,
  Cylinder,
  Box,
  Grid
} from '@react-three/drei';
import * as THREE from 'three';
// import { AppState } from '../types'; // Removed missing types


const SolarPanel = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Cylinder args={[0.05, 0.05, 0.4]} position={[0, 0.2, 0]}>
      <meshStandardMaterial color="#666" />
    </Cylinder>
    <Box args={[1.2, 0.05, 0.8]} position={[0, 0.4, 0]} rotation={[Math.PI / 6, 0, 0]}>
      <meshStandardMaterial color="#2563EB" metalness={0.8} roughness={0.2} />
    </Box>
  </group>
);

const Tree = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Cylinder args={[0.05, 0.1, 0.4]} position={[0, 0.2, 0]}>
      <meshStandardMaterial color="#8B4513" />
    </Cylinder>
    <Sphere args={[0.3, 8, 8]} position={[0, 0.5, 0]}>
      <meshStandardMaterial color="#22C55E" />
    </Sphere>
  </group>
);

const Rain = () => {
  const count = 1500;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 60,
      y: Math.random() * 40,
      z: (Math.random() - 0.5) * 60,
      speed: 15 + Math.random() * 10,
    }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.y -= p.speed * delta;
      if (p.y < -2) {
        p.y = 40;
        p.x = (Math.random() - 0.5) * 60;
        p.z = (Math.random() - 0.5) * 60;
      }
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.z = 0.1; // slight wind angle
      dummy.scale.set(0.05, 0.8, 0.05); // elongated raindrops
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#aaccff" transparent opacity={0.4} />
    </instancedMesh>
  );
};

const Dust = () => {
  const count = 1500;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 60,
      y: Math.random() * 15,
      z: (Math.random() - 0.5) * 60,
      speedX: 10 + Math.random() * 10,
      speedZ: 5 + Math.random() * 5,
      rotSpeed: Math.random() * 5,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotZ: Math.random() * Math.PI,
    }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.x += p.speedX * delta;
      p.z += p.speedZ * delta;
      p.rotX += p.rotSpeed * delta;
      p.rotY += p.rotSpeed * delta;
      
      if (p.x > 30) p.x = -30;
      if (p.z > 30) p.z = -30;

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.set(0.15, 0.15, 0.15); // small dust/sand particles
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#d4b483" transparent opacity={0.6} />
    </instancedMesh>
  );
};

const WeatherSystem = ({ scenario }: { scenario: string }) => {
  return (
    <>
      {scenario === 'rain' && <Rain />}
      {scenario === 'wind' && <Dust />}
    </>
  );
};

const SolarSection = ({ position, scenario, soiling, time }: { position: [number, number, number], scenario: string, soiling: number, time: number }) => {
  const isNight = scenario === 'night' || (scenario === 'ai_cycle' && (time >= 19 || time < 6));
  const isRain = scenario === 'rain';
  const isWind = scenario === 'wind';
  
  return (
    <group position={position}>
      <RoundedBox args={[12, 0.4, 10]} radius={0.2} smoothness={4} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#A7F3D0" />
      </RoundedBox>
      
      {Array.from({ length: 4 }).map((_, row) => 
        Array.from({ length: 6 }).map((_, col) => (
          <group key={`${row}-${col}`} position={[-3.5 + col * 1.4, 0, -2.5 + row * 1.2]}>
            <Cylinder args={[0.05, 0.05, 0.4]} position={[0, 0.2, 0]}>
              <meshStandardMaterial color="#666" />
            </Cylinder>
            <Box args={[1.2, 0.05, 0.8]} position={[0, 0.4, 0]} rotation={[Math.PI / 6, 0, 0]}>
              <meshStandardMaterial 
                color={isWind ? new THREE.Color("#2563EB").lerp(new THREE.Color("#8B6914"), soiling * 4) : "#2563EB"} 
                metalness={0.8} 
                roughness={0.2} 
                emissive={isNight ? "#000000" : "#2563EB"}
                emissiveIntensity={isNight ? 0 : (isRain ? 0.2 : 0.8 * (1 - soiling))}
              />
            </Box>
          </group>
        ))
      )}

      <Tree position={[-5, 0, 3]} />
      <Tree position={[-3, 0, 4]} />
      <Tree position={[4, 0, 3]} />
      <Tree position={[5, 0, 1]} />
      <Tree position={[5, 0, -3]} />

      {!isNight && (
        <>
          <Sphere args={[1.5, 32, 32]} position={[0, 4, -4]}>
            <meshBasicMaterial color="#FEF08A" transparent opacity={isRain ? 0.2 : 1} />
          </Sphere>
          <Sphere args={[2, 32, 32]} position={[0, 4, -4]}>
            <meshBasicMaterial color="#FEF08A" transparent opacity={isRain ? 0.1 : 0.3} />
          </Sphere>
        </>
      )}
    </group>
  );
};

const TransmissionTower = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Cylinder args={[0.1, 0.4, 4, 4]} position={[0, 2, 0]}>
      <meshStandardMaterial color="#4B5563" wireframe />
    </Cylinder>
    <Box args={[3, 0.1, 0.1]} position={[0, 3, 0]}>
      <meshStandardMaterial color="#4B5563" />
    </Box>
    <Box args={[2, 0.1, 0.1]} position={[0, 2, 0]}>
      <meshStandardMaterial color="#4B5563" />
    </Box>
  </group>
);

const GridSection = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <RoundedBox args={[10, 0.4, 8]} radius={0.2} smoothness={4} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#BAE6FD" />
      </RoundedBox>
      
      <TransmissionTower position={[-2, 0, -1]} />
      <TransmissionTower position={[2, 0, 1]} />
      
      <Line points={[[-3.5, 3, -1], [0.5, 3, 1], [4.5, 3, 3]]} color="#1E3A8A" lineWidth={2} />
      <Line points={[[-3.5, 2, -1], [0.5, 2, 1], [4.5, 2, 3]]} color="#1E3A8A" lineWidth={2} />
    </group>
  );
};

const BatteryStack = ({ position, temps, isFault }: { position: [number, number, number], temps: number[], isFault: boolean }) => {
  const getColor = (temp: number) => {
    if (temp < 32) return "#185FA5"; // Blue
    if (temp < 42) return "#1D9E75"; // Green
    if (temp < 50) return "#EF9F27"; // Yellow
    return "#E24B4A"; // Red
  };

  return (
    <group position={position}>
      <RoundedBox args={[2.5, 1, 2.5]} radius={0.5} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={getColor(temps[0] || 30)} />
      </RoundedBox>
      <RoundedBox args={[2.5, 1, 2.5]} radius={0.5} position={[0, 1.6, 0]}>
        <meshStandardMaterial color={getColor(temps[1] || 35)} />
      </RoundedBox>
      <RoundedBox args={[2.5, 1, 2.5]} radius={0.5} position={[0, 2.7, 0]}>
        <meshStandardMaterial color={getColor(temps[2] || 40)} />
      </RoundedBox>
      
      <Box args={[2.6, 0.1, 2.6]} position={[0, 1.05, 0]}>
        <meshBasicMaterial color="#FEF08A" />
      </Box>
      <Box args={[2.6, 0.1, 2.6]} position={[0, 2.15, 0]}>
        <meshBasicMaterial color="#FEF08A" />
      </Box>

      {isFault && (
        <Sphere args={[0.5, 16, 16]} position={[0, 4, 0]}>
          <meshBasicMaterial color="#EF4444" />
        </Sphere>
      )}

      <Html position={[0, 3.5, 0]} center>
        <div className="text-yellow-300 text-3xl drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]">⚡</div>
      </Html>
    </group>
  );
};

const StorageSection = ({ position, batteryTemp, isFault, isBypassed }: { position: [number, number, number], batteryTemp: number, isFault: boolean, isBypassed: boolean }) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  useFrame((state) => {
    if (isBypassed && materialRef.current) {
      materialRef.current.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.5;
    } else if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0;
    }
  });

  return (
    <group position={position}>
      <RoundedBox args={[8, 0.4, 8]} radius={0.2} smoothness={4} position={[0, -0.2, 0]}>
        <meshStandardMaterial 
          ref={materialRef}
          color={isBypassed ? "#F97316" : "#5EEAD4"} 
          emissive={isBypassed ? "#F97316" : "#000000"} 
          emissiveIntensity={0} 
        />
      </RoundedBox>
      
      <BatteryStack position={[-1.5, 0, -1]} temps={[batteryTemp - 5, batteryTemp, batteryTemp + 5]} isFault={isFault} />
      <BatteryStack position={[1.5, 0, 1]} temps={[batteryTemp - 4, batteryTemp + 1, batteryTemp + 6]} isFault={isFault} />
    </group>
  );
};

const CitySection = ({ position, isSpike }: { position: [number, number, number], isSpike: boolean }) => {
  return (
    <group position={position}>
      <RoundedBox args={[12, 0.4, 12]} radius={0.2} smoothness={4} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#A7F3D0" />
      </RoundedBox>
      
      <Box args={[1.5, 6, 1.5]} position={[-1, 3, -2]}>
        <meshStandardMaterial color="#60A5FA" metalness={0.8} roughness={0.1} transparent opacity={0.8} />
      </Box>
      <Box args={[1.5, 4, 1.5]} position={[1.5, 2, -2]}>
        <meshStandardMaterial color="#F3F4F6" />
      </Box>
      <Box args={[2.5, 1.5, 1.5]} position={[2, 0.75, 1]}>
        <meshStandardMaterial color="#E5E7EB" />
      </Box>
      <Cylinder args={[0.2, 0.2, 2]} position={[1.5, 2, 1]}>
        <meshStandardMaterial color="#EF4444" />
      </Cylinder>
      <Cylinder args={[0.2, 0.2, 2]} position={[2.5, 2, 1]}>
        <meshStandardMaterial color="#EF4444" />
      </Cylinder>
      
      <Box args={[2, 2, 2]} position={[-2, 1, 2]}>
        <meshStandardMaterial color="#FCA5A5" />
      </Box>
      <Box args={[2.2, 0.2, 2.2]} position={[-2, 2.1, 2]}>
        <meshStandardMaterial color="#F87171" />
      </Box>

      <Box args={[10, 0.05, 1.5]} position={[0, 0.05, 4]}>
        <meshStandardMaterial color="#4B5563" />
      </Box>
      <Box args={[1.5, 0.05, 8]} position={[-4, 0.05, 0]}>
        <meshStandardMaterial color="#4B5563" />
      </Box>

      <Box args={[0.8, 0.4, 0.4]} position={[-1, 0.25, 4]}>
        <meshStandardMaterial color="#3B82F6" />
      </Box>
      <Box args={[0.8, 0.4, 0.4]} position={[2, 0.25, 4.2]}>
        <meshStandardMaterial color="#10B981" />
      </Box>
      <Box args={[0.4, 0.4, 0.8]} position={[-4, 0.25, 1]}>
        <meshStandardMaterial color="#F59E0B" />
      </Box>

      <Html position={[-1, 7, -2]} center>
        <div className="bg-white rounded-full p-2 shadow-lg text-blue-500">🌊</div>
      </Html>
      <Html position={[2, 4, 1]} center>
        <div className={`bg-white rounded-full p-2 shadow-lg text-yellow-500 transition-transform duration-300 ${isSpike ? 'scale-150' : 'scale-100'}`}>⚡</div>
      </Html>
      <Html position={[-2, 3.5, 2]} center>
        <div className="bg-white rounded-full p-2 shadow-lg text-teal-500">📶</div>
      </Html>
    </group>
  );
};

const FlowArrow = ({ position, rotation, length = 4.5, color = "#FEF08A" }: { position: [number, number, number], rotation: number, length?: number, color?: string }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.4);
    s.lineTo(length - 1.5, -0.4);
    s.lineTo(length - 1.5, -0.8);
    s.lineTo(length, 0);
    s.lineTo(length - 1.5, 0.8);
    s.lineTo(length - 1.5, 0.4);
    s.lineTo(0, 0.4);
    s.closePath();
    return s;
  }, [length]);
  
  return (
    <mesh position={position} rotation={[-Math.PI/2, 0, rotation]}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
};

interface Scene3DProps {
  state: any;
  isLightMode: boolean;
}

const FixedSunWithPanel = ({ isNight }: { isNight: boolean }) => {
  if (isNight) return null;

  return (
    <group position={[0, 12, -12]}>
      {/* Fixed stable sun */}
      <mesh position={[0, 6, 0]}>
        <sphereGeometry args={[1.8, 32, 32]} />
<meshBasicMaterial color="#FFD700" emissive="gold" emissiveIntensity={0.3} />
      </mesh>
      {/* Point light from fixed sun */}
      <pointLight position={[0, 6, 0]} intensity={0.4} color="#FFD700" />
      
      {/* Pole mount */}
      <Cylinder args={[0.04, 0.04, 1.2]} position={[0, 2.6, 0]}>
        <meshStandardMaterial color="#666" />
      </Cylinder>
      
      {/* Fixed solar panel mounted on sun */}
      <Box args={[1.4, 0.06, 1.0]} position={[0, 4.2, 0]} rotation={[Math.PI / 5, 0, 0]}>
        <meshStandardMaterial color="#1E40AF" metalness={0.8} roughness={0.2} />
      </Box>
    </group>
  );
};

const ParticleStream = ({ start, end, color, active, speed = 1.5, size = 0.2, count = 15, arc = false }: { start: [number, number, number], end: [number, number, number], color: string, active: boolean, speed?: number, size?: number, count?: number, arc?: boolean }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count]);

  useFrame((state, delta) => {
    if (!meshRef.current || !active) return;
    offsets.forEach((offset, i) => {
      offsets[i] = (offset + delta * speed) % 1;
      const t = offsets[i];
      dummy.position.lerpVectors(
        new THREE.Vector3(...start),
        new THREE.Vector3(...end),
        t
      );
      
      if (arc) {
        dummy.position.y += Math.sin(t * Math.PI) * 4;
      }
      
      dummy.scale.setScalar(Math.sin(t * Math.PI));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </instancedMesh>
  );
};

export default function Scene3D({ state, isLightMode }: Scene3DProps) {
  const isNight = state.scenario === 'night' || (state.scenario === 'ai_cycle' && (state.time >= 19 || state.time < 6));
  const isRain = state.scenario === 'rain';
  const isWind = state.scenario === 'wind';
  const isFault = state.scenario === 'fault';
  const isSpike = state.scenario === 'spike';

  // Calculate sun position based on time (0-24)
  // 12 noon = directly above, 6am/6pm = horizon
  const timeAngle = ((state.time - 6) / 12) * Math.PI;
  const sunY = Math.sin(timeAngle) * 20;
  const sunX = Math.cos(timeAngle) * 20;

  const isBypassed = state.aiDecision === 'Active Thermal-Bypass Routing (ATBR)';

  return (
    <div className={`w-full h-full absolute inset-0 z-0 transition-colors duration-1000 ${
      isNight ? 'bg-gradient-to-br from-[#0a1128] to-[#1a2b4c]' :
      isRain ? 'bg-gradient-to-br from-[#4a5568] to-[#64748b]' :
      isWind ? 'bg-gradient-to-br from-[#8b6914] to-[#c2a87a]' :
      'bg-gradient-to-br from-[#4F75A8] to-[#88C973]'
    }`}>
      <Canvas shadows>
        <OrthographicCamera makeDefault position={[20, 20, 20]} zoom={35} near={-100} far={100} />
        
        <ambientLight intensity={isNight ? 0.1 : isRain ? 0.3 : 0.6} />
        {!isNight && (
          <directionalLight 
            position={[sunX, Math.max(0, sunY), 10]} 
            intensity={isRain ? 0.3 : isWind ? 0.8 : 1} 
            castShadow 
          />
        )}

        {/* Dynamic sun visual removed per request */}
        

        <Grid 
          position={[0, -0.5, 0]} 
          args={[100, 100]} 
          cellSize={1} 
          cellThickness={1} 
          cellColor="rgba(255,255,255,0.2)" 
          sectionSize={5} 
          sectionThickness={1.5} 
          sectionColor="rgba(255,255,255,0.3)" 
          fadeDistance={50} 
          fadeStrength={1} 
        />

        <WeatherSystem scenario={state.scenario} />

        <SolarSection position={[-7, 0, -7]} scenario={state.scenario} soiling={state.soiling} time={state.time} />
        <FixedSunWithPanel isNight={isNight} />
        <GridSection position={[7, 0, -7]} />
        <StorageSection position={[-7, 0, 7]} batteryTemp={state.batteryTemp} isFault={isFault} isBypassed={isBypassed} />
        <CitySection position={[7, 0, 7]} isSpike={isSpike} />

        {/* Dynamic Energy Streams - Sun to panels stream removed per request */}
        
        <ParticleStream 
          start={[-7, 0.5, -7]} 
          end={[7, 0.5, 7]} 
          color="#38BDF8" 
          active={isBypassed} 
          speed={3} 
          size={0.4} 
          count={30} 
          arc={true}
        />
        <ParticleStream 
          start={[-7, 0.5, -7]} 
          end={[7, 0.5, -7]} 
          color="#38BDF8" 
          active={isBypassed} 
          speed={3} 
          size={0.4} 
          count={30} 
          arc={true}
        />

        {/* Arrows */}
        {/* Solar to Center */}
        <FlowArrow position={[-1, 0.1, -7]} rotation={0} length={6} color={state.solarOutput > 0 ? "#FEF08A" : "#4B5563"} />
        
        {/* Center to Battery (Charging) */}
        <FlowArrow 
          position={[-7, 0.1, -1]} 
          rotation={-Math.PI/2} 
          length={6} 
          color={(state.solarOutput > state.demand && state.aiDecision !== 'Active Thermal-Bypass Routing (ATBR)' && state.batterySoC < 100) ? "#FEF08A" : "#4B5563"} 
        />
        
        {/* Center to Grid (Export/Import) */}
        <FlowArrow 
          position={[7, 0.1, -1]} 
          rotation={-Math.PI/2} 
          length={6} 
          color={state.gridFlow < 0 ? "#FEF08A" : state.gridFlow > 0 ? "#EF4444" : "#4B5563"} 
        />
        
        {/* Battery to Center (Discharging) */}
        <FlowArrow 
          position={[-1, 0.1, 7]} 
          rotation={0} 
          length={6} 
          color={(state.solarOutput < state.demand && state.batterySoC > 0) || state.aiDecision === 'Peak Demand Bridging' ? "#4ADE80" : "#4B5563"} 
        />
        
        {/* Center to City (Consumption) */}
        <FlowArrow 
          position={[-2, 0.1, -2]} 
          rotation={-Math.PI/4} 
          length={8} 
          color={state.demand > 0 ? "#FEF08A" : "#4B5563"} 
        />

        {/* Central Glow */}
        <Sphere args={[2, 32, 32]} position={[0, 1, 0]}>
          <meshBasicMaterial color={isFault ? "#EF4444" : isSpike ? "#bb88ff" : "#FEF08A"} transparent opacity={0.4} />
        </Sphere>

        <OrbitControls 
          enablePan={true} 
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
