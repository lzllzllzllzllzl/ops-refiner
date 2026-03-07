---
name: JAPI-SPEC
description: |
  当用户要求你编写、补全或重构 API 定义时，你需要基于当前应用的代码、已有接口实现和 mock 数据，
  使用 Swagger 2.0 / OpenAPI 2.0 规范生成或更新一份 swagger 文档（JSON 或 YAML）。
  你的目标是：让这份规范可以被前后端、测试同学直接使用，并且尽可能与真实代码保持一致。
---

## Skill 名称

JAPI-SPEC（API 规范生成与维护）

## 触发条件

当满足以下任一情况时，应主动考虑调用本技能：

1. 用户出现类似表述：
   - “帮我写一个接口文档 / API 定义 / swagger 文档 / openapi 文档”
   - “把当前接口整理成 swagger”
   - “根据这段代码生成接口文档”
2. 用户在 PRD / 需求中明确提到要产出 API 文档或 OpenAPI/Swagger 文件。
3. 在多角色/多 Agent 协作流程里，当前阶段是“接口定义 / 契约设计”环节。

如果用户没有显式说“用 swagger/openapi”，但要的是“可给前端/测试直接用的接口文档”，也可以推荐并使用本技能。

## 前置条件

在开始生成规范前，你应该尽量获取以下信息（如果缺失则向用户补问）：

1. **接口所在系统/服务的上下文**
   - 服务名称（例如：用户中心、订单服务）
   - 主要技术栈（Node/Java/Spring/Go 等，仅用于帮助你判断风格，不影响标准）
2. **已有代码或接口实现信息（如有）**
   - 控制器 / 路由 / handler 源码片段
   - DTO / VO / Entity 定义
   - Mock JSON 示例
3. **接口使用场景**
   - 谁在调用（前端、其他服务、第三方）
   - 主要业务目标（例如：“创建订单”、“查询用户信息”）

如果以上信息不完整，你需要通过简洁的问题向用户补齐关键信息，而不是自己想象业务。

## 输出目标

你的产出是 **完整可用的 Swagger 2.0 / OpenAPI 2.0 规范文件**，满足：

1. **格式合法**：能够被 Swagger UI / swagger-codegen / openapi 工具正常解析。
2. **信息完备**：
   - `swagger` / `info` / `paths` / `definitions` 等必需字段齐全
   - 每个接口包含：`summary`、`description`、`parameters`、`responses`、`tags`
3. **与代码一致**：
   - URL、HTTP 方法、必填字段、类型、枚举值尽可能与代码保持一致
   - 对于不确定的字段，要在描述中显式标注“TODO”或“待确认”，避免自信但错误的信息

## 工作流程

### 第一步：梳理接口清单

1. 从用户提供的需求、PRD、代码中识别所有需要暴露的 HTTP 接口。
2. 对每个接口记录：
   - 路径（path）
   - 方法（GET/POST/PUT/DELETE/PATCH 等）
   - 大致用途（1 句话 summary）
3. 将接口按业务维度分组，形成初步的 `tags` 列表（例如：User、Order、Auth）。

### 第二步：分析请求与响应结构

对每个接口，按以下顺序梳理：

1. **请求路径与查询参数**
   - path 参数：写入 `parameters.in = path`，并标记 `required: true`
   - query 参数：写入 `parameters.in = query`，描述其用途与类型
2. **请求体（body）**
   - 如果是 JSON 请求，使用 `in: body` + `schema` 来定义结构
   - 尽量抽取公共结构到 `definitions`，例如 `User`, `Order`, `PageRequest`
3. **响应体（responses）**
   - 至少定义 `200` 响应
   - 如果有统一返回包结构（例如 `{ code, msg, data }`），抽象为公共 definition
   - 对错误码（如 400/401/403/500）给出简单说明即可

### 第三步：构建 Swagger 2.0 文档骨架

按如下结构组织文档（示例为 JSON 结构，YAML 也可以）：

```json
{
  "swagger": "2.0",
  "info": {
    "title": "示例服务 API 文档",
    "version": "1.0.0",
    "description": "根据当前代码与需求自动生成的 Swagger 2.0 规范"
  },
  "basePath": "/api",
  "schemes": ["http", "https"],
  "consumes": ["application/json"],
  "produces": ["application/json"],
  "paths": {},
  "definitions": {}
}
```

在骨架中逐步填充 `paths` 与 `definitions`。

### 第四步：为每个接口补充详细信息

对于每一个 `/path` + `method`：

1. 编写简洁的 `summary` 和更详细的 `description`。
2. 添加 `tags`，让接口在文档中按业务分组。
3. 按以下格式定义参数：

```json
{
  "name": "userId",
  "in": "path",
  "required": true,
  "type": "string",
  "description": "用户 ID"
}
```

4. 对请求/响应中的对象，使用 `$ref` 指向 `definitions` 中的模型，避免重复。

### 第五步：维护 definitions（模型）

1. 所有可复用的结构（请求体、响应体、分页结构、错误结构等）统一放到 `definitions`。
2. 每个 definition 应包含：
   - `type: object`
   - `properties`: 字段名、类型、说明
   - `required`: 必填字段列表（如无法确定，可适度保守）
3. 示例：

```json
"User": {
  "type": "object",
  "properties": {
    "id": { "type": "string", "description": "用户 ID" },
    "name": { "type": "string", "description": "用户名" },
    "email": { "type": "string", "description": "邮箱地址" }
  },
  "required": ["id", "name"]
}
```

## 输出格式要求

1. **默认输出**：一段完整的 Swagger 2.0 JSON 文档（不需要额外解释性文字）。
2. 如用户明确要求 YAML，则输出标准 YAML 格式。
3. 如果文档较长，你可以先给出完整 JSON，再额外用自然语言总结接口列表（可选）。

## 同步代码与规范的一致性

当用户要求“同步代码到 API 文件中”时，你需要：

1. 先根据代码识别真实的接口定义（包括路径、方法、参数、返回结构）。
2. 如果现有 swagger 文档与代码不一致：
   - 优先以 **代码** 为准
   - 在 swagger 中做相应修改，并在 `description` 中简短标注“由代码自动同步”
3. 避免凭空添加代码中不存在的字段或接口。

## 注意事项

1. **不要想象业务**：对于未给出的字段、状态码、枚举值，不要自信编造。如必须填写，请在 `description` 中用“TODO/待确认”标记。
2. **保持兼容性**：如果用户已有部分 swagger 文档，你需要在此基础上增量修改，而不是完全重写（除非用户明确要求重写）。
3. **类型选择**：
   - 金额、ID 建议使用 `string`（避免 JS 精度问题）
   - 分页页码/大小可以使用 `integer`, `format: int32`
4. **命名规范**：字段命名尽量与代码风格一致（camelCase/snake_case），不要自行转换。
5. 如果用户只要“某几个接口”的文档，请只输出对应部分的 `paths` 与相关 `definitions`，不需要把整个系统猜全。
