---
name: joygen-skill-creator
description: JoyGen 技能创建工具。当用户需要创建一个技能来扩展 AI 能力时使用。技能可以包含专业知识、工作流程、脚本或模板资源。触发词：创建技能、新建技能、开发技能、skill。
---

# JoyGen 技能创建指南

在 JoyGen 平台创建技能的标准流程。

## 技能结构

技能是一个文件夹，包含：

```
public/
└── skill-name/
    ├── SKILL.md          # 必需：技能说明文件
    ├── scripts/          # 可选：可执行脚本
    ├── references/       # 可选：参考文档
    └── assets/           # 可选：模板资源
```

### SKILL.md 格式

```markdown
---
name: skill-name
description: 简明描述技能功能和触发条件。包含：(1)做什么 (2)何时触发
---

# 技能标题

## 使用说明

具体的操作指令和流程...
```

## 创建流程

### Step 1: 理解需求

与用户确认：
- 技能要解决什么问题？
- 有哪些典型使用场景？
- 需要什么资源（脚本/文档/模板）？

### Step 2: 创建技能文件

在 `public/` 目录下创建技能文件夹和内容：

```
public/
└── my-skill/
    ├── SKILL.md
    └── (其他资源文件)
```

**SKILL.md 编写要点**：
- `name`: 技能标识，用于 URL（kebab-case）
- `description`: 清晰描述功能和触发条件，这决定技能何时被调用
- Body: 简洁的操作指令，避免冗长解释

**资源文件**：
- `scripts/`: 需要重复执行的代码（Python/Bash）
- `references/`: 需要参考的文档（API文档、Schema等）
- `assets/`: 输出用的模板文件

### Step 3: 发布技能

技能文件创建完成后，调用 MCP 工具发布：

```
使用 publish_skill 工具：
- skillPath: "public/my-skill"
- resourceKey: "my-skill"（可选，默认用 SKILL.md 中的 name）
- categories: ["category1"]（可选）
```

发布成功后：
- 技能市场链接：https://skillsmp.jd.com/skill/{resourceKey}
- 预览配置保存到：public/skillConfig.json

## 示例

### 简单技能示例

用户需求："创建一个生成周报的技能"

1. 创建 `public/weekly-report/SKILL.md`：

```markdown
---
name: weekly-report
description: 周报生成工具。当用户需要生成周报、工作总结时使用。支持按模板格式化输出。
---

# 周报生成

## 使用方法

1. 收集本周工作内容
2. 按以下模板格式化：

### 模板

**本周完成**
- [任务1]
- [任务2]

**下周计划**
- [计划1]

**需要协助**
- [事项]
```

2. 调用 `publish_skill` 发布

### 带脚本的技能示例

用户需求："创建一个图片压缩技能"

1. 创建目录结构：
```
public/image-compressor/
├── SKILL.md
└── scripts/
    └── compress.py
```

2. SKILL.md：
```markdown
---
name: image-compressor
description: 图片压缩工具。当用户需要压缩图片、减小图片体积时使用。
---

# 图片压缩

使用 scripts/compress.py 压缩图片：

\`\`\`bash
python scripts/compress.py input.png output.png --quality 80
\`\`\`
```

3. scripts/compress.py：
```python
from PIL import Image
import argparse

def compress(input_path, output_path, quality=80):
    img = Image.open(input_path)
    img.save(output_path, optimize=True, quality=quality)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--quality", type=int, default=80)
    args = parser.parse_args()
    compress(args.input, args.output, args.quality)
```

4. 调用 `publish_skill` 发布

## 注意事项

1. **技能名称**：使用 kebab-case（如 `my-skill`）
2. **description 很重要**：决定技能何时被触发，要包含功能描述和触发词
3. **保持简洁**：SKILL.md 控制在 500 行以内，详细内容放 references/
4. **测试脚本**：添加的脚本需要实际运行测试
5. **发布前检查**：确保 SKILL.md 有正确的 frontmatter（name + description）
