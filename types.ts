
export enum RiskLevel {
  CRITICAL = '严重',
  HIGH = '高危',
  MEDIUM = '中危',
  LOW = '低危',
  NONE = '无风险'
}

export enum AbnormalDimension {
  TIME = 'T',
  BEHAVIOR = 'B',
  SENSITIVITY = 'S',
  COMBINED = 'C'
}

export interface AbnormalPoint {
  id: string;
  x: number; // Space/IP coordinate (0-100)
  y: number; // Behavior/Frequency coordinate (0-100)
  t: number; // Timestamp
  z?: number; // Time of day mapped to 0-24 for 3D
  abnormalType: string;
  dimension: AbnormalDimension;
  riskLevel: RiskLevel;
  riskScore: number;
  userName: string;
  terminal: string;
  details: string;
}

export interface KDEConfig {
  bandwidth: number;
  wt: number;
  ws: number;
  wb: number;
  gridSize: number;
  timeWindow: number; // in hours
}

export interface VisualMode {
  type: '2D' | '3D';
}
