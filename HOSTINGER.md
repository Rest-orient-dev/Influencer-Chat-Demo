# 部署到 Hostinger Web App

这个项目是 **Next.js**（Node），请用 hPanel 里的 **Deploy Web App**（不是 WordPress，也不是 Custom PHP）。

仓库根目录是 `Influencer-Chat`，真正的应用在子目录 **`influencer-chat`**。在 Hostinger 里把 Root directory 设成 `influencer-chat`。

## 1. 把代码放到 GitHub

Hostinger 从 GitHub 拉代码。本机提交之后：

1. 在 GitHub 新建一个 **private** 仓库（不要公开，里面有培训内容和学员逻辑）
2. 在项目根目录执行：

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin master
```

## 2. 在 Hostinger 创建 Web App

1. hPanel → **Websites** → **+ Add website**
2. 选 **Deploy Web App**
3. 连接 GitHub，选这个仓库和分支 `master`
4. 配置：

| 项 | 值 |
|---|---|
| Root directory | `influencer-chat` |
| Node.js | **20** 或更高 |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |

Hostinger 会注入 `PORT`，Next 的 `next start` 会自动使用。

## 3. 创建 MySQL 并建表

生产环境必须用数据库，否则用户、对话、评分会在重启后丢失。

1. hPanel → **Databases** → 新建 MySQL 数据库，记下 host / 库名 / 用户 / 密码
2. 用 phpMyAdmin 或远程客户端执行 `influencer-chat/src/server/db/schema.sql` 里的全部 SQL

## 4. 环境变量

在 Web App 的 Environment variables 里添加：

```
DB_HOST=srvXXXX.hstgr.io
DB_PORT=3306
DB_USER=你的数据库用户
DB_PASSWORD=数据库密码
DB_NAME=数据库名
DB_SSL=true
AUTH_SECRET=请换成一长串随机字符
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-haiku-4-5
```

`AUTH_SECRET` 可用：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

没有 `ANTHROPIC_API_KEY` 时聊天和评分会走本地兜底逻辑，质量较差，但仍能跑。

改环境变量后 **Redeploy / Restart**。

## 5. 创建管理员账号

在本机（已安装依赖）生成密码 hash：

```bash
cd influencer-chat
node -e "require('bcryptjs').hash('你的密码',10).then(console.log)"
```

在 MySQL 执行（把邮箱、姓名、hash 换成你的）：

```sql
INSERT INTO users (id, name, email, password_hash, role)
VALUES ('u_admin', 'Manager', 'admin@orient.es', '<刚才生成的hash>', 'admin');
```

学员账号建议登录后台 **Usuarios** 添加，不要再用 `ana@orient.local` 这种仅本地内存账号。

## 6. 上线后第一次使用

1. 打开 Hostinger 给的域名（或绑定自己的域名）
2. 用管理员账号登录
3. 在 **Influencers** 导入 `priced-influencers.json`
4. 在 **Usuarios** 创建学员并分配对话
5. 学员走 Academy → WhatsApp 练习 → Cerrar y evaluar；管理员在 **Informes** 看对话和报告

## 常见问题

- **构建失败**：Root directory 必须是 `influencer-chat`，不是仓库根目录。
- **登录后立刻退出**：检查 `AUTH_SECRET` 是否已设，且重启过应用。
- **学员消失 / 对话丢失**：没配齐 `DB_*`，应用还在用内存。
- **打不开页面**：看 Web App 日志；确认 Start command 是 `npm start`，Node ≥ 20。
