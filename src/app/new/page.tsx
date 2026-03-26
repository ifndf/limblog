'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { slugify } from 'transliteration'
import MarkdownEditor from '@/components/MarkdownEditor'

export default function NewPost() {
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const contentBase64 = btoa(Array.from(new TextEncoder().encode(content), b => String.fromCharCode(b)).join(''))
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, slug, contentBase64 }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '发布失败')
            }

            const post = await res.json()
            router.push(`/${post.slug}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        if (!slugManuallyEdited) {
            setSlug(slugify(newTitle, { lowercase: true, separator: '-' }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col min-h-[calc(100dvh-140px)] md:h-[calc(100vh-140px)] h-auto max-w-7xl w-full mx-auto px-5 gap-6 pb-10 md:pb-0">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">撰写新博客</h1>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                        <Save size={16} />
                        {loading ? '发布中...' : '立即发布'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm shrink-0 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="flex gap-4 shrink-0 flex-col md:flex-row">
                <div className="flex-1 flex flex-col gap-2">
                    <input
                        required
                        type="text"
                        className="w-full border border-neutral-300 p-2 text-lg rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-[3px] focus:outline-blue-500/20 dark:bg-neutral-800 dark:border-neutral-700 block cursor-text"
                        placeholder="输入博客标题..."
                        value={title}
                        onChange={handleTitleChange}
                    />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center">
                        <span className="text-neutral-500 bg-neutral-100 p-2.5 border border-r-0 border-neutral-300 rounded-l-md text-sm dark:bg-neutral-900 dark:border-neutral-700">/</span>
                        <input
                            required
                            type="text"
                            className="border border-neutral-300 p-2 text-sm rounded-r-md flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-[3px] focus:outline-blue-500/20 dark:bg-neutral-800 dark:border-neutral-700 h-full block cursor-text"
                            placeholder="my-first-post"
                            value={slug}
                            onChange={(e) => { setSlugManuallyEdited(true); setSlug(e.target.value.toLowerCase().replace(/[\s]+/g, '-')) }}
                        />
                    </div>
                </div>
            </div>

            <MarkdownEditor
                content={content}
                onChange={setContent}
                placeholder={"开始使用 Markdown 泼墨挥笔...\n直接 Ctrl+V 即可上传并粘贴图片。"}
            />
        </form>
    )
}
