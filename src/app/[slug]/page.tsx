import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import PostActions from './PostActions'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = await params
    const post = await prisma.post.findUnique({ where: { slug } })

    if (!post) {
        return { title: 'Post Not Found' }
    }

    return {
        title: `${post.title} | LimBlog`,
    }
}

export default async function PostPage({ params }: { params: Params }) {
    const { slug } = await params
    const post = await prisma.post.findUnique({ where: { slug } })

    if (!post) {
        notFound()
    }

    const session = await getSession()

    return (
        <article className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl mx-auto px-5 lg:px-0">
            <header className="space-y-4 text-center mt-12 mb-16">
                <h1 className="text-4xl font-black tracking-tight leading-tight mx-auto">
                    {post.title}
                </h1>
                <div className="text-neutral-500 uppercase tracking-widest text-sm space-x-2">
                    <time dateTime={post.createdAt.toISOString()}>
                        {new Date(post.createdAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </time>
                </div>

                {session && <PostActions slug={post.slug} />}
            </header>

            <div className="prose prose-neutral min-w-full dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl mx-auto pb-20">
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
        </article>
    )
}
