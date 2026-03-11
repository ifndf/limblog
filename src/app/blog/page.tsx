import Link from 'next/link'
import prisma from '@/lib/prisma'
import Pagination from '../components/Pagination'

export const revalidate = 0

export default async function Blog({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
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
            <section className="space-y-8 pt-6">
                <h1 className="text-3xl font-bold tracking-tight mb-8">博客</h1>
                {posts.length === 0 ? (
                    <p className="text-neutral-500 italic">目前还没有博客。</p>
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
                <Pagination currentPage={currentPage} totalPages={totalPages} />
            </section>
        </div>
    )
}
