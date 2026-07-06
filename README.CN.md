# Listing 规格优化 Skill（中文说明）

本项目是 `ops-refiner` 生态下的 **下游内容资产**：

- `ops-refiner` 负责生成主图 Prompt、精细化标题 / 卖点；
- 本 Skill 接收商详内容（标题、五点、富文本、图片、销售属性、搜索项），
  输出 **可发布清单 + 操作 Delta**。

服务对象是 **LULULU 家居家装组** 在京东家装（JZ）开放平台自营的 6 条卫浴
产品线：智能智能马桶 / 普通马桶 / 浴室柜 / 陶瓷五金 / 浴缸 / 通用挂件。

## 3 步上手

1. 装依赖：`python3 -m pip install --user -r requirements.txt`
2. 跑样例：
   ```bash
   python3 -m codebase.cli --input tests/sample.json --csv report.csv --json report.json --prompt prompt.txt
   ```
3. 看结果：
   - 操作读 `prompt.txt`
   - 运营看 `report.csv`
   - 自动化看 `report.json`

## AC 验收表

| AC  | 用户故事 | 测试 |
|-----|---------|------|
| 01  | 幂等评分 | `test_inventory_idempotent` |
| 02  | 非法标题 / 违禁词 / 超长标题标记 P0 | `test_title_illegal_chars_and_length` |
| 03  | 干净标题直接通过 | `test_title_clean_passes` |
| 04  | 五点数量与长度 | `test_bullet_count_and_length` |
| 05  | 描述纯文本 >= 200 或富文本标签 >= 3 | `test_desc_html_or_long_text` |
| 06  | 图片主图 + 辅图规范 | `test_image_rules` |
| 07  | 必填销售属性 | `test_required_attrs` |
| 08  | 类目相关性 | `test_relevance_rule` |
| 09  | 搜索项完整性 | `test_search_fields` |
| 10  | 总体摘要字段 | `test_summary_fields` |
| 11  | 每个 SKU 的摘要段 | `test_prompt_text_has_summary_per_sku` |
| 12  | 每条 P0/P1 含原因 + 建议 | `test_prompt_text_has_advice` |
| 13  | 行业参数表不被误伤 | `test_desc_does_not_flag_param_tables` |
| 14~15 | CSV / JSON 结构 | `test_csv_shape_and_json_shape` |
| 16  | SKILL.md 含新手引导 | `test_skill_md_has_quickstart` |

## 规则来源

所有类目 / 产品线词表 / 必填销售属性在 `codebase/catalog_keywords.py`，
是唯一真源，改规则只动这一个文件。

## 路标

- **M1**（本期）确定性评测 + CSV + JSON + prompt，AC 全绿。
- **M2** 拷贝推荐；
- **M3** JZ Open API / Excel 真数接入，支持千 SKU。
