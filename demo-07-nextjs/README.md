# 第七章：Next.js 核心

## 学习内容

### 1. 渲染模式

#### 四种渲染模式对比

| 模式 | 缩写 | 生成时机 | 适用场景 |
|------|------|---------|---------|
| SSR | 服务端渲染 | 每次请求 | 实时数据、用户个性化 |
| SSG | 静态生成 | 构建时 | 博客、文档、商品详情 |
| ISR | 增量再生成 | 后台定期 | 内容频繁变化但不需要实时 |
| CSR | 客户端渲染 | 浏览器 | 需要登录态、实时交互 |

#### Next.js App Router 渲染策略

```tsx
// 强制 SSR（每次请求实时生成）
export const dynamic = 'force-dynamic';

// 强制 SSG（构建时静态生成）
export const dynamic = 'force-static';

// ISR（60秒后重新生成）
export const revalidate = 60;
```

### 2. 服务端组件 (RSC) vs 客户端组件 (RCC)

#### 服务端组件特点
- 默认所有组件都是服务端组件
- 可以直接访问数据库/文件系统
- 不打包 JS 到客户端
- 可以使用 async/await

```tsx
// app/page.tsx - 服务端组件
async function Page() {
  const data = await db.query('SELECT * FROM products');
  return <ProductList products={data} />;
}
```

#### 客户端组件
- 需要 `'use client'` 指令
- 可以使用 state、effect、浏览器 API
- 会在客户端执行

```tsx
'use client';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

#### 组合模式

```
服务端组件（数据获取）
    ↓ props
客户端组件（交互）
```

```tsx
// app/products/page.tsx - 服务端组件
async function ProductsPage() {
  const products = await getProducts(); // 服务端获取数据
  return <ProductGrid products={products} />; // 传给客户端组件
}

// components/ProductGrid.tsx - 客户端组件
'use client';
function ProductGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState('');
  // 客户端筛选
}
```

### 3. App Router 路由

#### 目录结构

```
app/
├── page.tsx                 # / 路由
├── products/
│   ├── page.tsx             # /products
│   └── [id]/
│       └── page.tsx         # /products/:id 动态路由
├── (marketing)/
│   └── page.tsx             # 路由组，URL 不变
└── @modal/
    └── (default)/
        └── page.tsx         # 并行路由
```

#### 动态路由

```tsx
// app/products/[id]/page.tsx
interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  return <ProductDetail product={product} />;
}

// 预生成静态路径
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(p => ({ id: p.id }));
}
```

#### 路由组

路由组 `(marketing)`、`(shop)` 用于组织代码，URL 路径不变：

```
app/(marketing)/about/page.tsx    → /about
app/(shop)/products/page.tsx      → /products
```

#### 并行路由

`@modal` 和主路由同时渲染：

```
app/
├── page.tsx            # 主页面
└── @modal/
    └── (default)/
        └── page.tsx    # 模态框（可叠加在主页面）
```

### 4. 数据获取

#### 服务端组件直接获取

```tsx
async function ProductList() {
  // 直接在服务端执行
  const products = await fetch('https://api.example.com/products').then(r => r.json());
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

#### API 路由

```tsx
// app/api/products/route.ts
export async function GET() {
  const products = await getProducts();
  return Response.json(products);
}
```

#### 客户端数据请求

```tsx
'use client';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Skeleton />;
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

### 5. 缓存策略

| 配置 | 行为 | 使用场景 |
|------|------|---------|
| `force-cache` | 默认，缓存优先 | 静态内容 |
| `no-store` | 不缓存，每次获取 | 实时数据 |
| `revalidate` | 定时重新验证 | 频繁变化内容 |

```tsx
// 缓存优先
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
});

// 不缓存
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
});

// 60秒重新验证
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }
});
```

### 6. 服务端组件中传递用户状态

#### 通过 cookies/session

```tsx
// app/dashboard/page.tsx
import { cookies } from 'next/headers';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    redirect('/login');
  }

  const user = await getUserFromToken(token.value);
  return <DashboardUI user={user} />;
}
```

---

## Demo 工程：Next.js 电商

### 功能

1. **四种渲染模式演示**：
   - 首页 `/` - SSG 静态生成
   - 商品列表 `/products` - SSR 服务端渲染
   - 商品详情 `/products/[id]` - SSR + 静态预生成
   - CSR 演示 `/csr` - 纯客户端渲染

2. **路由系统**：
   - 动态路由 `[id]`
   - API 路由 `/api/products`

### 技术栈

- Next.js 16.2.3
- React 19
- TypeScript
- Tailwind CSS 4.x

### 项目结构

```
demo-07-nextjs/
├── src/
│   ├── app/
│   │   ├── api/products/route.ts    # API 路由
│   │   ├── products/
│   │   │   ├── page.tsx             # 商品列表 SSR
│   │   │   └── [id]/page.tsx        # 商品详情 SSR
│   │   ├── csr/page.tsx             # CSR 演示
│   │   ├── about/page.tsx           # SSG 静态页面
│   │   ├── layout.tsx              # 根布局
│   │   └── page.tsx                # 首页 SSG
│   ├── components/
│   │   ├── Navbar.tsx              # 导航栏
│   │   ├── ProductCard.tsx         # 产品卡片
│   │   └── ReviewList.tsx          # 评价列表
│   ├── types/
│   │   └── index.ts                # 类型定义和模拟数据
│   └── globals.css
└── next.config.ts
```

---

## 面试题

### Q1: RSC 与 CSR/SSR 的区别？什么场景必须用 Client Component？

**RSC（React 服务端组件）**：
- 默认类型，不需要 `'use client'`
- 在服务端执行，可直接访问数据库/文件
- 不包含事件处理器，不打包到客户端
- 适合数据获取、静态内容

**CSR（客户端组件）**：
- 需要 `'use client'` 声明
- 在浏览器执行，可使用 state/effect
- 产生 JS Bundle

**必须用 Client Component 的场景**：
- 使用 `useState`、`useEffect`
- 使用浏览器 API（localStorage、geolocation）
- 事件监听（onClick、onChange）
- 需要实时更新

```tsx
// ❌ 服务端组件不能有交互
async function BadComponent() {
  const [count, setCount] = useState(0); // 错误！
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// ✅ 拆分：服务端获取数据，客户端处理交互
async function GoodParent() {
  const data = await fetchData(); // 服务端获取
  return <InteractiveClient data={data} />;
}

'use client';
function InteractiveClient({ data }) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Q2: Next.js 数据缓存策略（force-cache/no-store/revalidate）与 ISR 实现？

**缓存策略**：

| 选项 | 说明 |
|------|------|
| `force-cache` | 默认，优先使用缓存 |
| `no-store` | 跳过缓存，每次请求最新 |
| `revalidate` | N 秒后重新验证 |

**ISR（增量静态再生成）**：
```tsx
// 每 60 秒在后台重新生成页面
export const revalidate = 60;

async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  return <ProductDetail product={product} />;
}
```

**适用场景**：
- 商品详情页：数据不频繁变化，用 ISR 减少构建时间
- 博客文章：内容更新不频繁，用 SSG + ISR

### Q3: 服务端组件中如何传递用户状态（Session/Cookie）？

```tsx
// Next.js 14+
import { cookies } from 'next/headers';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login');
  }

  const user = await verifyToken(token.value);
  return <div>欢迎 {user.name}</div>;
}
```

**完整流程**：
1. 用户登录时，服务器设置 HttpOnly Cookie
2. 后续请求自动携带 Cookie
3. 服务端组件通过 `cookies()` 读取
4. 验证失败时重定向到登录页

---

## 运行项目

```bash
cd demo-07-nextjs
pnpm install
pnpm dev
```

访问 http://localhost:3000 查看演示。
