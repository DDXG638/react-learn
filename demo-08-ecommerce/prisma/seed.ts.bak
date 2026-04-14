import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

const products = [
  {
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

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: 'demo123',
    },
  });

  console.log('Created user:', user.email);

  // Create products
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
