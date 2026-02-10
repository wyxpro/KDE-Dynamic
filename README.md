# 📊 KDE 动态档案风险监控

基于核密度估计（Kernel Density Estimation, KDE）的高性能动态风险热力图，用于档案管理系统的异常行为监控与告警。支持 T/B/S（时间、行为、敏感度）多维分析，提供 2D/3D 两种可视化模式与实时数据模拟。

## 📋 项目简介

- 以 React + TypeScript 构建的前端单页应用（SPA），使用 Vite 进行构建与开发
- 通过 ECharts / ECharts-GL 实现 2D 热力图与 3D 曲面/散点可视化
- Tailwind 通过 CDN 引入，快速完成现代深色风格 UI
- 内置数据生成器模拟异常行为，支持时间窗口控制与密度分布调整

## 🛠️ 技术栈

- 前端框架: React 19, TypeScript
- 构建工具: Vite
- 可视化: ECharts, ECharts-GL
- UI/样式: Tailwind CSS（CDN）
- 图标库: lucide-react
- 环境注入: Vite define + .env.local

## 🏗️ 项目架构

- 应用入口: [index.html](./index.html) + [index.tsx](./index.tsx) 挂载根组件 [App.tsx](./App.tsx)
- 状态与业务:
  - 配置与过滤参数由 App 管理，传递给核心组件
  - 控制面板负责 KDE 参数与可视化模式、过滤条件的交互
  - 风险热力图组件负责绘图并与 KDE 计算模块联动
- 数据流与计算:
  - 数据生成: [services/dataGenerator.ts](./services/dataGenerator.ts)
  - KDE 计算: [utils/kde.ts](./utils/kde.ts)
  - 类型与常量: [types.ts](./types.ts), [constants.ts](./constants.ts)
- 环境变量注入: [vite.config.ts](./vite.config.ts) 读取 GEMINI_API_KEY 并注入到 `process.env.*`

## 📁 目录结构

```
.
├── App.tsx
├── index.html
├── index.tsx
├── components/
│   ├── ControlPanel.tsx
│   └── RiskHeatmap.tsx
├── services/
│   └── dataGenerator.ts
├── utils/
│   └── kde.ts
├── types.ts
├── constants.ts
├── metadata.json
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## ⚡ 核心功能模块与工作流程

- 控制面板 [components/ControlPanel.tsx](./components/ControlPanel.tsx)
  - KDE 参数调节：带宽、时间/空间/行为权重（wt/ws/wb）
  - 可视化模式切换：2D 平面 / 3D 立体
  - 异常维度与风险等级筛选
- 风险热力图 [components/RiskHeatmap.tsx](./components/RiskHeatmap.tsx)
  - 2D：热力图 + 异常点散点展示，支持 Tooltip 与点击查看详情
  - 3D：曲面展示时空密度 + 3D 散点
  - 自适应窗口大小，支持交互事件回传
- KDE 计算模块 [utils/kde.ts](./utils/kde.ts)
  - `calculateKDE(points, config, '2D')` 计算二维密度场
  - `calculateKDE3D(points, config)` 计算三维曲面密度
- 数据生成 [services/dataGenerator.ts](./services/dataGenerator.ts)
  - `generateInitialPoints(count, hours)` 初始化数据集
  - `generateMockPoint(timeWindow)` 模拟实时新增点并保持时间窗口
- 类型与常量
  - [types.ts](./types.ts): 统一的类型定义（RiskLevel、AbnormalPoint、KDEConfig 等）
  - [constants.ts](./constants.ts): 风险颜色映射、异常类型枚举、默认 KDE 配置

## 📦 API 接口

当前版本为纯前端应用，未包含后端接口。以下为前端内部模块的主要“接口”与签名，便于二次开发：

```ts
// utils/kde.ts
export const calculateKDE: (
  points: AbnormalPoint[],
  config: KDEConfig,
  viewType?: '2D' | '3D'
) => [number, number, number][];

export const calculateKDE3D: (
  points: AbnormalPoint[],
  config: KDEConfig
) => [number, number, number][];

// services/dataGenerator.ts
export const generateInitialPoints: (count: number, hours: number) => AbnormalPoint[];
export const generateMockPoint: (timeWindowHours?: number) => AbnormalPoint;
```

如需接入后端，可按以下约定扩展：
- GET /api/risk/points?window=24 返回时间窗口内异常点集合
- POST /api/risk/ingest 上报新异常事件（用于实时流）
- GET /api/risk/stats 返回当前密度统计与分布指标

## ⚙️ 部署指南

开发运行

```bash
npm install
npm run dev
```

生产构建与预览

```bash
npm run build
npm run preview
```

静态托管建议
- 产物为纯前端静态资源，可直接部署到任意静态托管（Nginx/Apache、Vercel/Netlify、OSS/CDN）
- 确保 `index.html` 中的 CDN 资源可访问（Tailwind、ECharts、ECharts-GL、importmap）

## 🔑 环境变量

在项目根目录创建 `.env.local`（已在 .gitignore 忽略）：

```env
GEMINI_API_KEY=your_key_here
```

配置注入位置：[vite.config.ts](./vite.config.ts)

```ts
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

## 🧪 开发与运行

- 端口与主机：开发服务器默认 `0.0.0.0:3000`
- 代码风格：TypeScript + React 组件化，函数式与 hooks 为主
- 性能建议：大数据量时适当降低 `gridSize` 或提高 `bandwidth`，限制散点数量
- 可视化模式：2D 更适合大样本密度分布，3D 用于时空关联性分析

## 💡 常见问题

- 页面空白或图表不显示
  - 检查外网访问权限，确保 CDN（Tailwind/ECharts/ECharts-GL）未被拦截
  - 浏览器控制台是否有跨域或脚本加载错误
- 3D 模式卡顿
  - 减小 `gridSize`，降低曲面采样密度
  - 关闭 `autoRotate` 或降低旋转速度
- 环境变量未生效
  - 确认 `.env.local` 已创建且变量名为 `GEMINI_API_KEY`
  - 重新启动开发服务器以应用变更
- 端口冲突
  - 修改 [vite.config.ts](./vite.config.ts) 中的 `server.port`
