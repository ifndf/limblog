'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Upload, FileArchive, Trash2, User, Database, Settings as SettingsIcon } from 'lucide-react'

export default function SettingsClient() {
    const [activeTab, setActiveTab] = useState<'account' | 'data' | 'site'>('account')

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    // 导入导出状态
    const [importing, setImporting] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [deletingAll, setDeletingAll] = useState(false)
    const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 站点配置状态
    const [siteConfig, setSiteConfig] = useState({
        home_content: '',
        contact_github: '',
        contact_twitter: '',
        contact_mail: '',
    })
    const [configSaving, setConfigSaving] = useState(false)

    const router = useRouter()

    useEffect(() => {
        fetch('/api/site-config')
            .then(res => res.json())
            .then(data => {
                setSiteConfig(prev => ({ ...prev, ...data }))
            })
            .catch(err => console.error('Failed to load config:', err))
    }, [])

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
        setError('')
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
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDeleteAll = async () => {
        if (!window.confirm('确定要删除所有文章吗？此操作不可逆！建议在删除前先进行导出备份。')) return

        setDeletingAll(true)
        setError('')
        try {
            const res = await fetch('/api/posts/delete-all', { method: 'DELETE' })
            if (!res.ok) throw new Error('删除失败')

            const result = await res.json()
            alert(`成功删除了 ${result.deleted} 篇文章！`)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setDeletingAll(false)
        }
    }

    const handleSaveSiteConfig = async (e: React.FormEvent) => {
        e.preventDefault()
        setConfigSaving(true)
        setError('')
        setSuccess('')

        try {
            const res = await fetch('/api/site-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteConfig)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '保存失败')
            }

            setSuccess('站点配置已成功保存！')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setConfigSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-5 lg:px-0 mt-10">
            <h1 className="text-3xl font-extrabold tracking-tight mb-8">后台管理</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* 侧边栏 */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-2 relative">
                    <button
                        onClick={() => { setActiveTab('account'); setError(''); setSuccess('') }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'account' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}`}
                    >
                        <User size={18} />
                        账户设置
                    </button>
                    <button
                        onClick={() => { setActiveTab('data'); setError(''); setSuccess('') }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}`}
                    >
                        <Database size={18} />
                        数据管理
                    </button>
                    <button
                        onClick={() => { setActiveTab('site'); setError(''); setSuccess('') }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'site' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}`}
                    >
                        <SettingsIcon size={18} />
                        站点配置
                    </button>
                </aside>

                {/* 主内容区 */}
                <div className="flex-1">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 dark:bg-red-900/20 dark:text-red-400 animate-in fade-in">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-6 dark:bg-green-900/20 dark:text-green-400 animate-in fade-in">
                            {success}
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="p-6 border border-neutral-200 rounded-xl dark:border-neutral-800 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-xl font-bold tracking-tight mb-6">账户设置</h2>
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
                    )}

                    {activeTab === 'data' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="p-6 border border-neutral-200 rounded-xl dark:border-neutral-800">
                                <h2 className="text-xl font-bold tracking-tight mb-2">文章管理</h2>
                                <p className="text-sm text-neutral-500 mb-6">导入导出 Markdown 格式文章或清空所有数据。</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleExport}
                                        disabled={exporting}
                                        className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl hover:border-neutral-500 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all disabled:opacity-50 group"
                                    >
                                        <Download size={24} className="text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors" />
                                        <div className="text-center mt-2">
                                            <p className="font-medium text-sm">{exporting ? '打包中...' : '导出所有文章'}</p>
                                            <p className="text-xs text-neutral-500 mt-1">下载为 .zip 压缩包</p>
                                        </div>
                                    </button>

                                    <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl hover:border-neutral-500 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer group">
                                        <Upload size={24} className="text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors" />
                                        <div className="text-center mt-2">
                                            <p className="font-medium text-sm">{importing ? '导入中...' : '导入文章'}</p>
                                            <p className="text-xs text-neutral-500 mt-1">支持 .zip 或 .md</p>
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
                            </div>

                            <div className="p-6 border border-red-200 rounded-xl dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                                <h2 className="text-xl font-bold tracking-tight mb-2 text-red-600 dark:text-red-400">危险操作</h2>
                                <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">清空博客的所有文章数据。此操作不可恢复，请务必先确认是否需要导出数据。</p>
                                <button
                                    onClick={handleDeleteAll}
                                    disabled={deletingAll}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                    {deletingAll ? '正在清空...' : '删除所有文章'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'site' && (
                        <div className="p-6 border border-neutral-200 rounded-xl dark:border-neutral-800 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-xl font-bold tracking-tight mb-6">站点配置</h2>
                            <form onSubmit={handleSaveSiteConfig} className="flex flex-col gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">主页内容展示 (Markdown 格式)</label>
                                    <textarea
                                        className="w-full border border-neutral-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 font-mono text-sm leading-relaxed min-h-[150px]"
                                        value={siteConfig.home_content}
                                        onChange={(e) => setSiteConfig({ ...siteConfig, home_content: e.target.value })}
                                        placeholder="在这里编写你的主页介绍..."
                                    />
                                    <p className="text-xs text-neutral-500 mt-2">这段文字将会显示在博客的首页。</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">GitHub 链接</label>
                                        <input
                                            type="url"
                                            className="w-full border border-neutral-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 text-sm"
                                            value={siteConfig.contact_github}
                                            onChange={(e) => setSiteConfig({ ...siteConfig, contact_github: e.target.value })}
                                            placeholder="https://github.com/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Twitter 链接</label>
                                        <input
                                            type="url"
                                            className="w-full border border-neutral-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 text-sm"
                                            value={siteConfig.contact_twitter}
                                            onChange={(e) => setSiteConfig({ ...siteConfig, contact_twitter: e.target.value })}
                                            placeholder="https://twitter.com/..."
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">邮箱地址</label>
                                        <input
                                            type="email"
                                            className="w-full border border-neutral-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 text-sm"
                                            value={siteConfig.contact_mail}
                                            onChange={(e) => setSiteConfig({ ...siteConfig, contact_mail: e.target.value })}
                                            placeholder="hello@example.com"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={configSaving}
                                    className="w-full mt-4 bg-neutral-900 text-white px-6 py-2.5 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 font-medium"
                                >
                                    {configSaving ? '保存中...' : '保存站点配置'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
