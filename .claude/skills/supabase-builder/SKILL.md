---
name: supabase-client-builder
description: Generate production-ready, type-safe Supabase client code using @supabase/supabase-js. Includes patterns for initialization, CRUD operations, and realtime subscriptions.
version: 1.0.0
triggers:
  - Supabase Client
  - supabase-js
  - Supabase SDK
---

# Claude Skill: Supabase Client Builder

> **Goal**: Provide standard patterns for using the official `@supabase/supabase-js` client in TypeScript applications.

---

## 1. Setup & Initialization

**File**: `src/utils/supabase.ts` (or `src/services/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

// Replace with your project URL and Anon Key
// Ensure these variables are set in your .env file
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

## 2. Type Definitions

Always define interfaces for your tables to ensure type safety. Matches standard naming conventions.

```typescript
export interface UserProfile {
  id: string; // UUID
  username: string;
  avatar_url?: string;
  updated_at?: string;
}
```

## 3. CRUD Patterns

### 3.1 Fetch Data (SELECT)

```typescript
import { supabase } from '@/utils/supabase';
import { UserProfile } from '@/types';

export const fetchProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }

  return (data as UserProfile[]) || [];
};
```

### 3.2 Insert Data (INSERT)

```typescript
export const createProfile = async (profile: Omit<UserProfile, 'id'>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile])
    .select(); // .select() is needed to return the created record

  if (error) throw error;
  return data?.[0];
};
```

### 3.3 Update Data (UPDATE)

```typescript
export const updateProfile = async (id: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0];
};
```

### 3.4 Delete Data (DELETE)

```typescript
export const deleteProfile = async (id: string) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
```

## 4. Advanced Patterns

### 4.1 Filters

```typescript
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('status', 'pending')
  .gt('total', 100)
  .ilike('customer_name', '%John%');
```

### 4.2 Relational Queries

```typescript
// Assuming 'posts' has a foreign key to 'users'
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    users (
      id,
      username
    )
  `);
```

### 4.3 Realtime Subscription

```typescript
import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export const useRealtimeOrders = () => {
  useEffect(() => {
    const channel = supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Change received!', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
```

## 5. React Query Integration

Combine with React Query for optimal state management.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};
```
