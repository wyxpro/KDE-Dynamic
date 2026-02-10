
import React from 'react';
import { KDEConfig, AbnormalDimension, RiskLevel, VisualMode } from '../types';
import { Sliders, Filter, Clock, Box, Layers } from 'lucide-react';

interface Props {
  config: KDEConfig;
  setConfig: (c: KDEConfig) => void;
  viewMode: VisualMode;
  setViewMode: (m: VisualMode) => void;
  filters: {
    dimensions: AbnormalDimension[];
    risks: RiskLevel[];
  };
  setFilters: (f: any) => void;
}

const ControlPanel: React.FC<Props> = ({ config, setConfig, viewMode, setViewMode, filters, setFilters }) => {
  const handleWeightChange = (key: keyof KDEConfig, val: number) => {
    setConfig({ ...config, [key]: val });
  };

  const toggleDimension = (dim: AbnormalDimension) => {
    const newDims = filters.dimensions.includes(dim)
      ? filters.dimensions.filter(d => d !== dim)
      : [...filters.dimensions, dim];
    setFilters({ ...filters, dimensions: newDims });
  };

  const toggleRisk = (risk: RiskLevel) => {
    const newRisks = filters.risks.includes(risk)
      ? filters.risks.filter(r => r !== risk)
      : [...filters.risks, risk];
    setFilters({ ...filters, risks: newRisks });
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-slate-900/50 border-r border-slate-800 h-full w-80 overflow-y-auto backdrop-blur-md">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-sky-400">
          <Sliders className="w-5 h-5" /> KDE 参数配置
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>核密度带宽 (Bandwidth)</span>
              <span>{config.bandwidth.toFixed(1)}</span>
            </div>
            <input 
              type="range" min="1" max="20" step="0.5" 
              value={config.bandwidth} 
              onChange={(e) => handleWeightChange('bandwidth', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>时间权重 (wt)</span>
                <span>{config.wt.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={config.wt} onChange={(e) => handleWeightChange('wt', parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none accent-sky-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>空间权重 (ws)</span>
                <span>{config.ws.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={config.ws} onChange={(e) => handleWeightChange('ws', parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none accent-sky-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>行为权重 (wb)</span>
                <span>{config.wb.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={config.wb} onChange={(e) => handleWeightChange('wb', parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none accent-sky-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-sky-400">
          <Layers className="w-5 h-5" /> 可视化模式
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode({ type: '2D' })}
            className={`flex-1 py-2 px-3 rounded flex items-center justify-center gap-2 border transition ${viewMode.type === '2D' ? 'bg-sky-500/20 border-sky-500 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
          >
            <Box className="w-4 h-4" /> 2D 平面
          </button>
          <button 
            onClick={() => setViewMode({ type: '3D' })}
            className={`flex-1 py-2 px-3 rounded flex items-center justify-center gap-2 border transition ${viewMode.type === '3D' ? 'bg-sky-500/20 border-sky-500 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
          >
            <Box className="w-4 h-4 rotate-45" /> 3D 立体
          </button>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-sky-400">
          <Filter className="w-5 h-5" /> 异常维度筛选
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[AbnormalDimension.TIME, AbnormalDimension.BEHAVIOR, AbnormalDimension.SENSITIVITY, AbnormalDimension.COMBINED].map(dim => (
            <button
              key={dim}
              onClick={() => toggleDimension(dim)}
              className={`py-1.5 px-2 rounded text-xs transition border ${filters.dimensions.includes(dim) ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              维度 {dim}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-sky-400">
          <Clock className="w-5 h-5" /> 风险等级过滤
        </h2>
        <div className="flex flex-col gap-2">
          {[RiskLevel.CRITICAL, RiskLevel.HIGH, RiskLevel.MEDIUM, RiskLevel.LOW].map(risk => (
            <button
              key={risk}
              onClick={() => toggleRisk(risk)}
              className={`flex items-center justify-between py-2 px-3 rounded text-sm transition border ${filters.risks.includes(risk) ? 'bg-slate-700 border-slate-500' : 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-50'}`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full`} style={{ 
                  backgroundColor: risk === RiskLevel.CRITICAL ? '#ef4444' : risk === RiskLevel.HIGH ? '#f97316' : risk === RiskLevel.MEDIUM ? '#eab308' : '#3b82f6' 
                }}></span>
                {risk}
              </span>
              {filters.risks.includes(risk) ? <span className="text-[10px] bg-slate-600 px-1 rounded">ON</span> : <span className="text-[10px]">OFF</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
