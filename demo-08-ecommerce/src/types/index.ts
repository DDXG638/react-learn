// 产品类型
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  stock: number;
}

// 评价类型
export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

// 用户类型
export interface User {
  id: string;
  email: string;
  name: string;
}

// 购物车项
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

// 订单类型
export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

// 模拟数据
export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: '钛金属设计，A17 Pro 芯片，Action 按钮',
    price: 799900,
    category: '手机',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    rating: 4.8,
    reviewCount: 2341,
    stock: 100,
  },
  {
    id: '2',
    name: 'MacBook Pro 14"',
    description: 'M3 Pro 芯片，18 小时电池续航',
    price: 1499900,
    category: '电脑',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    rating: 4.9,
    reviewCount: 1892,
    stock: 50,
  },
  {
    id: '3',
    name: 'AirPods Pro 2',
    description: '主动降噪，自适应音频，个性化空间音频',
    price: 189900,
    category: '耳机',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
    rating: 4.7,
    reviewCount: 5623,
    stock: 200,
  },
  {
    id: '4',
    name: 'iPad Pro 12.9"',
    description: 'M2 芯片，Liquid 视网膜 XDR 显示屏',
    price: 929900,
    category: '平板',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    rating: 4.8,
    reviewCount: 1205,
    stock: 80,
  },
  {
    id: '5',
    name: 'Apple Watch Ultra 2',
    description: '49mm 钛金属表壳，精准双频 GPS',
    price: 649900,
    category: '手表',
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
    rating: 4.9,
    reviewCount: 876,
    stock: 60,
  },
  {
    id: '6',
    name: 'Sony WH-1000XM5',
    description: '行业领先降噪，30 小时续航',
    price: 269900,
    category: '耳机',
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
    rating: 4.6,
    reviewCount: 3421,
    stock: 150,
  },
];

export const categories = ['手机', '电脑', '平板', '耳机', '手表'];

// 模拟数据库查询
export function getProducts(): Product[] {
  return products;
}

export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower)
  );
}
