import Link from 'next/link'
import prisma from '@/lib/prisma'

export const revalidate = 0 // Disable cache for demo since this is dynamic

export default async function Home() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-10">
      <section className="mt-8 space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">你好。</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          这是一个基于 Next.js + Tailwind CSS + Prisma 的轻量级动态博客 Demo。直接在前端进行创作发布，后台实时存储。
        </p>
      </section>

      <section className="space-y-6 pt-6">
        <h2 className="text-xl font-bold">最新文章</h2>
        {posts.length === 0 ? (
          <p className="text-neutral-500 italic">目前还没有博客。点击上方“写博客”去创建一篇吧！</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id} className="flex justify-between items-baseline group">
                <Link href={`/${post.slug}`} className="text-lg font-medium group-hover:underline underline-offset-4 decoration-neutral-400">
                  {post.title}
                </Link>
                <time className="text-sm text-neutral-500 tabular-nums">
                  {new Date(post.createdAt).toISOString().split('T')[0]}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
