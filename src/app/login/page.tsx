'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '登录失败')
            }

            window.location.href = '/new'
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 px-6 py-8 border border-neutral-200 rounded-xl dark:border-neutral-800">
            <h1 className="text-2xl font-bold tracking-tight mb-6 text-center">后台登录</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">用户名</label>
                    <input
                        required
                        type="text"
                        className="w-full mt-1 border border-neutral-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">密码</label>
                    <input
                        required
                        type="password"
                        className="w-full mt-1 border border-neutral-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-neutral-900 text-white px-6 py-2 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                    {loading ? '验证中...' : '登录'}
                </button>
            </form>
        </div>
    )
}
