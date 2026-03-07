# OA 流程请求接口规范
本规范定义了在本项目中关联和发起 OA 流程的请求地址，旨在防止joysky-oa-link skill 误用数据库网关地址。
## 接口地址
**禁止**使用 `getPostgrestUrl` 构建 OA 流程地址。必须使用以下固定业务接口：
`https://joygen.jd.com/oa/lcp_agentSkill_login/startOrReStartProcess`