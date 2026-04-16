import { getProducts } from '@/types';
import { ProductGrid } from './ProductCard'

interface ProductListsProps {
  selectedCategory: string
}

export async function ProductLists({ selectedCategory }: ProductListsProps) {
  // 服务端数据获取
  const allProducts = await getProducts();
  const products = selectedCategory === '全部'
    ? allProducts
    : allProducts.filter(p => p.category === selectedCategory);

  return (
    <>
    {products.length > 0 ? (
      <ProductGrid products={products} />
    ) : (
      <div className="text-center py-12 text-gray-500">
        暂无商品
      </div>
    )}
    </>
  )
}