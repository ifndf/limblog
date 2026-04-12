import Link from 'next/link'
import prisma from '@/lib/prisma'
import Pagination from '../components/Pagination'
import SearchInput from '../components/SearchInput'
import { getSession } from '@/lib/auth'
import { checkVisibility } from '@/lib/visibility'

export const revalidate = 0

export default async function Blog({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
    await checkVisibility()
    const resolvedParams = await searchParams;
    const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10));
    const query = resolvedParams.q || '';
    const perPage = 10;

    const whereClause = query ? {
        OR: [
            { title: { contains: query } },
            { content: { contains: query } }
        ]
    } : {};

    const totalPosts = await prisma.post.count({ where: whereClause });
    const totalPages = Math.ceil(totalPosts / perPage);

    const posts = await prisma.post.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (currentPage - 1) * perPage,
        take: perPage,
    })

    const session = await getSession()

    // Group posts by year
    const grouped = posts.reduce<Record<string, typeof posts>>((acc, post) => {
        const year = new Date(post.createdAt).getFullYear().toString()
        if (!acc[year]) acc[year] = []
        acc[year].push(post)
        return acc
    }, {})

    return (
        <div className="max-w-3xl mx-auto px-5 space-y-10">
            <section className="space-y-8 mt-4">
                {session && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-end">
                            <SearchInput defaultValue={query} />
                        </div>
                        {query && (
                            <p className="text-sm text-neutral-500">
                                搜索 "{query}" ，共找到 {totalPosts} 篇文章
                            </p>
                        )}
                    </div>
                )}

                {posts.length === 0 ? (
                    <p className="text-neutral-500 italic py-8 text-center">目前还没有博客。</p>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearPosts]) => (
                            <div key={year} className="space-y-1">
                                <h2 className="text-3xl font-bold text-stone-300 dark:text-neutral-700 select-none mb-3">{year}</h2>
                                <div className="space-y-0">
                                    {yearPosts.map((post) => (
                                        <article key={post.id} className="flex items-baseline gap-4 group py-2">
                                            <time dateTime={post.createdAt.toISOString()} className="text-neutral-400 dark:text-neutral-500 shrink-0 font-mono text-sm tabular-nums">
                                                {new Date(post.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: '2-digit' })}
                                            </time>
                                            <Link href={`/${post.slug}`} className="block flex-1 min-w-0">
                                                <h3 className="text-base text-blue-600 dark:text-blue-400 group-hover:underline underline-offset-4 decoration-blue-400/50 leading-snug truncate">
                                                    {post.title}
                                                </h3>
                                            </Link>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                <Pagination currentPage={currentPage} totalPages={totalPages} />
            </section>
        </div>
    )
}
