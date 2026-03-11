'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            className="text-sm text-neutral-600 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400"
        >
            登出
        </button>
    )
}
