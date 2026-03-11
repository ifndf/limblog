'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPost() {
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, slug, content }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to publish post')
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

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
        if (!slug || slug === title.toLowerCase().replace(/[\s\W-]+/g, '-')) {
            setSlug(e.target.value.toLowerCase().replace(/[\s\W-]+/g, '-'))
        }
    }

    const uploadImage = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })
        if (uploadRes.ok) {
            const data = await uploadRes.json()
            return data.url
        }
        return null
    }

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault()
                const file = items[i].getAsFile()
                if (file) {
                    const url = await uploadImage(file)
                    if (url) {
                        const imgMd = `![${file.name}](${url})\n`
                        setContent((prev) => prev + imgMd)
                    } else {
                        alert('图片上传失败')
                    }
                }
            }
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight mb-8">撰写新博客</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label htmlFor="title" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">标题</label>
                    <input
                        id="title"
                        required
                        type="text"
                        className="border border-neutral-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700"
                        placeholder="输入博客标题"
                        value={title}
                        onChange={handleTitleChange}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="slug" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">固定链接 (Slug)</label>
                    <div className="flex items-center">
                        <span className="text-neutral-500 bg-neutral-100 p-2 border border-r-0 border-neutral-300 rounded-l-md text-sm dark:bg-neutral-900 dark:border-neutral-700">/</span>
                        <input
                            id="slug"
                            required
                            type="text"
                            className="border border-neutral-300 p-2 rounded-r-md flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700"
                            placeholder="my-first-post"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[\s]+/g, '-'))}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2 flex-grow">
                    <label htmlFor="content" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">正文内容 (支持复制粘贴/拖拽图片直接上传)</label>
                    <textarea
                        id="content"
                        required
                        onPaste={handlePaste}
                        className="border font-mono border-neutral-300 p-3 rounded-md h-[400px] focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 resize-y leading-relaxed"
                        placeholder="使用 Markdown 书写... 直接 ctrl+v 粘贴图片"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-neutral-900 text-white px-6 py-2 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                        {loading ? '发布中...' : '立即发布'}
                    </button>
                </div>
            </form>
        </div>
    )
}
