'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import MarkdownEditor from '@/components/MarkdownEditor'

export default function EditLinksPage() {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')

    const router = useRouter()

    useEffect(() => {
        async function loadConfig() {
            try {
                const res = await fetch('/api/site-config')
                if (!res.ok) throw new Error('获取配置失败')
                const data = await res.json()

                const defaultLinksContent = `No links yet. Add some via the admin panel.
`
                setContent(data.friends_content?.trim() || defaultLinksContent.trim())
            } catch (err: any) {
                setError(err.message)
            } finally {
                setFetching(false)
            }
        }
        loadConfig()
    }, [])

    const handleSubmit = async () => {
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/site-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friends_content: content }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '更新失败')
            }

            router.push('/links')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-neutral-500">加载中...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-[calc(100dvh-140px)] md:h-[calc(100vh-140px)] h-auto max-w-7xl w-full mx-auto px-5 gap-6 pb-10 md:pb-0">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">编辑链接内容</h1>
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
                        disabled={loading}
                        className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                        <Save size={16} />
                        {loading ? '保存中...' : '保存更改'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm shrink-0 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <MarkdownEditor
                content={content}
                onChange={setContent}
                placeholder="Markdown 正文..."
            />
        </div>
    )
}
