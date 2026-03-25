import React, { useState, useEffect } from 'react';
import { SimulationState } from '../store/simulation';
type Scenario = 'ai_cycle' | 'sun' | 'rain' | 'wind' | 'night' | 'fault' | 'spike';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ComposedChart } from 'recharts';
import { Activity, Battery, Sun, Zap, ThermometerSun, AlertTriangle, Cpu, ArrowRightLeft, Wind, Moon } from 'lucide-react';

export default function DashboardUI({ state, setScenario, isLightMode, setIsLightMode }: { state: SimulationState, setScenario: (s: Scenario) => void, isLightMode: boolean, setIsLightMode: (b: boolean) => void }) {
  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const mins = Math.floor((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const isHot = state.temperature > 45;
  const isFault = state.scenario === 'fault';

  const scenarios: {id: Scenario, icon: string, label: string}[] = [
    { id: 'ai_cycle', icon: '🧠', label: 'AI Thermal Cycle' },
    { id: 'sun', icon: '☀️', label: 'Bright Sun' },
    { id: 'rain', icon: '🌧️', label: 'Rain & Clouds' },
    { id: 'wind', icon: '💨', label: 'Wind' },
    { id: 'night', icon: '🌙', label: 'Night' },
    { id: 'fault', icon: '⚠️', label: 'Thermal Fault' },
    { id: 'spike', icon: '🏭', label: 'Factory Peak' },
  ];

  return (
    <div className="absolute inset-0 z-10 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
      
      {/* Scenario Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto bg-sg-dark-2/80 backdrop-blur-md p-2 rounded-full border border-sg-gray/20">
        {scenarios.map(s => (
          <button 
            key={s.id}
            onClick={() => setScenario(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${state.scenario === s.id ? 'bg-sg-green text-sg-dark' : 'text-sg-gray-light hover:bg-sg-gray/20'}`}
          >
            <span>{s.icon}</span>
            <span className="hidden md:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Top Bar */}
      <div className="flex justify-between items-start gap-4 mt-12 md:mt-0">
        {/* Branding & Environment */}
        <div className="flex flex-col gap-4 pointer-events-auto w-full max-w-sm">
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h1 className="font-display font-black text-xl text-sg-green flex items-center gap-2">
                <div className="w-3 h-3 bg-sg-green rounded-full animate-pulse" />
                SmartGrid DZ
              </h1>
              <p className="text-xs text-sg-gray-light mt-1">Digital Twin Dashboard</p>
            </div>
            <div className="flex items-center gap-4 text-left">
              <button 
                onClick={() => setIsLightMode(!isLightMode)}
                className="p-2 rounded-full bg-sg-dark-3 text-sg-gray-light hover:text-sg-green transition-colors"
                title="Toggle Theme"
              >
                {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <div>
                <div className="text-2xl font-bold font-mono">{formatTime(state.time)}</div>
                <div className={`text-sm font-bold flex items-center gap-1 justify-end ${isHot ? 'text-sg-red' : 'text-sg-amber'}`}>
                  {Math.round(state.temperature)}°C <ThermometerSun size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Decision Panel */}
          <div className={`glass-panel rounded-2xl p-4 border-l-4 ${isFault ? 'border-l-sg-red' : isHot ? 'border-l-sg-amber' : 'border-l-sg-green'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={18} className="text-sg-light-blue" />
              <h2 className="font-bold text-sm text-sg-light-blue">Decision Engine (AI)</h2>
            </div>
            <div className={`text-lg font-bold mb-1 ${isFault ? 'text-sg-red' : ''}`}>{state.aiDecision}</div>
            <p className="text-xs text-sg-gray-light leading-relaxed">{state.aiReason}</p>
            
            {isFault && (
              <div className="mt-3 bg-sg-red/10 border border-sg-red/30 rounded-lg p-2 flex items-start gap-2">
                <AlertTriangle size={16} className="text-sg-red shrink-0 mt-0.5" />
                <p className="text-[10px] text-sg-red font-bold">
                  Critical Thermal Alert: Cell B7 exceeded 50°C. Forced cooling activated and charging restricted.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Right */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          <StatCard icon={<Sun />} label="Solar Production" value={`${Math.round(state.solarOutput)} kW`} color="text-sg-light-blue" />
          <StatCard icon={<Activity />} label="Factory Demand" value={`${Math.round(state.demand)} kW`} color={state.scenario === 'spike' ? 'text-[#bb88ff]' : 'text-sg-amber'} />
          <StatCard icon={<Battery />} label="Battery Level" value={`${Math.round(state.batterySoC)}%`} color={state.batterySoC < 20 ? 'text-sg-red' : 'text-sg-green'} />
          <StatCard 
            icon={<ArrowRightLeft />} 
            label="National Grid" 
            value={`${Math.abs(Math.round(state.gridFlow))} kW`} 
            subValue={state.gridFlow > 0 ? 'Import' : state.gridFlow < 0 ? 'Export' : 'Balanced'}
            color={state.gridFlow > 0 ? 'text-sg-red' : 'text-sg-green'} 
          />
          {state.soiling > 0 && (
            <StatCard icon={<Wind />} label="Dust Loss" value={`-${Math.round(state.soiling * 100)}%`} color="text-sg-amber" />
          )}
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="w-full h-48 md:h-64 glass-panel rounded-2xl p-4 pointer-events-auto flex flex-col">
        <div className="flex items-center justify-between mb-2">
<h3 className="font-bold text-sm">Performance Analysis</h3>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-sg-light-blue"></div> Production</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-sg-amber"></div> Demand</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-sg-green"></div> Battery</span>
          </div>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={state.history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5BBBFF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#5BBBFF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="timeStr" stroke="var(--sg-gray-light)" fontSize={10} tickMargin={10} />
              <YAxis yAxisId="left" stroke="var(--sg-gray-light)" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--sg-gray-light)" fontSize={10} domain={[0, 100]} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              <Area yAxisId="left" type="monotone" dataKey="solar" name="Production (kW)" stroke="#5BBBFF" strokeWidth={2} fillOpacity={1} fill="url(#colorSolar)" />
              <Area yAxisId="left" type="monotone" dataKey="demand" name="Demand (kW)" stroke="#F5A623" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" />
              <Line yAxisId="right" type="monotone" dataKey="soc" name="Battery (%)" stroke="#00C896" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

function StatCard({ icon, label, value, subValue, color }: { icon: React.ReactNode, label: string, value: string, subValue?: string, color: string }) {
  return (
    <div className="glass-panel rounded-xl p-3 flex items-center gap-3 min-w-[160px]">
      <div className={`p-2 rounded-lg bg-sg-dark-3 ${color}`}>
{React.cloneElement(icon as React.ReactElement, {} as any)}
      </div>
      <div>
        <div className="text-[10px] text-sg-gray-light">{label}</div>
        <div className="font-bold font-mono text-sm">{value}</div>
        {subValue && <div className={`text-[9px] font-bold ${color}`}>{subValue}</div>}
      </div>
    </div>
  );
}
