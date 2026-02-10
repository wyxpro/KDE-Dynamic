
import React, { useEffect, useRef, useState } from 'react';
import { KDEConfig, AbnormalPoint, VisualMode, RiskLevel } from '../types';
import { calculateKDE, calculateKDE3D } from '../utils/kde';

interface Props {
  points: AbnormalPoint[];
  config: KDEConfig;
  viewMode: VisualMode;
  onPointClick: (p: AbnormalPoint) => void;
}

const RiskHeatmap: React.FC<Props> = ({ points, config, viewMode, onPointClick }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartInstance, setChartInstance] = useState<any>(null);

  useEffect(() => {
    if (chartRef.current && !chartInstance) {
      const instance = (window as any).echarts.init(chartRef.current);
      setChartInstance(instance);
      
      instance.on('click', (params: any) => {
        if (params.seriesType === 'scatter' || params.seriesType === 'scatter3D') {
          onPointClick(params.data.original);
        }
      });
    }

    return () => {
      if (chartInstance) {
        chartInstance.dispose();
      }
    };
  }, [chartRef]);

  useEffect(() => {
    if (chartInstance) {
      const updateChart = () => {
        let option: any;

        if (viewMode.type === '2D') {
          const kdeData = calculateKDE(points, config, '2D');
          
          option = {
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                if (params.seriesType === 'heatmap') {
                   return `核密度值: ${params.data[2].toFixed(4)}`;
                }
                const p = params.data.original;
                return `
                  <div class="p-2 text-xs">
                    <p class="font-bold border-b border-slate-700 mb-1">${p.abnormalType} - ${p.riskLevel}</p>
                    <p>用户: ${p.userName}</p>
                    <p>终端: ${p.terminal}</p>
                    <p>维度: ${p.dimension}</p>
                    <p>行为分数: ${p.riskScore}</p>
                  </div>
                `;
              }
            },
            visualMap: {
              show: false,
              min: 0,
              max: points.length > 0 ? points.length * 0.15 : 1,
              inRange: {
                color: [
                  'rgba(59, 130, 246, 0.1)', // Blue low
                  'rgba(234, 179, 8, 0.5)',  // Yellow mid
                  'rgba(249, 115, 22, 0.8)', // Orange high
                  'rgba(239, 68, 68, 0.95)'  // Red critical
                ]
              }
            },
            xAxis: { 
              type: 'value', 
              name: '空间特征 (IP/物理位置)', 
              min: 0, max: 100,
              splitLine: { lineStyle: { color: '#1e293b' } },
              axisLabel: { color: '#64748b' }
            },
            yAxis: { 
              type: 'value', 
              name: '行为特征 (敏感度/频率)', 
              min: 0, max: 100,
              splitLine: { lineStyle: { color: '#1e293b' } },
              axisLabel: { color: '#64748b' }
            },
            series: [
              {
                name: 'RiskHeat',
                type: 'heatmap',
                data: kdeData,
                emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
                progressive: 1000,
                animation: false
              },
              {
                name: 'Points',
                type: 'scatter',
                data: points.map(p => ({
                  value: [p.x, p.y],
                  original: p,
                  itemStyle: {
                    color: p.riskLevel === RiskLevel.CRITICAL ? '#ff0000' : p.riskLevel === RiskLevel.HIGH ? '#ff9900' : '#ffff00',
                    borderColor: '#fff',
                    borderWidth: 1,
                    shadowBlur: 10,
                    shadowColor: 'rgba(255, 255, 255, 0.5)'
                  }
                })),
                symbolSize: 8
              }
            ]
          };
        } else {
          // 3D Visualization
          const kdeData3D = calculateKDE3D(points, config);
          
          option = {
            backgroundColor: 'transparent',
            tooltip: {
                show: true,
                formatter: (params: any) => {
                    if (params.seriesType === 'surface') {
                        return `时空密度: ${params.data[2].toFixed(4)}`;
                    }
                    const p = params.data.original;
                    return `${p.userName}: ${p.abnormalType}`;
                }
            },
            visualMap: {
              show: false,
              min: 0,
              max: points.length > 0 ? points.length * 0.15 : 1,
              inRange: {
                color: [
                   '#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'
                ]
              }
            },
            xAxis3D: { name: '空间 (Space)', type: 'value', min: 0, max: 100 },
            yAxis3D: { name: '时间 (Hour)', type: 'value', min: 0, max: 24 },
            zAxis3D: { name: '风险强度', type: 'value' },
            grid3D: {
              viewControl: { projection: 'perspective', autoRotate: true, autoRotateSpeed: 5 },
              boxWidth: 100, boxDepth: 80, boxHeight: 60,
              light: { main: { intensity: 1.2, shadow: true }, ambient: { intensity: 0.3 } }
            },
            series: [
              {
                type: 'surface',
                wireframe: { show: false },
                shading: 'color',
                data: kdeData3D
              },
              {
                type: 'scatter3D',
                symbolSize: 5,
                data: points.map(p => {
                   const pt = new Date(p.t);
                   const pTime = pt.getHours() + pt.getMinutes() / 60;
                   return {
                     value: [p.x, pTime, p.riskScore * 0.5],
                     original: p,
                     itemStyle: { color: p.riskLevel === RiskLevel.CRITICAL ? '#ef4444' : '#f97316' }
                   };
                })
              }
            ]
          };
        }

        chartInstance.setOption(option, true);
      };

      updateChart();

      const handleResize = () => chartInstance.resize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [chartInstance, points, config, viewMode]);

  return (
    <div className="w-full h-full relative">
      <div ref={chartRef} className="w-full h-full" />
      {/* Background Grid Overlay to simulate floor plan / archive map */}
      {viewMode.type === '2D' && (
        <div className="absolute inset-0 pointer-events-none border border-slate-800/50 flex flex-wrap opacity-10">
           {Array.from({length: 16}).map((_, i) => (
             <div key={i} className="w-1/4 h-1/4 border border-slate-700 flex items-center justify-center">
                <span className="text-[10px]">Zone {String.fromCharCode(65 + i)}</span>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default RiskHeatmap;
