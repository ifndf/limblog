'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

export default function SearchInput({ defaultValue = '' }: { defaultValue?: string }) {
    const router = useRouter()
    const [query, setQuery] = useState(defaultValue)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) {
            router.push('/blog')
        } else {
            router.push(`/blog?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full sm:max-w-sm">
            <div className="relative w-full">
                <input
                    type="text"
                    placeholder="搜索文章..."
                    className="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-700 py-2 pl-2 pr-8 focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-500 text-sm font-mono text-neutral-800 dark:text-neutral-200"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button
                    type="submit"
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    aria-label="Search"
                >
                    <Search size={16} />
                </button>
            </div>
        </form>
    )
}
