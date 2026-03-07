---
name: postgrest-fetch-builder
description: Generate deterministic, PostgREST-compatible fetch request code (JavaScript / TypeScript)
  from structured query intent. This skill enforces strict operator mapping, prevents
  SQL generation, and guarantees safe, predictable HTTP-based data access for
  PostgREST and Supabase-style APIs。
version: 2.1.0
triggers:
  - PostgREST
  - API
---


# Claude Skill: PostgREST Fetch Builder

> **Goal**: Provide Claude / Agents with a deterministic skill to **generate PostgREST-compatible fetch request code (JavaScript / TypeScript)**.  
> This skill avoids SQL entirely and is suitable for MCP, Agent Tool Calling, and AI-native data access.

---

## 1. One-line Definition

**PostgREST Fetch Builder Skill**

> Converts structured query intent (or an IR derived from natural language) into **safe, deterministic HTTP fetch code** for PostgREST APIs.

---

## 2. Design Principles (Critical)

### 2.1 Determinism
- All outputs must be **fully deterministic HTTP requests**
- Query parameters map 1:1 to SQL semantics
- No inference about database schema beyond provided input

### 2.2 Safety
- ❌ Never generate SQL
- ❌ Never concatenate SQL strings
- ❌ Never generate non-PostgREST parameters

### 2.3 Agent-Friendly
- Structured JSON input
- Runnable JS / TS output
- Suitable for Tool Calling and MCP

---

## 3. Skill Metadata

```yaml
name: postgrest_fetch_builder
description: |
  Generate deterministic fetch request code for PostgREST APIs.
  Convert structured query intent into safe HTTP requests using PostgREST query parameters.
  Never generate SQL.
```

---

## 4. Skill Input Schema

```json
{
  "baseUrl": "string",
  "resource": "string",
  "method": "GET | POST | PATCH | DELETE",
  "schema": "string (optional)",
  "select": ["string"],
  "filters": [
    {
      "field": "string",
      "op": "eq | neq | gt | gte | lt | lte | like | ilike | in | is.null",
      "value": "string | number | boolean | array"
    }
  ],
  "order": {
    "field": "string",
    "direction": "asc | desc"
  },
  "limit": "number",
  "offset": "number",
  "body": "object"
}
```

---

## 5. Field Semantics (For LLMs)

| Field | Meaning |
|------|--------|
| baseUrl | PostgREST service base URL |
| resource | Table or view name |
| schema | Optional schema (e.g. `app.users`) |
| method | HTTP method |
| select | Columns to return |
| filters | WHERE conditions using PostgREST operators |
| order | Sorting rule |
| limit | Max rows |
| offset | Pagination offset |
| body | Request body for write operations |

---

## 6. PostgREST Operator Mapping

| Operator | SQL Equivalent |
|---------|----------------|
| eq | = |
| neq | != |
| gt | > |
| gte | >= |
| lt | < |
| lte | <= |
| like | LIKE |
| ilike | ILIKE |
| in | IN |
| is.null | IS NULL |

---

## 7. Hard Rules (Must Follow)

```text
1. Only generate PostgREST-compatible query parameters
2. Never generate raw SQL
3. All filters must use PostgREST operators
4. GET requests must not include a request body
5. POST / PATCH requests must include a JSON body
6. Output must be valid JavaScript or TypeScript
```

---

## 8. URL Construction Rules

### 8.1 Resource Path

```text
resourcePath = schema ? `${schema}.${resource}` : resource
```

### 8.2 Full URL

```text
${baseUrl}/${resourcePath}
```

---

## 9. Filter → Query Parameter Conversion

### 9.1 Basic Comparison

```json
{ "field": "age", "op": "gte", "value": 18 }
```

```text
age=gte.18
```

---

### 9.2 IN Operator

```json
{ "field": "id", "op": "in", "value": [1,2,3] }
```

```text
id=in.(1,2,3)
```

---

### 9.3 IS NULL

```json
{ "field": "deleted_at", "op": "is.null" }
```

```text
deleted_at=is.null
```

---

## 10. Output Code Template (TypeScript)

```ts
async function request() {
  const url = new URL('https://api.example.com/resource')

  // Query parameters
  url.searchParams.set('select', 'id,name')
  url.searchParams.set('status', 'eq.active')

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }

  return res.json()
}
```

---

## 11. Few-shot Examples

### Example 1: GET Query

**Input**
```json
{
  "baseUrl": "https://api.example.com",
  "resource": "users",
  "method": "GET",
  "select": ["id", "name"],
  "filters": [
    { "field": "status", "op": "eq", "value": "active" }
  ],
  "order": { "field": "created_at", "direction": "desc" },
  "limit": 10
}
```

**Output**
```ts
async function fetchUsers() {
  const url = new URL('https://api.example.com/users')

  url.searchParams.set('select', 'id,name')
  url.searchParams.set('status', 'eq.active')
  url.searchParams.set('order', 'created_at.desc')
  url.searchParams.set('limit', '10')

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  })

  return res.json()
}
```

---

### Example 2: PATCH Update

**Input**
```json
{
  "baseUrl": "https://api.example.com",
  "resource": "users",
  "method": "PATCH",
  "filters": [
    { "field": "id", "op": "eq", "value": 10 }
  ],
  "body": {
    "status": "inactive"
  }
}
```

**Output**
```ts
async function updateUser() {
  const url = new URL('https://api.example.com/users')
  url.searchParams.set('id', 'eq.10')

  const res = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ status: 'inactive' })
  })

  return res.json()
}
```

---

## 12. Recommended Agent Prompt Snippet

```text
You are not allowed to generate SQL.
You must use the postgrest_fetch_builder skill for all data access.
All filters must be expressed using PostgREST operators.
```

---

## 13. One-line Memory (For LLMs)

> **PostgREST Fetch Builder Skill = Structured input → Safe, deterministic HTTP data access code**

---

## 14. Use Cases

- Claude Skills
- MCP Servers
- AI Agents with Tool Calling
- Low-code / No-code platforms
- Natural language → data access pipelines

---

## 15. Production Templates

### 15.1 JoyTable Gateway + React Query (TypeScript)

**Description**:
Uses a custom gateway wrapper for PostgREST, integrates with React Query for state management.
Required for JoyTable/Supabase integration in this project.

**Client Setup (`services/index.ts`)**:


```typescript
// 配置说明：
// [INSTRUCTION] Set PROJECT_ID to the root 'id' from package.json (NOT component.id). Remove this comment line.
const PROJECT_ID = 'REPLACE_WITH_PACKAGE_JSON_ROOT_ID'; 

// 构建基础 URL
const BASE_URL = `//opengate-sff.jd.com/api?v=1.0&appId=XUZYDF0EUOJ1MT9N3WFV&api=dsm.joygen.repo.openapi.postgrest_new&appendix=`;

// 导出 URL 构建辅助函数
// 规避 URLSearchParams 对 appendix 中斜杠的转义问题
export const getPostgrestUrl = (tableName: string): string => {
  return `${BASE_URL}`+encodeURIComponent(`/${PROJECT_ID}/${tableName}`);
};

// 通用请求函数
export const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'dsm-platform': 'erp',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // ⭐ 关键：携带 Cookie
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Request failed:', url, res.status, errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || errorJson.msg || '请求失败');
    } catch (e: any) {
      if (e.message && e.message !== 'Unexpected end of JSON input') {
        throw e;
      }
      throw new Error(errorText || '请求失败');
    }
  }

  // 处理 204 No Content (常见于 Update/Delete)
  if (res.status === 204) {
    return {} as T;
  }

  const response = await res.json();
  
  if(!response.success){
    const msg= response.msg;
    console.error('Request failed:', url, res.status, response);
    try {
      throw new Error(msg || '请求失败');
    } catch (e: any) {
      throw new Error(msg || '请求失败');
    }
  }
  return response.data;
};
```

**Service Implementation**:

```typescript
import { request, getPostgrestUrl } from './index';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// [1] Define Types (Table Schema)
export interface IOrder {
  id: number;
  order_no: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
}

const TABLE_NAME = 'orders';

// [2] READ Implementation (with Advanced Filtering)
export const getOrderList = async (
  // Support pagination + business filters
  params: {
    page?: number;
    pageSize?: number;
    userId?: string;
    status?: string;
    orderNo?: string;
  } = {}
): Promise<IOrder[]> => {
  try {
    const { page = 1, pageSize = 10, userId, status, orderNo } = params;
    const baseUrl = getPostgrestUrl(TABLE_NAME);
    const offset = (page - 1) * pageSize;
    const queryParams = new URLSearchParams();

    // 1. Basic PostgREST Params
    queryParams.set('select', '*');
    queryParams.set('order', 'created_at.desc');
    queryParams.set('limit', String(pageSize));
    queryParams.set('offset', String(offset));

    // 2. Dynamic Business Filters
    if (userId) {
      queryParams.set('user_id', `eq.${userId}`); // Exact match
    }
    if (status) {
      queryParams.set('status', `eq.${status}`); // Enum match
    }
    if (orderNo) {
      queryParams.set('order_no', `ilike.*${orderNo}*`); // Fuzzy search
    }

    const url = baseUrl + encodeURIComponent(`?${queryParams.toString()}`);

    return request<IOrder[]>(url, {
      method: 'GET',
    });
  } catch (err: any) {
    console.error(`Fetch error [${TABLE_NAME}]:`, err);
    throw err;
  }
};

// [2.1] READ Hook
export const useOrderList = (params: Parameters<typeof getOrderList>[0]) => {
  return useQuery({
    queryKey: [TABLE_NAME, params],
    queryFn: () => getOrderList(params),
    keepPreviousData: true,
  });
};

// [3] WRITE Implementation (Create)
export const createOrder = async (data: Partial<IOrder>): Promise<IOrder> => {
  try {
    const url = getPostgrestUrl(TABLE_NAME);

    const res = await request<IOrder[]>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res && res.length > 0) {
      return res[0];
    }
    throw new Error('创建失败');
  } catch (err: any) {
    console.error(`Create error [${TABLE_NAME}]:`, err);
    throw err;
  }
};

// [4] UPDATE Implementation
export const updateOrderStatus = async (id: number, status: string): Promise<IOrder> => {
  try {
    const baseUrl = getPostgrestUrl(TABLE_NAME);
    const params = new URLSearchParams();

    // Filter for update
    params.set('id', `eq.${id}`);

    const url = baseUrl+encodeURIComponent(`?${params.toString()}`);

    const res = await request<IOrder[]>(url, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (res && res.length > 0) {
      return res[0];
    }
    throw new Error('更新失败');
  } catch (err: any) {
    console.error(`Update error [${TABLE_NAME}]:`, err);
    throw err;
  }
};
```

