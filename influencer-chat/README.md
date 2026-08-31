## MVP：Orient Influencer Training Chat

这是一个内部培训用的 Web 应用：
- 类 WhatsApp 界面：左侧会话列表（同一用户可新增“新一轮合作”），右侧西班牙语对话
- 结束对话后生成报告：语法/报价合理性/谈判与职业度/目标完成度（当前 MVP 为 mock 评分逻辑，后续可接 Claude）
- 管理员：可导入 Influencer 数据（JSON 数组）并查看所有学员评分报告

## 本地运行

```bash
npm run dev
```

本地 fallback 登录：
- 管理员邮箱：`admin@orient.local`
- 密码：`123456`

## Hostinger Web App

完整步骤见仓库根目录 **[HOSTINGER.md](../HOSTINGER.md)**。要点：用 **Deploy Web App**（不是 WordPress），Root directory 设为 `influencer-chat`，必须配置 MySQL + `AUTH_SECRET`。

### 1) 建表

使用 `src/server/db/schema.sql` 里的 SQL 在你的 Hostinger MySQL 上创建表。

### 2) 配置环境变量

在 Hostinger 的 Node.js Web App 配置中设置：
- `DB_HOST`（Remote MySQL 的 hostname，例如 `srvXXXX.hstgr.io`）
- `DB_PORT`（通常 3306，可不填）
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `AUTH_SECRET`（用于签发 JWT 的密钥，务必配置）

可选：
- `DB_SSL=true`（如你的 MySQL 需要 SSL）

### 3) 创建管理员账号

你的数据库 `users` 表需要 `password_hash`。你可以先用下面命令生成 bcrypt hash：

```bash
node -e \"const bcrypt=require('bcryptjs'); bcrypt.hash('你的密码',10).then(console.log)\" 
```

然后执行类似 SQL（示例）：

```sql
INSERT INTO users (id, name, email, password_hash, role)
VALUES ('u_admin', 'Manager', 'admin@yourcompany.com', '<hash>', 'admin');
```

### 4) 登录与使用

部署完成后进入站点：
- 使用你在数据库里创建的管理员账号登录
- 先通过管理员导入 Influencer JSON
- 学员开始对话 -> 结束并评分 -> 管理员查看报告
