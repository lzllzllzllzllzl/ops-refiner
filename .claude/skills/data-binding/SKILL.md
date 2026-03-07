---
name: data-binding
description: Encapsulates business logic using React Query and binds data to UI components. Use this to generate hooks and integrate them with components like ProTable or Forms.
version: 1.0.0
triggers:
  - 逻辑层封装
  - UI 绑定
  - React Query 封装
  - 组件数据对接
---

# Data Binding Skill

> **Goal**: Bridge the gap between raw data services and UI components by encapsulating logic in React Query hooks and managing component state binding.

---

## 🛠 Capabilities

1.  **Logic Encapsulation**: Wrap data fetching (Query) and modification (Mutation) logic using `React Query` to handle caching, auto-refresh, and state management.
2.  **UI Binding**: Connect encapsulated Hooks with UI components (e.g., ProTable, Form), handling Loading, Error, and Data states.
3.  **Feedback Management**: Manage interactive feedback such as loading spinners, success messages, and error alerts.

---

## 📋 Execution Steps

### Step 1: Logic Layer Implementation (Create Hooks)

1.  **Create Hook File**: Create or update custom Hooks in `src/hooks/` (e.g., `useProductList.ts`).
2.  **React Query Integration**: MUST use `@tanstack/react-query`.
    - **Query**: Use `useQuery` for fetching data.
    - **Mutation**: Use `useMutation` for modifying data, and ensure `invalidateQueries` is called on success.
3.  **Data Transformation**: Handle data unpacking in the `select` property of the Hook to ensure components receive clean data.

### Step 2: UI Binding (Integrate with Components)

1.  **Integrate**: Import and use the Hook in UI components.
2.  **State Mapping**:
    - `isLoading` -> Loading Spinner / Skeleton / Table `loading` prop
    - `data` -> Table `dataSource` / Form `initialValues`
    - `error` -> Error Message / Alert
3.  **Interactive Feedback**:
    - Show loading state when submitting forms.
    - Display Success Message and close Modal/Drawer (if applicable) upon successful operation.

### Step 3: Environment Setup (CRITICAL)

1.  **Check Entry File**: Open `src/index.tsx` or `App.tsx`.
2.  **Inject Provider**: You **MUST** wrap the application (or the root component being modified) with `<QueryClientProvider client={queryClient}>`.
3.  **Verify**: Ensure `new QueryClient()` is instantiated outside the component render cycle.

---

## 📝 Code Templates

### 1. React Query Hook Template

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductList, createProduct, IProduct } from '@/services/product';
import { message } from '@jdei/antd'; // Use project-specific component library

// Query Hook
export const useProductList = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['products', page, pageSize], // Dependencies in key
    queryFn: () => getProductList(page, pageSize),
    // Core: Unpack IApiResponse here, so component focuses on data only
    select: (response) => {
        // Return structure based on component needs (e.g., { data, total, success } for ProTable)
        return response.data || [];
    },
    // Keep previous data to prevent flickering during pagination
    placeholderData: (previousData) => previousData,
  });
};

// Mutation Hook
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      message.success('Created successfully');
      // Core: Auto-refresh list after success
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      message.error(`Creation failed: ${error.message}`);
    }
  });
};
```

### 2. Component Binding Example (ProTable)

```typescript
import { ProTable } from '@ant-design/pro-components';
import { useProductList } from '@/hooks/useProductList';
import { useState } from 'react';

export const ProductList: React.FC = () => {
  // 1. Call Hook
  // Note: Parameter changes automatically trigger re-fetch
  const [params, setParams] = useState({ page: 1, pageSize: 10 });
  const { data, isLoading, isFetching } = useProductList(params.page, params.pageSize);

  return (
    <ProTable
      // 2. Bind State
      loading={isLoading || isFetching}
      dataSource={data?.list || []} // Assuming data structure has list

      // 3. Handle Pagination
      pagination={{
        current: params.page,
        pageSize: params.pageSize,
        total: data?.total || 0,
        onChange: (page, pageSize) => setParams({ page, pageSize }),
      }}
      // ...
    />
  );
};
```

### 3. Entry Configuration Template (CRITICAL)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

// Create a client
const queryClient = new QueryClient();

// Wrap your app
const Root = () => (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

---

## ⚠️ Important Notes

- **Completeness**: Delivered code must include full data interaction logic.
- **Robustness**: Fully utilize React Query states (`isLoading`, `isError`) for UI feedback.
- **Consistency**: Use `@jdei/antd` and `@ant-design/pro-components`.
- **Environment**: ALWAYS ensure the component is wrapped in a `<QueryClientProvider>` in the application root (e.g., `src/index.tsx` or `App.tsx`). If creating a standalone demo or new entry point, you MUST include the provider setup.
