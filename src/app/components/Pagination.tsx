'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Pagination({
    currentPage,
    totalPages,
}: {
    currentPage: number
    totalPages: number
}) {
    const router = useRouter()
    const pathname = usePathname()

    const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(`${pathname}?page=${e.target.value}`)
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between pt-6 mt-10">
            <div className="flex items-center gap-3">
                <Link
                    href={`${pathname}?page=1`}
                    className={`text-sm font-medium hover:underline text-neutral-600 dark:text-neutral-400 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
                        }`}
                >
                    首页
                </Link>
                <Link
                    href={`${pathname}?page=${currentPage - 1}`}
                    className={`text-sm font-medium hover:underline text-neutral-600 dark:text-neutral-400 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
                        }`}
                >
                    &larr; 上一页
                </Link>
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className="hidden sm:inline-block">跳转至 : </span>
                <select
                    value={currentPage}
                    onChange={handlePageChange}
                    className="bg-transparent dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-neutral-100"
                >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <option key={page} value={page} className="dark:bg-neutral-900 dark:text-neutral-100">
                            {page}
                        </option>
                    ))}
                </select>
                <span className="hidden sm:inline-block">/ {totalPages} 页</span>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href={`${pathname}?page=${currentPage + 1}`}
                    className={`text-sm font-medium hover:underline text-neutral-600 dark:text-neutral-400 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''
                        }`}
                >
                    下一页 &rarr;
                </Link>
                <Link
                    href={`${pathname}?page=${totalPages}`}
                    className={`text-sm font-medium hover:underline text-neutral-600 dark:text-neutral-400 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''
                        }`}
                >
                    尾页
                </Link>
            </div>
        </div>
    )
}
