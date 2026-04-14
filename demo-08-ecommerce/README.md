# 第八章：综合实战 - 电商全栈项目

## 学习内容

### 1. 状态管理

#### Zustand 核心用法

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        const existing = items.find(item => item.product.id === product.id);
        if (existing) {
          set({
            items: items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1 }] });
        }
      },
      // ...
    }),
    { name: 'cart-storage' } // 持久化 key
  )
);

// 使用
const items = useCartStore(state => state.items);
```

#### Zustand 特点

| 特性 | 说明 |
|------|------|
| 轻量 | 无 Provider，无 context，直接使用 |
| 持久化 | `persist` middleware 支持 localStorage |
| 性能 | 细粒度订阅，只更新需要的组件 |
| TypeScript | 完整类型支持 |

### 2. React Query

#### 核心概念

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function ProductsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', category],
    queryFn: () => fetch(`/api/products?category=${category}`).then(r => r.json()),
    staleTime: 60 * 1000, // 1分钟内不重新获取
  });

  if (isLoading) return <Skeleton />;
  if (error) return <Error />;
  return <ProductList products={data} />;
}
```

#### 缓存机制

```
首次获取 → 存入缓存 → 返回数据
                ↓
         60秒内再次请求
                ↓
           直接返回缓存（不请求网络）
                ↓
         60秒后，缓存变为 stale
                ↓
           下次请求时，后台重新获取
```

#### 适用场景

| 场景 | 推荐 |
|------|------|
| 频繁变化的数据 | React Query（自动刷新） |
| 持久化状态 | Zustand（localStorage） |
| 表单状态 | useState / useReducer |
| 服务端数据 | React Query（缓存 + 预取） |

### 3. API Routes

#### 创建 API 路由

```tsx
// app/api/products/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (category) {
    const results = getProducts().filter(p => p.category === category);
    return Response.json(results);
  }

  return Response.json(getProducts());
}

export async function POST(request: Request) {
  const { productId, quantity } = await request.json();
  // 处理添加购物车逻辑
  return Response.json({ success: true });
}
```

#### 客户端调用

```tsx
// 方式1: fetch
const res = await fetch('/api/products');
const data = await res.json();

// 方式2: React Query（推荐）
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: () => fetch('/api/products').then(r => r.json()),
});
```

### 4. 组合使用

```
React Query → 获取服务端数据
    ↓
Zustand → 存储客户端状态（购物车）
    ↓
Next.js API Routes → 处理业务逻辑
```

---

## Demo 工程：全栈电商

### 功能

1. **商品展示**：React Query 获取数据，支持分类筛选
2. **购物车**：Zustand 持久化，刷新不丢失
3. **商品详情**：SSR 渲染，实时数据

### 技术栈

- Next.js 16 + App Router
- React 19 + TypeScript
- Zustand 5（状态管理）
- React Query 5（服务端状态）
- Tailwind CSS 4.x

### 项目结构

```
demo-08-ecommerce/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── products/route.ts    # 商品 API
│   │   │   └── cart/route.ts        # 购物车 API
│   │   ├── products/
│   │   │   ├── page.tsx             # 商品列表
│   │   │   └── [id]/page.tsx        # 商品详情
│   │   ├── cart/page.tsx            # 购物车页面
│   │   ├── layout.tsx
│   │   └── page.tsx                 # 首页
│   ├── components/
│   │   ├── Navbar.tsx               # 导航栏
│   │   ├── AddToCartButton.tsx     # 添加购物车
│   │   └── QueryProvider.tsx        # React Query Provider
│   ├── stores/
│   │   ├── cart.ts                  # 购物车状态
│   │   └── auth.ts                  # 认证状态
│   └── types/
│       └── index.ts                 # 类型定义
└── package.json
```

### 运行项目

```bash
cd demo-08-ecommerce
pnpm install
pnpm dev
```

---

## 面试题

### Q1: Zustand 相比 Redux 的优势？

| 对比 | Zustand | Redux |
|------|---------|-------|
| 学习曲线 | 低 | 高（需要 actions/reducers） |
| 代码量 | 少 | 多 |
| Provider | 不需要 | 需要 |
| 持久化 | 简单内置 | 需要额外库 |
| 包大小 | ~1KB | ~7KB |

```tsx
// Zustand 简单示例
const useStore = create((set) => ({
  count: 0,
  inc: () => set(s => ({ count: s.count + 1 })),
}));

// 使用
function Counter() {
  const { count, inc } = useStore();
  return <button onClick={inc}>{count}</button>;
}
```

### Q2: React Query 适合什么场景？

**适合：**
- 频繁请求的 API 数据
- 需要缓存和自动刷新
- 分页、搜索等场景
- 乐观更新

**不适合：**
- 客户端私有状态（购物车、用户信息）
- 需要持久化的数据
- 实时数据（WebSocket 更合适）

### Q3: 何时用 Zustand，何时用 Context？

| 场景 | 推荐 |
|------|------|
| 全局 UI 状态（主题、语言） | Context 或 Zustand |
| 表单状态 | useState |
| 持久化状态 | Zustand |
| 服务端数据缓存 | React Query |
| 组件状态 | useState |

---

## 总结

| 技术 | 职责 | 特点 |
|------|------|------|
| React Query | 服务端数据 | 缓存、自动刷新 |
| Zustand | 客户端状态 | 轻量、持久化 |
| API Routes | 后端接口 | 统一、前后端共存 |
