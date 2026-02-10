
import { RiskLevel, AbnormalDimension } from './types';

export const RISK_COLOR_MAP: Record<RiskLevel, string> = {
  [RiskLevel.CRITICAL]: '#ef4444', // Red-500
  [RiskLevel.HIGH]: '#f97316',     // Orange-500
  [RiskLevel.MEDIUM]: '#eab308',   // Yellow-500
  [RiskLevel.LOW]: '#3b82f6',      // Blue-500
  [RiskLevel.NONE]: 'transparent'
};

export const ABNORMAL_TYPES = [
  { id: 'T1', name: '非工作时间访问', dimension: AbnormalDimension.TIME, risk: RiskLevel.HIGH },
  { id: 'T2', name: '登录频率异常', dimension: AbnormalDimension.TIME, risk: RiskLevel.MEDIUM },
  { id: 'B1', name: '批量下载档案', dimension: AbnormalDimension.BEHAVIOR, risk: RiskLevel.CRITICAL },
  { id: 'B2', name: '操作路径跳跃', dimension: AbnormalDimension.BEHAVIOR, risk: RiskLevel.MEDIUM },
  { id: 'S1', name: '核心档案越权', dimension: AbnormalDimension.SENSITIVITY, risk: RiskLevel.CRITICAL },
  { id: 'S2', name: '敏感词检索异常', dimension: AbnormalDimension.SENSITIVITY, risk: RiskLevel.HIGH },
  { id: 'C1', name: '跨地域协同操作', dimension: AbnormalDimension.COMBINED, risk: RiskLevel.CRITICAL },
];

export const DEFAULT_KDE_CONFIG = {
  bandwidth: 8.0,
  wt: 0.3,
  ws: 0.4,
  wb: 0.3,
  gridSize: 50,
  timeWindow: 24
};
