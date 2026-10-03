# 原生 PostgreSQL 接入规格

> 来源：[Google Docs](https://docs.google.com/document/d/1qZU1vMyKrCbrq48t8lDy52PD2XzvG_WpBeSwNbHWvnk/edit?usp=sharing)  
> DDL：`docs/POSTGRES_SCHEMA.sql`  
> 决策：**不依赖 Supabase**，使用官方标准 PostgreSQL，代码 100% 解耦、可私有化部署。

## 为什么选原生 PostgreSQL

- 本地：官方 `postgres` Docker 容器即可。
- 上线：自建云主机 / AWS RDS / 阿里云 RDS / Railway 等，换 `DATABASE_URL` 零改代码。
- 无第三方 `auth.users` 与专有 SDK 绑定；用户认证表自建。

## 核心表（5+1）

| 表 | 用途 |
|----|------|
| `users` | 原生账号（email + password_hash + username） |
| `npc_memories` | NPC 对玩家的偏好 / 口误 / 约定记忆 |
| `user_skills` | A1–B1 技能节点熟练度 |
| `game_sessions` | 关卡会话与结算快照 |
| `dialogue_logs` | 对话审计与语言评估 JSON |

建表：执行 `docs/POSTGRES_SCHEMA.sql`。

## 环境变量 (`server/.env`)

```bash
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/language_game
JWT_SECRET=your_super_secret_jwt_key
PORT=3000
```

## 本地 Docker（Phase 2 启动）

根目录 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: languagegame_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: language_game
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
docker compose up -d
# 然后对容器执行 docs/POSTGRES_SCHEMA.sql
```

## 后端集成建议

- Node.js + Hono
- `pg`（node-postgres）连接池，或 Drizzle ORM
- Phase 2+ 优先实现：JWT 登录、`GET /api/scene/init`、`POST /api/scene/settle`

## Agent 任务指令模版

> 请查看 `docs/POSTGRES_SCHEMA.sql` 与 `docs/DEV_SPEC_PHASED.md`。使用 Node.js + Hono，基于 `pg` 连接池编写后端的数据库操作模块（包含用户 JWT 登录、读取 NPC 记忆的 API `/api/scene/init`、以及关卡结算写回接口 `/api/scene/settle`）。
