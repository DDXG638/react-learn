// 静态生成页面
export const dynamic = 'force-static';

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">关于我们</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          NextShop 是一个展示 Next.js 14 App Router 特性的电商示例项目。
          本页面使用 SSG 静态生成，构建时生成静态 HTML，可部署到任何 CDN。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-3">联系方式</h2>
            <p className="text-gray-600 dark:text-gray-400">
              邮箱: contact@nextshop.example<br />
              电话: 400-123-4567
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-3">公司地址</h2>
            <p className="text-gray-600 dark:text-gray-400">
              北京市朝阳区<br />
              建国路88号
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
