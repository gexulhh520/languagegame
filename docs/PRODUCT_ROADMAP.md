# Language Game — Product Roadmap & Architecture Plan

> Casa Italiana 餐厅点餐关卡 · 从本地闭环到多人记忆与商业化

---

## 一、阶段任务拆解 (Phase Breakdown)

### Phase 1: 本地单机交互与 2.5D 闭环自测（当前阶段）

- [ ] 运行环境与依赖验证：执行 `npm run dev`，确保三层 UI 正常挂载。
- [ ] 10 分钟点餐流程闭环（使用 `mockAiService`）：
  - [ ] 欢迎与入座：服务员 Marco 打招呼。
  - [ ] 菜单交互：可点击桌上 Menu 查看菜品与价格。
  - [ ] 输入与自然承接：输入点餐意图，测试 Mock 数据自然回应。
  - [ ] 突发事件测试：触发 “Margherita 披萨售罄”，引导玩家换菜或拒绝。
  - [ ] 离开结算：弹出 `SettlementModal`，展示自然度评分与新增表达。

### Phase 2: 后端 AI 编排服务搭建 (Backend & AI Gateway)

- [ ] 搭建 Node.js (Hono) 后端服务：
  - [ ] 初始化 `server/` 项目，前后端共用 `shared/types` 数据协议。
  - [ ] 实现 `POST /api/dialogue` 流式接口（基于 SSE）。
- [ ] 核心 Prompt 规范与测试：
  - [ ] 编排 Casa Italiana 服务员 Marco 人设与菜单约束。
  - [ ] 落地中国用户典型口误自然反馈（如输入 `I very like pizza` 时顺承纠正）。
  - [ ] 落地双通道输出：前端毫秒级流式输出台词，后台提取 JSON 评分指标。
- [ ] 防刷与安全防护：
  - [ ] API Key 严格保存在后端环境变量，禁止暴露给前端。
  - [ ] 单 IP / 单会话请求频率限制（Rate Limit）。

### Phase 3: 多人账号体系与“世界记忆”持久化 (Multi-User & Memory)

- [ ] 接入 Supabase / PostgreSQL 基础表：
  - [ ] `users`：用户基础信息、认证凭据。
  - [ ] `npc_memories`：记录 NPC 对玩家的专属记忆（如偏好、口误、约定）。
  - [ ] `user_skills`：A1–B1 语言能力掌握状态及主动输出次数统计。
  - [ ] `game_sessions`：当前任务未完成状态存档。
- [ ] 记忆召回机制：
  - [ ] 玩家登录后，后端拉取专属记忆，动态注入 Prompt，实现“服务员记得你上次来过”。

### Phase 4: 2.5D 沉浸感与表现力升级 (Immersion & Visuals)

- [ ] 场景视差与深度：在 `RestaurantScene` 中加入桌椅、光影遮挡与微景深效果。
- [ ] 立绘表情状态机：服务员与 Emma 根据对话情绪切换动作切片（倾听、困惑、微笑、确认）。
- [ ] 打字机音效与环境声：加入餐厅微弱的环境白噪音、餐具碰撞声与打字机音效。

### Phase 5: 商业化闭环与内容扩展 (Production & Growth)

- [ ] 核心指标埋点 (Analytics)：
  - [ ] 第一局点餐完成率 (D0 Completion Rate)。
  - [ ] 次日留存悬念触发率 (D1/D7 Retention)。
  - [ ] 每日主动英语输入次数 (Active Output Count)。
- [ ] 内容系统化扩展：
  - [ ] 沉淀任务生成器（Task Generator），通过“场景 × 人物 × 目标 × 意外”积木扩展 50 个日常事件。
  - [ ] 逐步解锁伦敦下一个生活场景（地铁、咖啡店、办公室）。

---

## 二、数据协议定义 (Data Contract)

前后端统一遵循 `src/types/game.ts` / `shared/types/game.ts`：

```typescript
export interface LanguageAssessment {
  meaningUnderstood: boolean;
  grammarAcceptable: boolean;
  naturalnessScore: number; // 1-5 星
  correctionTip?: string;
}

export interface ServerDialogueResponse {
  speaker: 'Waiter' | 'Emma';
  dialogueText: string;
  eventTriggered?: 'dish_out_of_stock' | 'order_confirmed' | 'task_completed';
  assessment?: LanguageAssessment;
  newMemoryKey?: string;
}
```

---

## 三、核心原则守则 (Golden Rules)

1. **游戏性优先**：不会英语游戏会变难，掌握英语游戏会变强；绝不做成打卡背题软件。
2. **拒绝唯一定义判错**：重在意思传达与真实交流，错误应转化为角色记忆与互动梗。
3. **边界由规则定，细节由 AI 填**：严防无边界自由漫谈，始终锚定关卡任务与语言目标。
