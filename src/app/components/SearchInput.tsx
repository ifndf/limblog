'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchInput({ defaultValue = '' }: { defaultValue?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(defaultValue)
    const [expanded, setExpanded] = useState(!!defaultValue)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (expanded && inputRef.current) {
            inputRef.current.focus()
        }
    }, [expanded])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) {
            router.push('/blog')
            setExpanded(false)
        } else {
            router.push(`/blog?q=${encodeURIComponent(query)}`)
        }
    }

    const clearSearch = () => {
        setQuery('')
        router.push('/blog')
        setExpanded(false)
    }

    return (
        <form
            onSubmit={handleSearch}
            className={`relative flex items-center transition-all duration-300 ease-in-out ${expanded ? 'w-full max-w-xs' : 'w-9' // 36px matches the icon button size roughly
                }`}
        >
            <div
                className={`flex items-center w-full overflow-hidden rounded-full border bg-transparent transition-all duration-300 ${expanded
                    ? 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm'
                    : 'border-transparent cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                onClick={() => !expanded && setExpanded(true)}
            >
                <button
                    type="button"
                    onClick={() => !expanded ? setExpanded(true) : handleSearch(new Event('submit') as unknown as React.FormEvent)}
                    className="p-2 text-neutral-500 shrink-0"
                    aria-label="Search"
                >
                    <Search size={18} />
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    placeholder="搜索文章..."
                    className={`bg-transparent w-full focus:outline-none text-sm dark:text-neutral-100 placeholder:text-neutral-400 transition-opacity duration-300 [&::-webkit-search-cancel-button]:appearance-none ${expanded ? 'opacity-100 px-1' : 'opacity-0 w-0'
                        }`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={() => !query.trim() && setExpanded(false)}
                />

                {expanded && query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 shrink-0"
                        aria-label="Clear context"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </form>
    )
}
