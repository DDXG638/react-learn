import { NextResponse } from 'next/server';
import { getProducts, getProduct, searchProducts } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const category = searchParams.get('category');
  const id = searchParams.get('id');

  // 获取单个商品
  if (id) {
    const product = getProduct(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  // 搜索商品
  if (query) {
    const results = searchProducts(query);
    return NextResponse.json(results);
  }

  // 按分类筛选
  if (category) {
    const results = getProducts().filter(p => p.category === category);
    return NextResponse.json(results);
  }

  // 返回所有商品
  return NextResponse.json(getProducts());
}
