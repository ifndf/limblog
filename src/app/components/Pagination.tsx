'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Pagination({
    currentPage,
    totalPages,
}: {
    currentPage: number
    totalPages: number
}) {
    const pathname = usePathname()

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between pt-6 mt-10 text-sm font-mono border-t border-neutral-200 dark:border-neutral-800">
            {currentPage > 1 ? (
                <Link
                    href={`${pathname}?page=${currentPage - 1}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 decoration-blue-400/50"
                >
                    &lt; 上一页
                </Link>
            ) : (
                <span className="text-transparent pointer-events-none">&lt; 上一页</span>
            )}

            <span className="text-neutral-500">
                {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
                <Link
                    href={`${pathname}?page=${currentPage + 1}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 decoration-blue-400/50"
                >
                    下一页 &gt;
                </Link>
            ) : (
                <span className="text-transparent pointer-events-none">下一页 &gt;</span>
            )}
        </div>
    )
}
