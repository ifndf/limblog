'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

export default function PostActions({ slug }: { slug: string }) {
    const router = useRouter()
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    const handleDelete = async () => {
        if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) return

        setDeleting(true)
        setDeleteError('')
        try {
            const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '删除失败')
            }
            router.push('/blog')
            router.refresh()
        } catch (err: any) {
            setDeleteError(err.message)
            setDeleting(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-3 mt-4">
            {deleteError && (
                <p className="text-red-500 text-sm">{deleteError}</p>
            )}
            <div className="flex gap-3">
            <button
                onClick={() => router.push(`/edit/${slug}`)}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
                <Pencil size={14} />
                编辑
            </button>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 border border-red-200 dark:border-red-900 px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
                <Trash2 size={14} />
                {deleting ? '删除中...' : '删除'}
            </button>
            </div>
        </div>
    )
}
