# Listing Optimizer Skill

Downstream content asset for `ops-refiner`. Scores every JD bath-category
listing against a publishable, repeatable checklist and produces:

- `report.csv` for operators
- `report.json` for automation
- operator prompt text for copywriters

This skill follows the "delete, what stays is gold" philosophy: in M1 it
**only diagnoses** -- never rewrites -- so rules are always reversible.

## Quick start (3 steps)

1. Install dev deps (runtime itself uses only the stdlib):

   ```bash
   cd /Users/linzhili/Documents/Codex/2026-07-06/7-4-md-codex-md-token/outputs
   python3 -m pip install --user -r requirements.txt
   ```

2. Run the bundled sample end-to-end:

   ```bash
   python3 -m codebase.cli --input tests/sample.json \
       --csv report.csv --json report.json --prompt prompt.txt
   ```

3. Read the result:

   - human view -- `cat prompt.txt`
   - operator -- `open report.csv`
   - automation -- `cat report.json | python3 -m json.tool`

All three files come from one deterministic pass over the 25-SKU sample.

## Layout

```
codebase/                     # Python package: one module per responsibility
__init__.py
catalog_keywords.py           # centralised product-line keyword & attribute expectations
scoring.py                    # 7 deterministic scoring vectors + issue emission
prompt.py                     # operator-facing rendering (cause + advice)
inventory.py                  # local JSON loader (deterministic for M1)
pipeline.py                   # orchestrator: run/to_csv/to_dict/prompt_text
cli.py                        # python -m codebase.cli ...
tests/
sample.json                   # 25 SKU front-catalog inventory
test_skill.py                 # 16 acceptance tests (PRD AC-01..AC-16)
.github/workflows/ci.yml      # pytest on push/pull_request
requirements.txt
PRD.md
README.EN.md
README.CN.md
```

## Acceptance matrix

| AC   | Story | What it checks |
|------|-------|----------------|
| 01   | A1    | idempotent scoring |
| 02   | A2.1  | illegal / promo-violation / length titles flagged P0 |
| 03   | A2.1  | clean title passes |
| 04   | A2.2  | bullet count + length |
| 05   | A2.3  | description plain >= 200 OR rich tags >= 3 |
| 06   | A2.4  | main + sub-image rules |
| 07   | A2.5  | missing required sales attrs |
| 08   | A2.6  | category relevance |
| 09   | A2.7  | search-term completeness |
| 10   | A3    | summary report |
| 11   | B1    | per-SKU summary paragraph |
| 12   | B2    | cause + advice for P0/P1 |
| 13   | C1    | desc boilerplate not flagged |
| 14-15| D1    | CSV/JSON shapes |
| 16   | E1    | SKILL.md quick-start section |

## Rules source of truth

`codebase/catalog_keywords.py`  holds the full set of per-catalog keyword
expectations and required-attribute (`expect_attrs`) lists. When you need to
adjust rules, change that file only.

## How to extend

- Add new `FRONT_CATALOGS` entries in `catalog_keywords.py`.
- Add or tune thresholds in `score_*` functions inside `scoring.py`.
- Add a new AC in `tests/test_skill.py` mirroring the PRD's AC table.
- Re-run `pytest -q`; stay at 100% pass before opening the next milestone.

## Milestones

- **M1 (this build)** -- deterministic scoring + CSV/JSON + prompt text, all 16 ACs green.
- **M2** -- propose rewrites for each P0/P1.
- **M3** -- live JZ Open API / Excel ingestion at thousand-SKU scale.

## Safety

- no network access from the scoring path
- no secrets on disk
- no LLM invocation in M1 (deterministic only)
