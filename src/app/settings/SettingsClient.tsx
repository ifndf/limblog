'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Upload, FileArchive, Trash2, User, Database, Settings as SettingsIcon, Sun, Moon, Monitor, Globe, Lock } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function SettingsClient() {
    const [activeTab, setActiveTab] = useState<'account' | 'data' | 'site'>('account')
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // 避免水合错误
    useEffect(() => {
        setMounted(true)
    }, [])

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    // 导入导出状态
    const [importing, setImporting] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [deletingAll, setDeletingAll] = useState(false)
    const [deleteSuccess, setDeleteSuccess] = useState(false)
    const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 站点配置状态
    const [siteConfig, setSiteConfig] = useState({
        blog_name: '',
        home_content: '',
        friends_content: '',
        contact_github: '',
        contact_twitter: '',
        contact_mail: '',
        site_visibility: 'public',
    })
    const [configSaving, setConfigSaving] = useState(false)

    const router = useRouter()
    const queryClient = useQueryClient()
    const initRef = useRef(false)

    const { data: siteConfigData } = useQuery({
        queryKey: ['site-config'],
        queryFn: async () => {
            const res = await fetch('/api/site-config')
            if (!res.ok) throw new Error('Failed to load config')
            return res.json()
        },
    })

    // Sync siteConfig with query data when it first loads
    useEffect(() => {
        if (siteConfigData && !initRef.current) {
            initRef.current = true
            setSiteConfig(prev => ({ ...prev, ...siteConfigData }))
        }
    }, [siteConfigData])

    // Auto-dismiss success message after 3 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // Mutations
    const credentialsMutation = useMutation({
        mutationFn: async (data: { username: string; password: string }) => {
            const res = await fetch('/api/auth/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) {
                const resData = await res.json()
                throw new Error(resData.error || '更新失败')
            }
            return res.json()
        },
        onSuccess: () => {
            setSuccess('凭据更新成功！若修改了密码，可能需要重新登录。')
            setUsername('')
            setPassword('')
        },
        onError: (err: Error) => {
            setError(err.message)
        },
    })

    const siteConfigMutation = useMutation({
        mutationFn: async (data: typeof siteConfig) => {
            const res = await fetch('/api/site-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) {
                const resData = await res.json()
                throw new Error(resData.error || '保存失败')
            }
            return res.json()
        },
        onSuccess: () => {
            setSuccess('站点配置已成功保存！')
            queryClient.invalidateQueries({ queryKey: ['site-config'] })
        },
        onError: (err: Error) => {
            setError(err.message)
        },
    })

    const handleUpdate = async () => {
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            await credentialsMutation.mutateAsync({ username, password })
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
        setDeleteSuccess(false)
        try {
            const res = await fetch('/api/posts/delete-all', { method: 'DELETE' })
            if (!res.ok) throw new Error('删除失败')

            const result = await res.json()
            setDeleteSuccess(true)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setDeletingAll(false)
        }
    }

    const handleSaveSiteConfig = async () => {
        setError('')
        setSuccess('')
        setConfigSaving(true)

        try {
            await siteConfigMutation.mutateAsync(siteConfig)
        } finally {
            setConfigSaving(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-5 mt-10">

            <div className="flex flex-col md:flex-row gap-0 rounded-2xl border border-stone-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-stone-800 shadow-sm">
                {/* 侧边栏 - 卡片式导航 */}
                <aside className="w-full md:w-56 flex-shrink-0 bg-stone-100 dark:bg-stone-900/50 p-3 space-y-1">
                    <div className="text-xs font-semibold text-stone-400 dark:text-neutral-500 uppercase tracking-wider px-3 pt-2 pb-1">导航</div>
                    <button
                        onClick={() => { setActiveTab('account'); setError(''); setSuccess('') }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'account' ? 'bg-white dark:bg-neutral-800 text-stone-900 dark:text-neutral-100 shadow-sm border border-stone-300 dark:border-neutral-700' : 'text-stone-800 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-white dark:hover:bg-neutral-800'}`}
                    >
                        <User size={16} />
                        账户设置
                    </button>
                    <button
                        onClick={() => { setActiveTab('data'); setError(''); setSuccess('') }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-white dark:bg-neutral-800 text-stone-900 dark:text-neutral-100 shadow-sm border border-stone-300 dark:border-neutral-700' : 'text-stone-800 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-white dark:hover:bg-neutral-800'}`}
                    >
                        <Database size={16} />
                        数据管理
                    </button>
                    <button
                        onClick={() => { setActiveTab('site'); setError(''); setSuccess('') }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'site' ? 'bg-white dark:bg-neutral-800 text-stone-900 dark:text-neutral-100 shadow-sm border border-stone-300 dark:border-neutral-700' : 'text-stone-800 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-white dark:hover:bg-neutral-800'}`}
                    >
                        <SettingsIcon size={16} />
                        站点配置
                    </button>
                </aside>

                {/* 分隔线 */}
                <div className="hidden md:block w-px bg-stone-300 dark:bg-neutral-800" />

                {/* 主内容区 */}
                <div className="flex-1 p-6">
                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900 animate-in fade-in">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-5 px-4 py-3 rounded-lg bg-green-50 text-green-600 text-sm dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900 animate-in fade-in">
                            {success}
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                            <div>
                                <h2 className="text-base font-semibold text-stone-800 dark:text-neutral-100 mb-4">账户设置</h2>
                                <div className="bg-white dark:bg-stone-800 rounded-xl p-5 space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-stone-700 dark:text-neutral-300 block mb-1.5">新用户名 <span className="text-neutral-400 font-normal text-xs">(留空不修改)</span></label>
                                        <input
                                            type="text"
                                            className="w-full border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="admin"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-stone-700 dark:text-neutral-300 block mb-1.5">新密码 <span className="text-neutral-400 font-normal text-xs">(留空不修改)</span></label>
                                        <input
                                            type="password"
                                            className="w-full border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        onClick={handleUpdate}
                                        disabled={loading || (!username && !password)}
                                        className="w-full bg-stone-800 dark:bg-neutral-100 text-white dark:text-stone-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 dark:hover:bg-neutral-200 transition-colors disabled:opacity-40"
                                    >
                                        {loading ? '保存中...' : '保存更改'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-base font-semibold text-stone-800 dark:text-neutral-100">文章管理</h2>

                            <div className="bg-white dark:bg-stone-800 rounded-xl p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        onClick={handleExport}
                                        disabled={exporting}
                                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-white dark:hover:bg-neutral-800 transition-all disabled:opacity-40 group"
                                    >
                                        <Download size={20} className="text-neutral-400 group-hover:text-stone-600 dark:group-hover:text-neutral-300" />
                                        <div>
                                            <p className="text-sm font-medium text-stone-700 dark:text-neutral-200">{exporting ? '打包中...' : '导出文章'}</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">下载 .zip 压缩包</p>
                                        </div>
                                    </button>

                                    <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-white dark:hover:bg-neutral-800 transition-all cursor-pointer group">
                                        <Upload size={20} className="text-neutral-400 group-hover:text-stone-600 dark:group-hover:text-neutral-300" />
                                        <div>
                                            <p className="text-sm font-medium text-stone-700 dark:text-neutral-200">{importing ? '导入中...' : '导入文章'}</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">.zip 或 .md 文件</p>
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
                                    <div className="mt-4 p-3 rounded-lg bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700">
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-green-600 dark:text-green-400">✓ 导入 {importResult.imported} 篇</span>
                                            {importResult.skipped > 0 && <span className="text-yellow-600 dark:text-yellow-400">⚠ 跳过 {importResult.skipped} 篇</span>}
                                        </div>
                                        {importResult.errors.length > 0 && (
                                            <ul className="mt-2 text-xs text-neutral-400 space-y-1">
                                                {importResult.errors.map((err, i) => <li key={i}>• {err}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            {deleteSuccess && (
                                <div className="px-4 py-3 rounded-lg bg-green-50 text-green-600 text-sm dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900">
                                    文章已全部清空。
                                </div>
                            )}

                            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-5 border border-red-100 dark:border-red-900/40">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">危险操作</h3>
                                        <p className="text-xs text-red-500/70 dark:text-red-400/60 mt-1">删除所有文章，数据不可恢复</p>
                                    </div>
                                    <button
                                        onClick={handleDeleteAll}
                                        disabled={deletingAll}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 shrink-0"
                                    >
                                        <Trash2 size={14} />
                                        {deletingAll ? '删除中...' : '删除全部'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'site' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-base font-semibold text-stone-800 dark:text-neutral-100">站点配置</h2>

                            <div className="bg-white dark:bg-stone-800 rounded-xl p-5 space-y-5">
                                <div>
                                    <label className="text-sm font-medium text-stone-700 dark:text-neutral-300 block mb-1.5">博客名称</label>
                                    <input
                                        type="text"
                                        className="w-full border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={siteConfig.blog_name}
                                        onChange={(e) => setSiteConfig({ ...siteConfig, blog_name: e.target.value })}
                                        placeholder="LimBlog"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1.5">GitHub</label>
                                        <input
                                            type="url"
                                            className="w-full border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={siteConfig.contact_github}
                                            onChange={(e) => setSiteConfig({ ...siteConfig, contact_github: e.target.value })}
                                            placeholder="github.com/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1.5">Twitter</label>
                                        <input
                                            type="url"
                                            className="w-full border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={siteConfig.contact_twitter}
                                            onChange={(e) => setSiteConfig({ ...siteConfig, contact_twitter: e.target.value })}
                                            placeholder="twitter.com/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1.5">邮箱</label>
                                        <input
                                            type="email"
                                            className="w-full border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={siteConfig.contact_mail}
                                            onChange={(e) => setSiteConfig({ ...siteConfig, contact_mail: e.target.value })}
                                            placeholder="hello@..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-stone-800 rounded-xl p-5 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-stone-700 dark:text-neutral-300 mb-3">界面主题</p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setTheme('light')}
                                            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${mounted && theme === 'light' ? 'border-neutral-900 bg-stone-800 text-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-white' : 'border-stone-200 dark:border-neutral-700 text-stone-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500'}`}
                                        >
                                            <Sun size={14} />浅色
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTheme('dark')}
                                            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${mounted && theme === 'dark' ? 'border-neutral-900 bg-stone-800 text-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-white' : 'border-stone-200 dark:border-neutral-700 text-stone-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500'}`}
                                        >
                                            <Moon size={14} />深色
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTheme('system')}
                                            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${mounted && theme === 'system' ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'border-stone-200 dark:border-neutral-700 text-stone-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500'}`}
                                        >
                                            <Monitor size={14} />系统
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-stone-700 dark:text-neutral-300 mb-3">博客可见性</p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSiteConfig({ ...siteConfig, site_visibility: 'public' })}
                                            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${(!siteConfig.site_visibility || siteConfig.site_visibility === 'public') ? 'border-green-500 bg-green-50 text-green-600 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400' : 'border-stone-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500'}`}
                                        >
                                            <Globe size={14} />公开
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSiteConfig({ ...siteConfig, site_visibility: 'private' })}
                                            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${siteConfig.site_visibility === 'private' ? 'border-red-500 bg-red-50 text-red-600 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400' : 'border-stone-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500'}`}
                                        >
                                            <Lock size={14} />私密
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSaveSiteConfig}
                                disabled={configSaving}
                                className="w-full bg-stone-800 dark:bg-neutral-100 text-white dark:text-stone-900 px-6 py-3 rounded-xl text-sm font-medium hover:bg-stone-700 dark:hover:bg-neutral-200 transition-colors disabled:opacity-40"
                            >
                                {configSaving ? '保存中...' : '保存站点配置'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
