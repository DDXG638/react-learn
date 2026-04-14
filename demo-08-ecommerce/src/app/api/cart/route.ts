import { NextResponse } from 'next/server';
import { getProduct } from '@/types';

// 购物车存储（内存中，演示用）
const carts: Map<string, Array<{ productId: string; quantity: number }>> = new Map();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'anonymous';

  const cart = carts.get(userId) || [];

  // 填充商品详情
  const cartWithProducts = cart.map(item => {
    const product = getProduct(item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      product,
    };
  }).filter(item => item.product);

  return NextResponse.json(cartWithProducts);
}

export async function POST(request: Request) {
  const { productId, quantity = 1, userId = 'anonymous' } = await request.json();

  const product = getProduct(productId);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const cart = carts.get(userId) || [];
  const existingIndex = cart.findIndex(item => item.productId === productId);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  carts.set(userId, cart);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const userId = searchParams.get('userId') || 'anonymous';

  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
  }

  const cart = carts.get(userId) || [];
  const filtered = cart.filter(item => item.productId !== productId);
  carts.set(userId, filtered);

  return NextResponse.json({ success: true });
}
