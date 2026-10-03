# 英语生活模拟游戏：全阶段开发规格说明书

> 文件：`docs/DEV_SPEC_PHASED.md`  
> 来源：[Google Docs 规格原文](https://docs.google.com/document/d/1xZtX972woqImWFil185FXHSqF9Jth6whgcOF00mPel0/edit?usp=sharing)  
> 用途：供 Cursor / Claude Code / Copilot 等 AI 编码工具按阶段落地实现

**目标：** 打造一款以英语为核心操作系统的 2.5D 沉浸式生活模拟游戏。首发切片为伦敦 Casa Italiana 餐厅的点餐与突发事件闭环。

## 技术栈架构

| 层级 | 技术 |
|------|------|
| 客户端 | React 19 + TypeScript + Vite + Pixi.js（固定 16:9 PC 容器） |
| 服务端 | Node.js (TypeScript) + Hono（AI 编排、流式 SSE、状态守卫） |
| 数据库 | 原生 PostgreSQL（Docker Compose 本地开发，可直迁云端） |
| 大模型 | 云端 API 统一接入（OpenAI 兼容接口 / DeepSeek 等） |

## 阶段规划概览

```
[Phase 1: 前端切片与状态机闭环]
  ➔ [Phase 2: PostgreSQL 与服务端基础设施]
  ➔ [Phase 3: AI 编排与 SSE 流式推送]
  ➔ [Phase 4: 世界记忆存取与关卡结算]
  ➔ [Phase 5: 全链路联调与视听打磨]
```

---

## Phase 1: 客户端垂直切片与本地状态机闭环 (Client FSM)

### 1. 目标

在不依赖后端和真实大模型 API 的前提下，通过 `mockAiService.ts` 完整跑通餐厅 10 分钟的点餐交互闭环，验证三层 UI 结构和状态机流转。

### 2. 涉及文件

- `src/types/game.ts`
- `src/state/useGameStore.ts`
- `src/services/mockAiService.ts`
- `src/components/Interactive/MenuModal.tsx`
- `src/components/Dialogue/DialogueBox.tsx`
- `src/components/Dialogue/InputArea.tsx`
- `src/components/Feedback/SettlementModal.tsx`
- `src/components/GameWorld/RestaurantScene.tsx`

### 3. 具体实现规格

#### 3.1 状态机补齐 (`src/state/useGameStore.ts`)

维护状态枚举：

```
GREETING
  ➔ BROWSING_MENU
  ➔ ORDERING_INITIAL
  ➔ EVENT_OUT_OF_STOCK
  ➔ ORDERING_SUBSTITUTE
  ➔ ORDER_CONFIRMED
  ➔ SETTLEMENT
```

#### 3.2 菜单组件交互 (`MenuModal.tsx`)

- 英文为主展示：
  - Carbonara (£14)
  - Tomato Pasta (£12)
  - Margherita Pizza (£13, 标注红色 `[Sold Out]`)
  - Mushroom Pizza (£14)
  - Coke (£3)
- 中文翻译默认隐藏，鼠标悬浮（Hover）时才通过 Tooltip 浮层展示，避免做成背单词软件。

#### 3.3 Mock 逻辑完备性 (`mockAiService.ts`)

- 当玩家输入中包含 `margherita` 或 `pizza` 时，命中分支：服务员 Marco 告知 Margherita 售罄并推荐 Mushroom Pizza。
- 当玩家回应 `I don't like mushrooms` 或表达拒绝时，Marco 提议 Tomato Pasta。
- 当玩家确认 `I'll have that` 时，状态跃迁到 `ORDER_CONFIRMED`。

#### 3.4 延迟结算面板 (`SettlementModal.tsx`)

关卡结算时展示：

- 4 个达成的生活情境
- 本次学到的 3 个地道表达（如 `How about...?`）
- Emma 好感度 +2
- 明天的悬念钩子

### 4. Phase 1 验收标准 (Acceptance Criteria)

- [ ] 终端运行 `npm run dev` 零报错，页面自动锁定在 16:9 居中视窗。
- [ ] 点击桌上菜单可自如开关，中文折叠正常。
- [ ] 输入英文可完整走完「招呼 ➔ 点餐 ➔ 售罄 ➔ 换菜 ➔ 确认 ➔ 结算」完整流程。
- [ ] 点餐过程中对话框内绝不出现打断沉浸感的语法红叉。

---

## Phase 2: PostgreSQL 数据库与服务端基础工程 (Server & DB)

### 2.1 目标

搭建独立的 Node.js (Hono) 后端工程与本地 PostgreSQL 数据库容器，实现原生用户认证（注册/登录）与数据库表初始化。

### 2.2 涉及文件

- `docker-compose.yml`（根目录）
- `server/package.json`
- `server/tsconfig.json`
- `server/.env`
- `server/src/db/index.ts`（连接池初始化）
- `server/src/db/schema.sql`（DDL 脚本）
- `server/src/modules/auth/auth.service.ts`
- `server/src/modules/auth/auth.controller.ts`
- `server/src/main.ts`

### 2.3 具体实现规格

1. **Docker Compose 配置**
   - 编排官方 `postgres:16-alpine` 镜像，暴露 5432 端口，配置数据卷本地持久化。

2. **初始化 DDL 脚本**
   - 执行已规划的 5 张核心表：`users`、`npc_memories`、`user_skills`、`game_sessions`、`dialogue_logs`。

3. **Hono 鉴权模块实现**
   - `POST /api/auth/register`：接收 `{ email, password, username }`，使用 bcrypt 哈希密码入库，返回 JWT Token。
   - `POST /api/auth/login`：校验凭据，签发有效载荷包含 `{ userId, email }` 的 JWT。
   - 编写 `authMiddleware`：拦截非公开路由，提取解析 Bearer Token。

### 2.4 Phase 2 验收标准

- [ ] `docker compose up -d` 成功启动 PostgreSQL 容器。
- [ ] 运行数据库初始化脚本无报错，5 张表及外键、索引创建完毕。
- [ ] 使用 curl 或 Postman 能成功注册新用户并登录拿到 JWT Token。
- [ ] 携带非法 Token 请求受保护接口返回 HTTP 401。

---

## Phase 3: AI 智能编排与 SSE 流式输出网关 (AI & Streaming)

### 3.1 目标

在服务端实现大模型调用网关，通过 Server-Sent Events (SSE) 将 NPC 台词流式推向前端，并在后端结构化提取语言评估指标。

### 3.2 涉及文件

- `server/src/modules/ai/prompt.template.ts`
- `server/src/modules/ai/llm.client.ts`
- `server/src/routes/chat.ts`
- `src/services/aiService.ts`（客户端改写为接入真实后端）
- `src/hooks/useStreamingChat.ts`

### 3.3 具体实现规格

1. **System Prompt 注入与防越狱**
   - 角色设定：伦敦 Casa Italiana 服务员 Marco。
   - 注入上下文：当前关卡状态、菜单库存状态、玩家专属偏好记忆。
   - 强制原则：永远不破坏角色人设，以自然接话（Recast）替代严厉说教（例如遇到 `I very like pizza` 回复 `Oh, you really like pizza?`）。

2. **双通道输出接口 (`POST /api/chat/stream`)**
   - 保持 HTTP 长连接，响应头设为 `Content-Type: text/event-stream`。
   - 通道 A（打字机台词）：逐 Token 向前端下发 `event: message\ndata: {"chunk": "..."}\n\n`。
   - 通道 B（结构化结算）：在回答生成完毕后，下发 `event: assessment\ndata: {...}\n\n`，包含 `meaningUnderstood`、`grammarAcceptable`、`naturalnessScore`。

3. **调用频率与安全防护**
   - 基于 `user_id` 实现单用户每分钟最高 15 次请求限流，防止脚本刷取 Token 余额。

### 3.4 Phase 3 验收标准

- [ ] 客户端输入英文发给后端，能在 800ms 内收到第一字流式推送，立绘呈现微倾听打字机效果。
- [ ] 输入故意拼写的典型中式英语，AI 服务员能够自然顺承回复，且后台返回了准确的评分数据。
- [ ] 前端代码中完全不包含任何云端大模型的原生 API Key。

---

## Phase 4: 世界记忆存取与关卡结算持久化 (Memory & Persistence)

### 4.1 目标

让游戏具备“世界感”，NPC 能够跨会话持久化记住玩家的饮食偏好与语言习惯，关卡结算数据写入数据库。

### 4.2 涉及文件

- `server/src/modules/memory/memory.service.ts`
- `server/src/modules/skills/skills.service.ts`
- `server/src/routes/scene.ts`
- `src/state/memory.ts`（前端适配器，桥接云端接口）

### 4.3 具体实现规格

1. **场景初始化接口 (`GET /api/scene/init?sceneId=casa_italiana_dinner`)**
   - 查询 `npc_memories` 表，聚合当前玩家与 `waiter_marco`、`emma` 的历史记忆。
   - 在 `game_sessions` 中创建一条新关卡会话记录，返回 `sessionId` 与前置上下文。

2. **关卡结算持久化接口 (`POST /api/scene/settle`)**
   - 接收结算数据：玩家在过程中表现出的偏好（如“不喜欢蘑菇”、“喜欢意面”）。
   - 执行事务写入：
     1. 向 `npc_memories` 插入或更新记忆标签。
     2. 向 `user_skills` 更新 `order_food`、`refuse_politely` 等技能熟练度。
     3. 玩家 `total_active_outputs` 累加本次输入次数。
     4. 标记当前 `game_sessions` 为 `COMPLETED`。

3. **次日/再次进入记忆召回验证**
   - 再次调用 init 接口时，服务员的 Prompt 必须带入上次留存的记忆（如 `Player previously mentioned hating mushrooms`）。

### 4.4 Phase 4 验收标准

- [ ] 玩家第一次点餐表明“讨厌蘑菇”，完成结算退出。
- [ ] 刷新页面重新登录进入场景，服务员 Marco 能主动说出类似：“Welcome back! Still no mushrooms today?”的话。
- [ ] 数据库 `npc_memories` 与 `user_skills` 表中可查到结构化记录。

---

## Phase 5: 全链路联调、2.5D 视听打磨与生产发布 (Polish & Deploy)

### 5.1 目标

补齐音效、立绘表情切换与异常重试，输出可部署的 Docker 容器和生产构建产物。

### 5.2 涉及文件

- `src/components/GameWorld/RestaurantScene.tsx`
- `src/assets/audio/*`（环境音、打字机音效）
- `Dockerfile`（客户端静态部署 Nginx 镜像）
- `server/Dockerfile`（服务端生产镜像）

### 5.3 具体实现规格

1. **2.5D 视差与情绪反馈**
   - 鼠标在 16:9 画布上轻微移动时，背景层与桌面前景产生细微视差偏移（CSS Transform 或 Pixi.js 容器位移）。
   - 根据 AI 返回的文本情绪，服务员立绘在 `neutral`、`smiling`、`puzzled`（困惑）切片间自然平滑过渡。

2. **离线与断网重试兜底**
   - 当大模型服务超时（>10s）或网络中断时，前端对话框展示温和的 NPC 行为（例如：`"Sorry, the restaurant is a bit loud, could you say that again?"`），支持一键重发。

3. **生产环境构建优化**
   - 前端执行 `npm run build`，输出轻量纯静态 SPA 文件。
   - 服务端打包单层轻量 Node.js 镜像，剥离 `devDependencies`。

### 5.4 Phase 5 验收标准

- [ ] 生产容器成功启动，任意多台浏览器同时打开并登录不同账号，对话与记忆数据完全隔离。
- [ ] 整个点餐流程有微弱的餐厅白噪音和打字机音效，打字体验丝滑。
- [ ] 运行性能分析，CPU 占用低，首屏加载在 2 秒内完成。

---

## 编码 Agent 任务分派指令模版 (Prompt Snippet)

当你要让其他模型编写代码时，可以直接复制以下指令发送：

> 请阅读 `docs/DEV_SPEC_PHASED.md` 中关于 **[指定 Phase 编号，如 Phase 1]** 的技术规范。请根据其涉及的文件路径、状态机流转逻辑和数据契约，直接生成或修改对应的生产代码，并确保满足该 Phase 的验收标准。
