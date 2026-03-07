---
name: joysky-oa-link
description: |
  关联OA审批流程生成技能。当用户需要关联OA审批流程时使用，支持根据自然语言描述自动关联到OA审批流程。
  触发条件：(1)用户提到"关联审批"、"关联OA" 等关键词
---

# 关联 JoySky OA  流程

通过MCP工具自动关联OA审批流程，并完成相关代码的生产

## 前置条件

确保已配置joysky MCP Server，且用户已登录（有有效的Cookie）。

## 工作流程

### 第一步：收集需求信息

从用户描述中提取以下信息：

1. **关联的OA信息**

   - 关联的OA 流程id 保存到processDefinitionKey

### 第二步：调用基础设置API

使用 `joysky_get_start_process_params` 工具：

```json
{
  "processDefinitionKey": "",  //从第一步收集到的processDefinitionKey
  "requestKey": "" //自动生成，格式参考REQ-20260115-000001
}
```

**重要**：记录返回的 `processDefinitionKey`、`processDefinitionId`、`appId`，、`tenantId`，`formModelList` 后续步骤需要使用。

### 第三步：表单适配与流程启动

在完成第二步并成功调用基础设置 API 后，需要基于返回结果对表单进行适配，并在表单提交时触发流程启动。

---

#### 3.1 表单模型适配

使用第二步返回的 `formModelList` 作为表单结构定义来源，对当前页面表单进行动态适配，主要包括：

- 根据 `formModelList` 渲染表单字段（文本、日期、下拉等）
- 保持字段 `fieldCode` / `pageCode` 与后端模型一致
- 确保表单数据可按字段原始 key 进行收集

其中：

- `formBaseKey` 用于标识当前表单页面
- `pageCode` 通常等于 `formBaseKey`，需在提交数据中保持一致

---

#### 3.2 表单数据组装（formDataModel）

在用户完成表单填写并点击提交后，需要将表单内容整理为 `formDataModel`，其格式要求如下：

- 类型：**JSON 字符串**
- 结构说明：
  - `pageCode`：表单页面标识，对应 `formBaseKey`
  - `param`：表单字段键值对，key 为字段 code，value 为用户填写的值

**关键关联逻辑**：
- 用户提交表单后，将表单内容按照 `formModelList` (步骤二返回) 中字段的 `fieldName` 和 `fieldComment` 进行关联。
- 使用 `fieldComment` (中文名称) 来匹配前端表单字段。
- 使用 `fieldName` 作为最终提交数据 `param` 中的 key。
- 对应前端表单字段的值作为 value。

示例结构：

```json
{
  "pageCode": "",
  "param": {
    "TextField_ilyv6j4rzon": "示例表单",
    "TextareaField_td4j9whpcgb": "请假原因",
    "DateField_dx1jju00eux": "2026-01-15 15:57:55",
    "DateField_u7nhderqds8": "2026-01-16 15:57:55",
    "SelectField_9e8vlvdcx86": "年假",
    "SelectField_9e8vlvdcx86_bak": "年假"
  }
}
```

---

#### 3.3 调用流程启动接口

表单提交完成后，前端需调用流程启动接口:POST `http://pre.joysky-gateway.jd.com/lcp_agentSkill_login/startOrReStartProcess`

请求参数示例如下
```json
{
  "processDefinitionKey": "",
  "processDefinitionId": "",
  "businessKey": "biz_20260115_0001", //按照这个格式
  "sourceCode": "frontend-gateway",
  "formDataModel": "", 
  "formBaseKey": "",
  "appId": "",
  "tenantId": "CN.JD.GROUP",
  "language": "zh_CN",
  "appCode": "frontend-gateway",
  "secret": "5253395e4d844458bc72a1ca5ab36b50"
}
``` 
其中 processDefinitionKey，processDefinitionId，formBaseKey，appId 都从上下文中获取，formDataModel为第二部收集的页面表单

---