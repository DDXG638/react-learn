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
  name: string;
  email: string;
  avatar: string;
}

// 模拟数据
export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: '钛金属设计，A17 Pro 芯片，Action 按钮',
    price: 7999,
    category: '手机',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    rating: 4.8,
    reviewCount: 2341,
  },
  {
    id: '2',
    name: 'MacBook Pro 14"',
    description: 'M3 Pro 芯片，18 小时电池续航',
    price: 14999,
    category: '电脑',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    rating: 4.9,
    reviewCount: 1892,
  },
  {
    id: '3',
    name: 'AirPods Pro 2',
    description: '主动降噪，自适应音频，个性化空间音频',
    price: 1899,
    category: '耳机',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
    rating: 4.7,
    reviewCount: 5623,
  },
  {
    id: '4',
    name: 'iPad Pro 12.9"',
    description: 'M2 芯片，Liquid 视网膜 XDR 显示屏',
    price: 9299,
    category: '平板',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    rating: 4.8,
    reviewCount: 1205,
  },
  {
    id: '5',
    name: 'Apple Watch Ultra 2',
    description: '49mm 钛金属表壳，精准双频 GPS',
    price: 6499,
    category: '手表',
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
    rating: 4.9,
    reviewCount: 876,
  },
  {
    id: '6',
    name: 'Sony WH-1000XM5',
    description: '行业领先降噪，30 小时续航',
    price: 2699,
    category: '耳机',
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
    rating: 4.6,
    reviewCount: 3421,
  },
];

export const reviews: Review[] = [
  {
    id: '1',
    productId: '1',
    author: '张三',
    rating: 5,
    comment: '系统非常流畅，拍照效果出色！',
    date: '2024-01-15',
  },
  {
    id: '2',
    productId: '1',
    author: '李四',
    rating: 4,
    comment: '续航比上一代好了很多',
    date: '2024-01-10',
  },
  {
    id: '3',
    productId: '1',
    author: '王五',
    rating: 5,
    comment: '钛金属手感超级棒',
    date: '2024-01-05',
  },
  {
    id: '4',
    productId: '2',
    author: '赵六',
    rating: 5,
    comment: '性能强劲，视频编辑毫无压力',
    date: '2024-01-12',
  },
  {
    id: '5',
    productId: '2',
    author: '钱七',
    rating: 5,
    comment: '屏幕显示效果惊艳',
    date: '2024-01-08',
  },
];

export const categories = ['手机', '电脑', '平板', '耳机', '手表'];

// 模拟数据库查询函数
export async function getProducts(): Promise<Product[]> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 100));
  return products;
}

export async function getProduct(id: string): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return products.find((p) => p.id === id) || null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return products.filter((p) => p.category === category);
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return reviews.filter((r) => r.productId === productId);
}
