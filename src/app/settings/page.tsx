'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Upload, FileArchive } from 'lucide-react'

export default function Settings() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    // 导入导出状态
    const [importing, setImporting] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const router = useRouter()

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const res = await fetch('/api/auth/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '更新失败')
            }

            setSuccess('凭据更新成功！若修改了密码，可能需要重新登录。')
            setUsername('')
            setPassword('')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // 导出所有文章
    const handleExport = async () => {
        setExporting(true)
        try {
            const res = await fetch('/api/posts/export')
            if (!res.ok) throw new Error('导出失败')

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `limblog-export-${new Date().toISOString().split('T')[0]}.zip`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setExporting(false)
        }
    }

    // 导入文章
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImporting(true)
        setImportResult(null)
        setError('')

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/posts/import', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '导入失败')
            }

            const result = await res.json()
            setImportResult(result)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setImporting(false)
            // 清空 input 以便可以重复选同文件
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-5 lg:px-0 mt-10 space-y-10">
            {/* 账户设置 */}
            <div className="p-6 border border-neutral-200 rounded-xl dark:border-neutral-800">
                <h1 className="text-2xl font-bold tracking-tight mb-6">账户设置</h1>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4 dark:bg-green-900/20 dark:text-green-400">
                        {success}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">新用户名 <span className="text-neutral-500 font-normal">(留空代表不修改)</span></label>
                        <input
                            type="text"
                            className="w-full mt-1 border border-neutral-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">新密码 <span className="text-neutral-500 font-normal">(留空代表不修改)</span></label>
                        <input
                            type="password"
                            className="w-full mt-1 border border-neutral-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || (!username && !password)}
                        className="w-full mt-4 bg-neutral-900 text-white px-6 py-2 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                        {loading ? '保存中...' : '保存更改'}
                    </button>
                </form>
            </div>

            {/* 数据管理 */}
            <div className="p-6 border border-neutral-200 rounded-xl dark:border-neutral-800">
                <h2 className="text-2xl font-bold tracking-tight mb-2">数据管理</h2>
                <p className="text-sm text-neutral-500 mb-6">导入或导出你的博客文章。所有文章均以 Markdown 格式（含 frontmatter 元数据）存储于 .zip 压缩包中。</p>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* 导出按钮 */}
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl hover:border-neutral-500 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all disabled:opacity-50 group"
                    >
                        <Download size={20} className="text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors" />
                        <div className="text-left">
                            <p className="font-medium text-sm">{exporting ? '打包中...' : '导出所有文章'}</p>
                            <p className="text-xs text-neutral-500">下载为 .zip 压缩包</p>
                        </div>
                    </button>

                    {/* 导入按钮 */}
                    <label className="flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl hover:border-neutral-500 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer group">
                        <Upload size={20} className="text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors" />
                        <div className="text-left">
                            <p className="font-medium text-sm">{importing ? '导入中...' : '导入文章'}</p>
                            <p className="text-xs text-neutral-500">支持 .zip 或 .md 文件</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".zip,.md"
                            onChange={handleImport}
                            className="hidden"
                            disabled={importing}
                        />
                    </label>
                </div>

                {/* 导入结果 */}
                {importResult && (
                    <div className="mt-6 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center gap-2 mb-2">
                            <FileArchive size={16} className="text-neutral-500" />
                            <span className="font-medium text-sm">导入结果</span>
                        </div>
                        <div className="flex gap-6 text-sm mb-2">
                            <span className="text-green-600 dark:text-green-400">✓ 成功导入 {importResult.imported} 篇</span>
                            {importResult.skipped > 0 && (
                                <span className="text-yellow-600 dark:text-yellow-400">⚠ 跳过 {importResult.skipped} 篇</span>
                            )}
                        </div>
                        {importResult.errors.length > 0 && (
                            <ul className="text-xs text-neutral-500 space-y-1 mt-2">
                                {importResult.errors.map((err, i) => (
                                    <li key={i}>• {err}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* 格式说明 */}
                <details className="mt-6 text-sm">
                    <summary className="cursor-pointer text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors font-medium">
                        📄 Markdown 文件格式说明
                    </summary>
                    <div className="mt-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 font-mono text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                        <pre>{`---
title: "文章标题"
slug: "wen-zhang-biao-ti"
date: "2026-03-11T08:00:00.000Z"
published: true
---

这里是正文内容，支持 Markdown 语法。

## 二级标题

- 列表项
- 第二项`}</pre>
                    </div>
                </details>
            </div>
        </div>
    )
}
