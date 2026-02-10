
import { AbnormalPoint, KDEConfig } from '../types';

/**
 * Gaussian Kernel Function
 */
const gaussianKernel = (dist: number, h: number): number => {
  return (1 / (h * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(dist / h, 2));
};

/**
 * Calculates KDE field for a given set of points and grid
 */
export const calculateKDE = (
  points: AbnormalPoint[],
  config: KDEConfig,
  viewType: '2D' | '3D' = '2D'
) => {
  const { gridSize, bandwidth, wt, ws, wb } = config;
  const result: [number, number, number][] = [];
  const zMax = viewType === '3D' ? 24 : 0;
  
  // Normalize points dimensions if needed, here we assume points x/y are 0-100
  // For each grid point, calculate sum of kernel weights
  for (let i = 0; i <= gridSize; i++) {
    const x = (i / gridSize) * 100;
    for (let j = 0; j <= gridSize; j++) {
      const y = (j / gridSize) * 100;
      
      let density = 0;
      
      points.forEach(p => {
        // Weighted Euclidean Distance
        // In 2D: x is spatial, y is behavior
        // In 3D: we could add t (time) as Z
        const dx = (x - p.x);
        const dy = (y - p.y);
        
        // Distance incorporates weights ws (space) and wb (behavior)
        const dist = Math.sqrt(ws * dx * dx + wb * dy * dy);
        
        const k = gaussianKernel(dist, bandwidth);
        // Intensity is scaled by Risk Score (2-5)
        density += p.riskScore * k;
      });
      
      // Normalize density roughly for visualization
      result.push([x, y, density]);
    }
  }
  
  return result;
};

/**
 * Optimized 3D Surface KDE
 */
export const calculateKDE3D = (
  points: AbnormalPoint[],
  config: KDEConfig
) => {
  const { gridSize, bandwidth, wt, ws, wb } = config;
  const result: [number, number, number][] = [];
  
  // In 3D: X=Space, Y=Time (0-24), Z=Density (using Behavior as density contributor)
  for (let i = 0; i <= gridSize; i++) {
    const spaceX = (i / gridSize) * 100;
    for (let j = 0; j <= gridSize; j++) {
      const timeY = (j / gridSize) * 24; // 24 hours
      
      let density = 0;
      points.forEach(p => {
        const pt = new Date(p.t);
        const pTime = pt.getHours() + pt.getMinutes() / 60;
        
        const ds = (spaceX - p.x);
        const dt = (timeY - pTime) * (100 / 24); // Scale time to space scale for distance calc
        
        const dist = Math.sqrt(ws * ds * ds + wt * dt * dt);
        const k = gaussianKernel(dist, bandwidth);
        density += p.riskScore * k;
      });
      
      result.push([spaceX, timeY, density]);
    }
  }
  return result;
};
