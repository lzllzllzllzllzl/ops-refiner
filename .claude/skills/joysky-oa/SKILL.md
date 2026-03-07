---
name: joysky-oa
description: |
  OA审批流程生成技能。当用户需要创建OA审批流程时使用，支持根据自然语言描述自动生成审批表单和审批流程。
  触发条件：(1)用户提到"创建审批"、"OA审批"、"审批流程"、"请假审批"、"报销审批"等关键词
  (2)用户描述需要一个包含表单和审批节点的流程
  (3)用户要求生成Sky/JoySky审批流程
---

# JoySky OA审批流程生成

通过MCP工具自动创建OA审批流程，包括表单设计和审批流程设计。

## 前置条件

确保已配置joysky MCP Server，且用户已登录（有有效的Cookie）。

## 工作流程

### 第一步：收集需求信息

从用户描述中提取以下信息：

1. **流程基本信息**
   - 流程名称（如：请假审批、报销审批）
   - 流水号前缀（建议：流程名称拼音首字母大写，如QJSP）
   - 流程联系人ERP和姓名

2. **表单字段**
   - 字段名称
   - 字段类型（见下方支持的字段类型）
   - 是否必填
   - 选项列表（针对下拉框和单选框）

3. **审批节点**
   - 节点名称
   - 审批人类型（指定人员/直属上级）
   - 审批人ERP或上级层级

### 第二步：调用基础设置API

使用 `joysky_save_basic_settings` 工具：

```json
{
  "processDefinitionName": "请假审批",
  "contactUserName": "zhangsan",
  "contactRealName": "张三",
  "followCodePrefix": "QJSP",
  "processDefinitionDescription": "员工请假审批流程"
}
```

**重要**：记录返回的 `processDefinitionId`、`pageCode`、`appId`，后续步骤需要使用。

### 第三步：调用表单设计API

使用 `joysky_save_form` 工具：

```json
{
  "agentId": "上一步返回的appId",
  "pageCode": "上一步返回的pageCode",
  "formFields": [
    { "type": "SelectField", "label": "请假类型", "required": true, "options": ["年假", "事假", "病假", "婚假"] },
    { "type": "DateField", "label": "开始日期", "required": true },
    { "type": "DateField", "label": "结束日期", "required": true },
    { "type": "TextareaField", "label": "请假原因", "required": true }
  ]
}
```

### 第四步：调用流程设计API

使用 `joysky_save_process` 工具：

```json
{
  "processDefinitionId": "第二步返回的processDefinitionId",
  "processDefinitionKey": "第二步返回的processDefinitionKey",
  "processName": "请假审批",
  "approvalNodes": [
    { "name": "直属领导审批", "type": "leader", "leaderLevel": 1, "leaderSource": "starter" },
    { "name": "HR审批", "type": "user", "approverErp": "hr001" }
  ]
}
```

### 第五步：发布流程

使用 `joysky_publish` 工具：

```json
{
  "processDefinitionId": "流程定义ID",
  "pageCode": "页面编码",
  "erp": "当前用户ERP"
}
```

## 支持的字段类型

| 类型 | 说明 | 适用场景 |
|-----|------|---------|
| TextField | 单行文本 | 姓名、标题等短文本 |
| TextareaField | 多行文本 | 原因、描述等长文本 |
| NumberField | 数字输入 | 金额、数量等 |
| SelectField | 下拉单选 | 类型选择（需提供options） |
| RadioField | 单选框组 | 是/否选择（需提供options） |
| DateField | 日期选择 | 单个日期 |
| CascadeDateField | 日期范围 | 开始-结束日期 |
| TimeField | 时间选择 | 具体时间点 |

## 审批节点类型

### 指定审批人（type: "user"）
```json
{
  "name": "财务审批",
  "type": "user",
  "approverErp": "finance001"
}
```

### 直属上级（type: "leader"）
```json
{
  "name": "直属领导审批",
  "type": "leader",
  "leaderLevel": 1,
  "leaderSource": "starter"
}
```

`leaderLevel` 说明：
- 1: 直属上级
- 2: 上级的上级
- 以此类推

`leaderSource` 说明：
- "starter": 申请人的上级
- "specifyNode": 指定节点审批人的上级（需配合specifyNodeId使用）

## 常见审批场景示例

### 请假审批
```
表单字段：
- 请假类型（下拉单选）：年假、事假、病假、婚假、产假
- 开始日期（日期选择）
- 结束日期（日期选择）
- 请假天数（数字输入）
- 请假原因（多行文本）

审批流程：
1. 直属领导审批
2. HR审批（可选）
```

### 报销审批
```
表单字段：
- 报销类型（下拉单选）：差旅费、办公用品、招待费、其他
- 报销金额（数字输入）
- 发生日期（日期选择）
- 报销说明（多行文本）

审批流程：
1. 直属领导审批
2. 财务审批
```

### 加班申请
```
表单字段：
- 加班日期（日期选择）
- 加班时长（数字输入）
- 加班原因（多行文本）

审批流程：
1. 直属领导审批
```

## 输出文件

创建成功后，将以下内容写入项目的 `public/` 目录：

1. `public/schema.json` - 表单Schema，用于前端渲染
2. `public/bpmn.xml` - 流程BPMN，用于流程图渲染
3. `public/config.json` - 配置信息，包含processDefinitionId等

### 文件保存示例

**第二步完成后**，将返回的schema保存到 `public/schema.json`：
```json
{
  "floors": { ... },
  "schemaType": "form",
  "schemaVersion": "1.0.0"
}
```

**第四步完成后**，将返回的bpmnXml保存到 `public/bpmn.xml`。

**每一步完成后**，更新 `public/config.json`：
```json
{
  "processDefinitionId": "xxx",
  "processDefinitionKey": "xxx",
  "pageCode": "xxx",
  "appId": "xxx",
  "deploymentId": "xxx",
  "createdAt": "2025-01-14T12:00:00Z"
}
```

## 错误处理

1. **Cookie未设置**：提示用户登录后重试
2. **API调用失败**：显示具体错误信息，建议用户检查网络或联系管理员
3. **字段类型不支持**：提示用户使用支持的字段类型

## 注意事项

1. 所有API调用需要按顺序执行，后续步骤依赖前置步骤的返回值
2. 发布后的流程将在Sky平台可见，请确认信息无误后再发布
3. 如需修改已发布的流程，需要使用processDefinitionId进行更新
