
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import RiskHeatmap from './components/RiskHeatmap';
import { KDEConfig, AbnormalPoint, AbnormalDimension, RiskLevel, VisualMode } from './types';
import { DEFAULT_KDE_CONFIG } from './constants';
import { generateInitialPoints, generateMockPoint } from './services/dataGenerator';
// Fixed missing Clock import
import { ShieldAlert, Activity, Users, Database, AlertTriangle, X, Play, Pause, RefreshCw, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<KDEConfig>(DEFAULT_KDE_CONFIG);
  const [points, setPoints] = useState<AbnormalPoint[]>([]);
  const [viewMode, setViewMode] = useState<VisualMode>({ type: '2D' });
  const [filters, setFilters] = useState({
    dimensions: [AbnormalDimension.TIME, AbnormalDimension.BEHAVIOR, AbnormalDimension.SENSITIVITY, AbnormalDimension.COMBINED],
    risks: [RiskLevel.CRITICAL, RiskLevel.HIGH, RiskLevel.MEDIUM]
  });
  const [selectedPoint, setSelectedPoint] = useState<AbnormalPoint | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Initialize data
  useEffect(() => {
    const initial = generateInitialPoints(200, config.timeWindow);
    setPoints(initial);
  }, []);

  // Live update simulation
  useEffect(() => {
    let interval: any;
    if (isLive) {
      interval = setInterval(() => {
        setPoints(prev => {
          const newPoint = generateMockPoint(config.timeWindow);
          const now = Date.now();
          // Filter out points older than time window
          const filtered = prev.filter(p => (now - p.t) < config.timeWindow * 3600000);
          return [...filtered, newPoint].slice(-1000); // Limit total points for performance
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLive, config.timeWindow]);

  const filteredPoints = useMemo(() => {
    return points.filter(p => 
      filters.dimensions.includes(p.dimension) && 
      filters.risks.includes(p.riskLevel)
    );
  }, [points, filters]);

  const stats = useMemo(() => {
    const criticalCount = filteredPoints.filter(p => p.riskLevel === RiskLevel.CRITICAL).length;
    const highCount = filteredPoints.filter(p => p.riskLevel === RiskLevel.HIGH).length;
    const usersCount = new Set(filteredPoints.map(p => p.userName)).size;
    return { criticalCount, highCount, usersCount };
  }, [filteredPoints]);

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden font-sans">
      {/* Sidebar Controls */}
      <ControlPanel 
        config={config} 
        setConfig={setConfig} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        filters={filters}
        setFilters={setFilters}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">档案管理系统异常行为检测</h1>
              <p className="text-xs text-slate-400">KDE-Driven Dynamic Risk Heatmap • {viewMode.type} Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold">严重告警</p>
                <p className="text-lg font-mono text-red-500 font-bold">{stats.criticalCount}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold">高危行为</p>
                <p className="text-lg font-mono text-orange-500 font-bold">{stats.highCount}</p>
              </div>
              <div className="text-right border-l border-slate-700 pl-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold">涉及用户</p>
                <p className="text-lg font-mono text-sky-400 font-bold">{stats.usersCount}</p>
              </div>
            </div>

            <button 
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition ${isLive ? 'bg-green-500/10 text-green-400 border border-green-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
            >
              {isLive ? <><Activity className="w-4 h-4 animate-spin-slow" /> 实时监控中</> : <><Pause className="w-4 h-4" /> 监控暂停</>}
            </button>
          </div>
        </header>

        {/* Heatmap Area */}
        <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
          <RiskHeatmap 
            points={filteredPoints} 
            config={config} 
            viewMode={viewMode}
            onPointClick={setSelectedPoint}
          />

          {/* Bottom Time Bar */}
          <div className="absolute bottom-6 left-6 right-6 h-12 bg-slate-900/80 backdrop-blur-lg border border-slate-700 rounded-xl flex items-center px-4 gap-4 z-10 shadow-2xl">
            <div className="flex items-center gap-2 text-sky-400">
               <Clock className="w-4 h-4" />
               <span className="text-xs font-bold whitespace-nowrap">时间窗口: {config.timeWindow}h</span>
            </div>
            <div className="flex-1 h-1 bg-slate-800 rounded-full relative overflow-hidden">
               <div className="absolute inset-0 bg-sky-500/30 w-full animate-pulse"></div>
               <div className="absolute h-full bg-sky-400 w-2/3 shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Last Refresh: {new Date().toLocaleTimeString()}
            </div>
            <button 
              onClick={() => setPoints(generateInitialPoints(200, config.timeWindow))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition"
              title="手动刷新数据"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Floating UI Elements */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
             <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 shadow-xl backdrop-blur">
                <p className="text-[10px] text-slate-500 uppercase mb-2 font-bold tracking-widest">KDE 密度分布</p>
                <div className="h-2 w-32 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded-full"></div>
                <div className="flex justify-between text-[8px] text-slate-500 mt-1 uppercase">
                  <span>低危</span>
                  <span>中危</span>
                  <span>严重</span>
                </div>
             </div>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedPoint && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${selectedPoint.riskLevel === RiskLevel.CRITICAL ? 'text-red-500' : 'text-orange-500'}`} />
                  异常详情: {selectedPoint.abnormalType}
                </h3>
                <button onClick={() => setSelectedPoint(null)} className="p-1 hover:bg-slate-700 rounded-full transition">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">操作用户</p>
                    <p className="text-white flex items-center gap-2"><Users className="w-3.5 h-3.5 text-sky-400" /> {selectedPoint.userName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">风险等级</p>
                    <p className={`font-bold ${selectedPoint.riskLevel === RiskLevel.CRITICAL ? 'text-red-500' : 'text-orange-500'}`}>
                      {selectedPoint.riskLevel} (Score: {selectedPoint.riskScore})
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">访问终端</p>
                    <p className="text-white flex items-center gap-2"><Database className="w-3.5 h-3.5 text-sky-400" /> {selectedPoint.terminal}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">发生时间</p>
                    <p className="text-white">{new Date(selectedPoint.t).toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">判定判定指标/标准</p>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm text-slate-300">
                    {selectedPoint.details}
                    <p className="mt-2 text-xs text-sky-400/80">检测逻辑: 基于三维特征 (T/B/S) 空间分布权重模型计算</p>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-red-900/20">
                    立即阻断该用户
                  </button>
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition border border-slate-700">
                    深度审计追溯
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Global CSS enhancements */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
