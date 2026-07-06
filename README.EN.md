# Listing Optimizer Skill (English)

Downstream content asset for `ops-refiner`. Takes SKU copy and produces
deterministic audits + publishable deltas.

Serves the 6 bath-category product lines of **LULULU 家居家装组** on
JD JZ 1P: smart toilet / mass toilet / bathroom vanity /
ceramic hardware / bathtub / general hardware.

## Quick start (3 steps)

1. `python3 -m pip install --user -r requirements.txt`
2. `python3 -m codebase.cli --input tests/sample.json --csv report.csv --json report.json --prompt prompt.txt`
3. Read the three outputs.

## What gets scored

Title * bullets * HTML / plain-text description * images (main + sub) *
required sales attrs * category relevance * search-term completeness.

Each SKU gets a 7-vector score plus a cause+advice list per issue.

## Determinism

Same input -> same scores. No LLM, no network in the rule engine. That's PRD AC-01.

The full acceptance matrix is in `SKILL.md`; the source of truth for rules
is `codebase/catalog_keywords.py`.
