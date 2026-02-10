
import { AbnormalPoint, AbnormalDimension, RiskLevel } from '../types';
import { ABNORMAL_TYPES } from '../constants';

let idCounter = 0;

export const generateMockPoint = (timeWindowHours: number = 24): AbnormalPoint => {
  const typeObj = ABNORMAL_TYPES[Math.floor(Math.random() * ABNORMAL_TYPES.length)];
  const riskScore = typeObj.risk === RiskLevel.CRITICAL ? 5 : typeObj.risk === RiskLevel.HIGH ? 4 : 3;
  
  // Cluster simulation: mostly in two "hot zones"
  const inCluster = Math.random() > 0.4;
  const clusterX = Math.random() > 0.5 ? 20 : 70;
  const clusterY = Math.random() > 0.5 ? 30 : 80;
  
  const x = inCluster ? clusterX + (Math.random() - 0.5) * 15 : Math.random() * 100;
  const y = inCluster ? clusterY + (Math.random() - 0.5) * 15 : Math.random() * 100;
  
  const now = Date.now();
  const t = now - Math.random() * timeWindowHours * 3600000;
  
  return {
    id: `pt-${idCounter++}`,
    x, y, t,
    abnormalType: typeObj.name,
    dimension: typeObj.dimension,
    riskLevel: typeObj.risk as RiskLevel,
    riskScore,
    userName: ['Zhang San', 'Li Si', 'Wang Wu', 'Admin_01', 'Auditor_X'][Math.floor(Math.random() * 5)],
    terminal: `Terminal-${100 + Math.floor(Math.random() * 10)}`,
    details: `Detected abnormal ${typeObj.name} at specified coordinates. Potential security breach.`
  };
};

export const generateInitialPoints = (count: number, hours: number): AbnormalPoint[] => {
  return Array.from({ length: count }, () => generateMockPoint(hours));
};
