import Link from 'next/link'
import prisma from '@/lib/prisma'
import Pagination from '../components/Pagination'
import SearchInput from '../components/SearchInput'
import { getSession } from '@/lib/auth'

export const revalidate = 0

export default async function Blog({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
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

    return (
        <div className="max-w-2xl mx-auto px-5 lg:px-0 space-y-10">
            <section className="space-y-8 pt-6">
                {session && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-end">
                            <SearchInput defaultValue={query} />
                        </div>
                        {query && (
                            <p className="text-sm text-neutral-500">
                                搜索 "{query}" , 共找到 {totalPosts} 篇文章
                            </p>
                        )}
                    </div>
                )}

                {posts.length === 0 ? (
                    <p className="text-neutral-500 italic">目前还没有博客。</p>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => {
                            const d = new Date(post.createdAt)
                            const day = d.toLocaleDateString('en-GB', { day: '2-digit' })
                            const month = d.toLocaleDateString('en-GB', { month: 'short' })
                            const year = d.getFullYear()
                            const dateStr = `${day} ${month}, ${year}`

                            return (
                                <article key={post.id} className="group flex flex-row items-baseline gap-4 sm:gap-6">
                                    <time dateTime={post.createdAt.toISOString()} className="text-neutral-500 w-[110px] sm:w-32 shrink-0 font-mono text-sm sm:text-base tabular-nums tracking-tight">
                                        {dateStr}
                                    </time>
                                    <Link href={`/${post.slug}`} className="block flex-1 min-w-0">
                                        <h3 className="text-base sm:text-lg text-blue-600 dark:text-blue-400 group-hover:underline underline-offset-4 decoration-blue-400/50 leading-snug font-normal truncate sm:whitespace-normal">
                                            {post.title}
                                        </h3>
                                    </Link>
                                </article>
                            )
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                <Pagination currentPage={currentPage} totalPages={totalPages} />
            </section>
        </div>
    )
}
