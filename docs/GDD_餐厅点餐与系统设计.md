# Language Game — 餐厅点餐关卡 GDD

> 版本：0.1（脚手架阶段）  
> 目标：通过沉浸式 2.5D 餐厅场景，让玩家用自然英语完成点餐任务。

---

## 1. 产品定位

- **核心玩法**：玩家与 NPC（服务员 / 同伴 Emma）进行英语对话，完成「入座 → 看菜单 → 点餐 → 确认 → 结算」闭环。
- **学习目标**：口语表达自然度、点餐常用短语、礼貌问询与澄清。
- **技术路线**：Vite + React + TypeScript；场景层用 Pixi.js；对话与 UI 用 React；AI 驱动 NPC 回复与任务推进。

---

## 2. 三层界面结构

| 层级 | 名称 | 职责 | 对应模块 |
|------|------|------|----------|
| Layer 1 | Game World | 2.5D 餐厅场景、角色立绘与动画、可点击热点 | `components/GameWorld` |
| Layer 2 | Dialogue | NPC 台词气泡、玩家输入区、Hint | `components/Dialogue` |
| Layer 3 | Feedback | 关卡结算：自然度评分、新短语复盘 | `components/Feedback` |

设计原则：

1. **场景不被 UI 淹没**：对话层贴底，不遮挡关键角色与菜单。
2. **交互物独立**：桌上英文菜单等走 `Interactive`，避免塞进对话框。
3. **结算后置**：任务完成才弹出 Layer 3，避免打断沉浸。

视窗固定 **16:9**，由 `App.tsx` 统一缩放适配。

---

## 3. 角色与场景

### 3.1 角色

| 角色 | 职能 |
|------|------|
| Player | 玩家本人，通过键盘/语音输入英语 |
| Waiter | 主交互 NPC：引导点餐、确认订单、澄清歧义 |
| Emma | 同伴 NPC：给 Hint、示范更自然的说法、闲聊 |

### 3.2 场景资产（`public/assets/`）

- `backgrounds/`：餐厅背景与分层切片（地板 / 桌面 / 前景）
- `characters/`：Emma、服务员立绘与动作切片（idle / talk / gesture）

---

## 4. AI 任务状态机

点餐关卡任务按状态机推进，AI 不直接“判对错”，而是根据玩家话语与当前状态决定：

- 下一句 NPC 回复
- 是否推进状态
- 是否需要澄清 / 纠错 / Hint

```
Arrival
  → Seated
  → BrowsingMenu
  → Ordering
  → Clarifying   ←→ Ordering（歧义时来回）
  → Confirming
  → Completed
       ↓
   Settlement（Layer 3）
```

| 状态 | 玩家目标 | Waiter 行为 |
|------|----------|-------------|
| Arrival | 打招呼、说明有几位 | 欢迎并带位 |
| Seated | 应答坐下后的寒暄 | 递菜单、询问 drink / ready |
| BrowsingMenu | 查看菜单、提问菜品 | 介绍推荐、解释过敏原等 |
| Ordering | 说出想点的菜 | 记录订单、追问数量/份量 |
| Clarifying | 澄清服务员的疑问 | 确认歧义项 |
| Confirming | 确认整单 | 复述订单，等待 yes/no |
| Completed | — | 结束服务，触发结算 |

---

## 5. AI 交互数据约定（摘要）

每次玩家发言后，`aiService` 组装 Prompt，期望模型返回结构化 JSON（详见 `src/types/game.ts`）：

```json
{
  "npcId": "waiter",
  "reply": "Sure! One grilled salmon and a coke. Anything else?",
  "taskState": "ordering",
  "orderDelta": { "add": [{ "itemId": "grilled_salmon", "qty": 1 }] },
  "naturalness": 0.82,
  "hints": ["You can say: \"I'd like the grilled salmon, please.\""],
  "phrasesTaught": ["I'd like ...", "Anything else?"],
  "emotion": "friendly",
  "advance": true
}
```

开发阶段默认走 `mockAiService`，避免频繁消耗 Token。

---

## 6. 记忆与能力模型

持久化到 LocalStorage（`state/memory.ts`）：

- **NPC 记忆**：本关已点菜品、玩家偏好、上次失败点
- **玩家能力**：自然度均值、已掌握短语、弱点标签（如数量表达、礼貌用语）

全局运行时状态（当前场景、任务进度、对话历史）放在 `state/useGameStore.ts`。

---

## 7. 菜单与点餐规则（MVP）

- 桌上可打开英文菜单（`MenuModal`）
- 菜品含：名称、简短描述、价格、过敏标签
- 订单需至少 1 主食 + 可选饮品
- Confirming 阶段服务员复述；玩家肯定后进入 Completed

---

## 8. 结算面板（Layer 3）

`SettlementModal` 展示：

1. 总体自然度分数
2. 本关新学 / 强化短语列表
3. 一两条可改进建议（基于 Clarifying 次数与 Hint 次数）
4. 「再玩一次」/ 「下一关」（后续扩展）

---

## 9. 里程碑

| 阶段 | 交付 |
|------|------|
| M0 | 目录脚手架 + GDD + 类型定义 |
| M1 | 16:9 视窗 + 静态餐厅场景 + 对话框壳 |
| M2 | Mock AI 状态机跑通点餐闭环 |
| M3 | 接真实大模型 API + 结算面板 |
| M4 | Emma Hint、语音输入、资产动画 |

---

## 10. 非目标（当前不做）

- 多人联机
- 完整 RPG 地图切换
- 真实支付 / 账号体系
- 复杂物理与 3D 建模
