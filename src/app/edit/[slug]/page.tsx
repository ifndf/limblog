'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { slugify } from 'transliteration'
import MarkdownEditor from '@/components/MarkdownEditor'

export default function EditPost({ params }: { params: Promise<{ slug: string }> }) {
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [originalSlug, setOriginalSlug] = useState('')
    const [content, setContent] = useState('')
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
    const [error, setError] = useState('')
    const [slugParam, setSlugParam] = useState<string | null>(null)
    const initRef = useRef(false)

    const router = useRouter()

    useEffect(() => {
        params.then(p => {
            setSlugParam(p.slug)
            setOriginalSlug(p.slug)
        })
    }, [params])

    const { isLoading: fetching, error: fetchError, data: postData } = useQuery({
        queryKey: ['post', slugParam],
        queryFn: async () => {
            if (!slugParam) return null
            const res = await fetch(`/api/posts/${slugParam}`)
            if (!res.ok) throw new Error('文章不存在')
            return res.json()
        },
        enabled: !!slugParam,
    })

    useEffect(() => {
        if (postData && !initRef.current) {
            initRef.current = true
            setTitle(postData.title)
            setSlug(postData.slug)
            setContent(postData.content)
        }
    }, [postData])

    const saveMutation = useMutation({
        mutationFn: async (data: { title: string; slug: string; contentBase64: string }) => {
            const res = await fetch(`/api/posts/${originalSlug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) {
                const resData = await res.json()
                throw new Error(resData.error || '更新失败')
            }
            return res.json()
        },
        onSuccess: (post) => {
            router.push(`/${post.slug}`)
            router.refresh()
        },
        onError: (err: Error) => {
            setError(err.message)
        },
    })

    const handleSubmit = async () => {
        setError('')
        const contentBase64 = btoa(Array.from(new TextEncoder().encode(content), b => String.fromCharCode(b)).join(''))
        saveMutation.mutate({ title, slug, contentBase64 })
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        if (!slugManuallyEdited) {
            setSlug(slugify(newTitle, { lowercase: true, separator: '-' }))
        }
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-neutral-500">加载中...</p>
            </div>
        )
    }

    if (fetchError) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-red-500">{(fetchError as Error).message}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-[calc(100dvh-140px)] md:h-[calc(100vh-140px)] h-auto max-w-7xl w-full mx-auto px-5 gap-6 pb-10 md:pb-0">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">编辑文章</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        type="button"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saveMutation.isPending}
                        className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                        <Save size={16} />
                        {saveMutation.isPending ? '保存中...' : '保存更改'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm shrink-0 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="flex gap-4 shrink-0 flex-col md:flex-row">
                <div className="flex-1">
                    <input
                        required
                        type="text"
                        className="w-full border border-neutral-300 p-2 text-lg rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-[3px] focus:outline-blue-500/20 dark:bg-neutral-800 dark:border-neutral-700 block cursor-text"
                        placeholder="文章标题..."
                        value={title}
                        onChange={handleTitleChange}
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center">
                        <span className="text-neutral-500 bg-neutral-100 p-2.5 border border-r-0 border-neutral-300 rounded-l-md text-sm dark:bg-neutral-900 dark:border-neutral-700">/</span>
                        <input
                            required
                            type="text"
                            className="border border-neutral-300 p-2 text-sm rounded-r-md flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-[3px] focus:outline-blue-500/20 dark:bg-neutral-800 dark:border-neutral-700 h-full block cursor-text"
                            value={slug}
                            onChange={(e) => { setSlugManuallyEdited(true); setSlug(e.target.value.toLowerCase().replace(/[\s]+/g, '-')) }}
                        />
                    </div>
                </div>
            </div>

            <MarkdownEditor
                content={content}
                onChange={setContent}
                placeholder="Markdown 正文..."
            />
        </div>
    )
}
