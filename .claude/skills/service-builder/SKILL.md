---
name: service-builder
description: Unified orchestrator for backend data services. Automatically routes code generation to either JoyTable (PostgREST Fetch) or Supabase (SDK) based on project detection.
version: 3.1.0
triggers:
  - API 生成
  - Data Model 变更
  - Service 生成
---

# Data Service Orchestrator Skill

> **Goal**: Provide a unified interface for generating backend data services, automatically routing to the correct implementation strategy (JoyTable vs Supabase).

---

## 🚦 Strategy Selection Logic

Before generating any code, determine the **Target Environment**:

### Option A: JoyTable Environment (Default for Enterprise/Internal)
**Indicators**:
- Presence of `mcp__joytable_*` tools.
- Requirement for `Resource ID`.
- Users mentions "JoyTable", "Gateway", or "Internal System".

**👉 Action**: Delegate to **`postrest-fetch-builder`**
- **Reference**: `.claude/skills/postrest-builder/SKILL.md`
- **Key Features**: Native `fetch`, Manual URL construction, `appendix` params, JoyTable Gateway authentication.

### Option B: Supabase Environment (Standard)
**Indicators**:
- Presence of `@supabase/supabase-js` in `package.json`.
- Users mentions "Supabase", "Public Cloud", "Personal Project".

**👉 Action**: Delegate to **`supabase-client-builder`**
- **Reference**: `.claude/skills/supabase-builder/SKILL.md`
- **Key Features**: Official SDK, `createClient`, Type-safe methods.

---

## 🛠 Execution Workflows

### Workflow A: JoyTable Service Generation

1.  **Prerequisite Check**:
    - Verify `services/index.ts` exists.
    - If missing, **Execute Initialization Sequence (Strict Order)**:
        1. **Retrieve Template**: First, read **`postrest-builder` (Section 15.1)** to get the "Client Setup"

2.  **Service Code Generation**:
    - **Read**: `.claude/skills/postrest-builder/SKILL.md`.
    - **Generate**: TypeScript service files using the **JoyTable Gateway + React Query** template.
    - **Constraint**: MUST use `getPostgrestUrl` and raw `fetch` with `URLSearchParams`.

### Workflow B: Supabase Service Generation

1.  **Prerequisite Check**:
    - Verify `@supabase/supabase-js` is installed.
    - Verify `src/utils/supabase.ts` (or similar) exists and initializes the client.
    - If missing, generate the "Setup & Initialization" code from **`supabase-builder` (Section 1)**.

2.  **Service Code Generation**:
    - **Read**: `.claude/skills/supabase-builder/SKILL.md`.
    - **Generate**: TypeScript service files using the **CRUD Patterns** and **React Query Integration** templates.
    - **Constraint**: MUST use `supabase.from('table').select(...)` syntax.

---

## 📝 Common Requirements (All Strategies)

Regardless of the underlying strategy, all generated services must:

1.  **Type Safety**: Always define TypeScript interfaces for data models (snake_case for DB columns).
2.  **React Query**: Wrap data fetching logic in `useQuery` / `useMutation` hooks for state management.
3.  **Error Handling**: All async operations must have `try/catch` blocks (or handle errors in the promise chain) and return clean errors to the UI.
4.  **Separation of Concerns**:
    - **Types**: `src/types/index.ts` or top of service file.
    - **API Logic**: `src/services/xxx.ts`.
    - **Components**: Import hooks from services, never call API directly.

## 🔄 Integration & Sync Policy (CRITICAL)

When modifying data models or backend services, you **MUST** ensure full-stack consistency.

### 1. Advanced Query Support
Generated "List/Search" APIs must **NEVER** return all data without filtering capabilities.
- **Requirement**: Accept an optional `params` object in the service method.
- **Implementation**: Map `params` fields to backend-specific operators (e.g., `ilike` for strings, `eq` for IDs/Enums).
- **Example**: `getUserList({ name: 'John' })` -> `name=ilike.*John*`

### 2. Frontend Component Synchronization
After updating a service (e.g., adding a field), you MUST check and update:
- **ProTable/Lists**: Add the new column to `columns` definition.
- **Search Forms**: Enable filtering for the new field if applicable (pass to `request`).
- **Create/Edit Forms**: Add the input field (e.g., `ProFormText`) to the form.
- **Type Definitions**: Ensure the frontend `interface` matches the new backend response.

---

## 🤖 Prompt Snippet for Agents

```text
To generate service code:
1. Identify if the target is JoyTable or Supabase.
2. Read the corresponding SKILL.md file (postrest-builder or supabase-builder).
3. Follow the specific templates in that file strictly.
4. Do not mix patterns (e.g., do not use supabase-js syntax in a JoyTable project).
```
