import Link from 'next/link'
import prisma from '@/lib/prisma'

export const revalidate = 0 // Disable cache for demo since this is dynamic

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10));
  const perPage = 10;

  const totalPosts = await prisma.post.count();
  const totalPages = Math.ceil(totalPosts / perPage);

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (currentPage - 1) * perPage,
    take: perPage,
  })

  return (
    <div className="space-y-10">
      <section className="mt-8 space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">你好。</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          这是一个基于 Next.js + Tailwind CSS + Prisma 的轻量级动态博客 Demo。直接在前端进行创作发布，后台实时存储。
        </p>
      </section>

      <section className="space-y-8 pt-6">
        <h2 className="text-xl font-bold">最新文章</h2>
        {posts.length === 0 ? (
          <p className="text-neutral-500 italic">目前还没有博客。点击上方“写博客”去创建一篇吧！</p>
        ) : (
          <div className="space-y-10 border-b border-neutral-200 dark:border-neutral-800 pb-10">
            {posts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/${post.slug}`} className="block">
                  <h3 className="text-lg font-medium group-hover:underline underline-offset-4 decoration-neutral-400 leading-tight">
                    {post.title}
                  </h3>
                  <div className="mt-2 text-neutral-500 text-sm flex gap-4">
                    <time dateTime={post.createdAt.toISOString()}>
                      {new Date(post.createdAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            {currentPage > 1 ? (
              <Link
                href={`/?page=${currentPage - 1}`}
                className="text-sm font-medium hover:underline text-neutral-600 dark:text-neutral-400"
              >
                &larr; 上一页
              </Link>
            ) : <div />}

            <span className="text-sm text-neutral-400 hidden sm:inline-block">
              第 {currentPage} 页 / 共 {totalPages} 页
            </span>

            {currentPage < totalPages ? (
              <Link
                href={`/?page=${currentPage + 1}`}
                className="text-sm font-medium hover:underline text-neutral-600 dark:text-neutral-400"
              >
                下一页 &rarr;
              </Link>
            ) : <div />}
          </div>
        )}
      </section>
    </div>
  )
}
