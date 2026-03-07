---
name: workflow-generation
description: |
  当用户需要创建或修改 Autobots / JoyAgent 工作流时，直接调用 MCP 工具 `auto_create_workflow`。
  你不需要访问后端接口或执行复杂流程，只需要把用户当前的自然语言需求作为 `query` 传给该工具。
---

## 触发条件

当出现以下任一情况时，你应该主动考虑使用本 Skill，并调用 MCP 工具 `auto_create_workflow`：

- 用户说：“帮我**创建一个工作流** / **配置 JoyAgent** / **配置 Autobots 工作流**”
- 用户描述一个完整的自动化任务，希望“做成一个工作流/机器人可以重复使用”
- 用户希望“改造/增强现有的 JoyAgent 工作流”的能力和步骤

## 调用规则

- 调用工具 `auto_create_workflow`
- **入参结构**：

```json
{
  "query": "<用户本轮对话中表达的工作流需求，原样或略作润色>"
}
```
