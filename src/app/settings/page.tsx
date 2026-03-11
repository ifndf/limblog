'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Settings() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
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

    return (
        <div className="max-w-md mx-auto mt-10 p-6 border border-neutral-200 rounded-xl dark:border-neutral-800">
            <h1 className="text-2xl font-bold tracking-tight mb-6">账户设置</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4">
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
    )
}
