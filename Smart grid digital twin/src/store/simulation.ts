import { useState, useEffect, useRef } from 'react';

export type Scenario = 'sun' | 'rain' | 'wind' | 'night' | 'fault' | 'spike' | 'ai_cycle';

export interface SimulationState {
  time: number;
  temperature: number;
  solarOutput: number;
  demand: number;
  batterySoC: number;
  batteryTemp: number;
  gridFlow: number;
  aiDecision: string;
  aiReason: string;
  scenario: Scenario;
  soiling: number;
  history: any[];
}

export function useSimulation() {
  const [scenario, setScenario] = useState<Scenario>('ai_cycle');
  const [state, setState] = useState<SimulationState>({
    time: 8,
    temperature: 28,
    solarOutput: 200,
    demand: 150,
    batterySoC: 40,
    batteryTemp: 25,
    gridFlow: 0,
    aiDecision: 'System Initialization...',
    aiReason: 'Analyzing data',
    scenario: 'ai_cycle',
    soiling: 0,
    history: [],
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;

  useEffect(() => {
    const interval = setInterval(() => {
      const current = stateRef.current;
      const activeScenario = scenarioRef.current;
      
      let timeStep = activeScenario === 'ai_cycle' ? 0.2 : 0.1;
      let newTime = current.time + timeStep;
      if (newTime >= 24) newTime = 0;

      let targetTemp = 35;
      let targetSolar = 400;
      let targetDemand = 150;
      let newSoiling = current.soiling;
      let faultActive = false;

      // Apply Scenario Overrides
      switch (activeScenario) {
        case 'ai_cycle':
          if (newTime >= 11 && newTime < 16) {
            targetTemp = 48; // Extreme heat
            targetSolar = 550 * (1 - newSoiling);
            targetDemand = 300; // Daytime AC
          } else if (newTime >= 16 && newTime < 19) {
            targetTemp = 32; // Cooling down
            targetSolar = 250 * (1 - newSoiling);
            targetDemand = 150;
          } else if (newTime >= 19 || newTime < 6) {
            targetTemp = 22; // Night
            targetSolar = 0;
            targetDemand = 450; // Peak demand
          } else {
            targetTemp = 28; // Morning
            targetSolar = 300 * (1 - newSoiling);
            targetDemand = 150;
          }
          break;
        case 'sun':
          targetTemp = 45;
          targetSolar = 480 * (1 - newSoiling);
          break;
        case 'rain':
          targetTemp = 25;
          targetSolar = 40;
          newSoiling = Math.max(0, newSoiling - 0.05); // Rain cleans panels
          break;
        case 'wind':
          targetTemp = 38;
          targetSolar = 350 * (1 - newSoiling);
          newSoiling = Math.min(0.25, newSoiling + 0.005); // Dust accumulates
          break;
        case 'night':
          newTime = 22; // Force night time
          targetTemp = 22;
          targetSolar = 0;
          break;
        case 'fault':
          targetTemp = 42;
          targetSolar = 450 * (1 - newSoiling);
          faultActive = true;
          break;
        case 'spike':
          targetTemp = 35;
          targetSolar = 400 * (1 - newSoiling);
          targetDemand = 380; // Massive spike
          break;
      }

      // Smooth transitions
      const newTemp = current.temperature + (targetTemp - current.temperature) * 0.1;
      const newSolar = current.solarOutput + (targetSolar - current.solarOutput) * 0.2;
      const newDemand = current.demand + (targetDemand - current.demand) * 0.2;

      let newSoC = current.batterySoC;
      let newGridFlow = 0;
      let decision = '';
      let reason = '';
      let newBatTemp = current.batteryTemp;

      newBatTemp = newBatTemp + (newTemp - newBatTemp) * 0.02;
      if (faultActive) newBatTemp += 2; // Fault causes rapid heating
      if (activeScenario === 'wind') newBatTemp -= 0.5; // Wind cooling

      const netPower = newSolar - newDemand;
      const batteryCapacity = 1000;
      const maxRate = 250;

      if (activeScenario === 'ai_cycle') {
        if (newTime >= 11 && newTime < 16) { // Midday
          newGridFlow = -newSolar + newDemand; 
          decision = 'Active Thermal-Bypass Routing (ATBR)';
          reason = `Extreme Heat (${newTemp.toFixed(1)}°C). Solid-state relays disconnected battery to prevent degradation. 100% solar routed directly to city AC grid.`;
        } else if (newTime >= 16 && newTime < 19) { // Late Afternoon
          if (newSoC < 100) {
            const charge = Math.min(newSolar, maxRate * 1.5);
            newSoC += (charge * timeStep) / batteryCapacity * 100;
            newGridFlow = -(newSolar - charge) + newDemand;
            decision = 'Pre-emptive Rapid Charge';
            reason = `Temp dropping (${newTemp.toFixed(1)}°C). AI reconnected DC-DC controllers. Harvesting remaining solar curve at high C-rate before sunset.`;
          } else {
            newGridFlow = -newSolar + newDemand;
            decision = 'Battery Full';
            reason = 'Battery reached 100%. Exporting remaining solar.';
          }
        } else if (newTime >= 19 || newTime < 6) { // Night Peak
          if (newSoC > 5) {
            const discharge = Math.min(newDemand, maxRate * 2);
            newSoC -= (discharge * timeStep) / batteryCapacity * 100;
            newGridFlow = newDemand - discharge;
            decision = 'Peak Demand Bridging';
            reason = `Solar offline. City demand peaking. Discharging safely stored afternoon energy to stabilize the grid.`;
          } else {
            newGridFlow = newDemand;
            decision = 'Grid Import';
            reason = 'Battery depleted. Relying on national grid.';
          }
        } else {
          // Morning
          if (netPower > 0) {
            const charge = Math.min(netPower, maxRate);
            newSoC += (charge * timeStep) / batteryCapacity * 100;
            newGridFlow = -(netPower - charge);
            decision = 'Standard Charging';
            reason = 'Morning sun. Normal charging operations active.';
          } else {
            const discharge = Math.min(Math.abs(netPower), maxRate);
            newSoC -= (discharge * timeStep) / batteryCapacity * 100;
            newGridFlow = Math.abs(netPower) - discharge;
            decision = 'Standard Discharging';
            reason = 'Supplementing morning grid demand.';
          }
        }
      } else {
        if (faultActive) {
          // Fault logic
          const limitedCharge = Math.min(netPower > 0 ? netPower : 0, maxRate * 0.1);
          if (netPower > 0) {
            newSoC += (limitedCharge * timeStep) / batteryCapacity * 100;
            newGridFlow = -(netPower - limitedCharge);
          } else {
            newGridFlow = Math.abs(netPower); // Rely on grid
          }
          decision = 'Thermal Fault - System Restricted';
          reason = 'Critical temperature rise detected in cell (B7). Fast charging stopped and load transferred to grid.';
        } else if (netPower > 0) {
          if (newSoC < 100) {
            if (newTemp > 42) {
              const limitedCharge = Math.min(netPower, maxRate * 0.4);
              newSoC += (limitedCharge * timeStep) / batteryCapacity * 100;
              newGridFlow = -(netPower - limitedCharge);
              newBatTemp += 0.1;
              decision = 'Thermal Protection + Partial Charge';
              reason = `High Temp (${newTemp.toFixed(1)}°C). Charging current reduced to protect battery SoH.`;
            } else {
              const charge = Math.min(netPower, maxRate);
              newSoC += (charge * timeStep) / batteryCapacity * 100;
              newGridFlow = -(netPower - charge);
              newBatTemp += 0.3;
              decision = 'Charging Battery';
              reason = 'Optimal conditions. Storing solar surplus in batteries.';
            }
          } else {
            newGridFlow = -netPower;
            decision = 'Exporting to Grid';
            reason = 'Battery full. Exporting surplus to national grid.';
          }
        } else {
          const needed = Math.abs(netPower);
          if (newSoC > 10) {
            const discharge = Math.min(needed, maxRate);
            newSoC -= (discharge * timeStep) / batteryCapacity * 100;
            newGridFlow = (needed - discharge);
            newBatTemp += 0.4;
            decision = 'Discharging Battery';
            reason = activeScenario === 'spike' 
              ? 'Instant response (200ms) to absorb sudden consumption spike.'
              : 'Covering deficit from battery to reduce electricity bill.';
          } else {
            newGridFlow = needed;
            decision = 'Importing from Grid';
            reason = 'Low battery level. Relying on the grid.';
          }
        }
      }

      newSoC = Math.max(0, Math.min(100, newSoC));
      newBatTemp = Math.max(20, Math.min(65, newBatTemp));

      const newHistory = [...current.history, {
        timeStr: `${Math.floor(newTime).toString().padStart(2, '0')}:${Math.floor((newTime % 1) * 60).toString().padStart(2, '0')}`,
        solar: Math.round(newSolar),
        demand: Math.round(newDemand),
        soc: Math.round(newSoC),
        temp: Math.round(newTemp)
      }].slice(-60);

      setState({
        time: newTime,
        temperature: newTemp,
        solarOutput: newSolar,
        demand: newDemand,
        batterySoC: newSoC,
        batteryTemp: newBatTemp,
        gridFlow: newGridFlow,
        aiDecision: decision,
        aiReason: reason,
        scenario: activeScenario,
        soiling: newSoiling,
        history: newHistory,
      });

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { state, setScenario };
}

