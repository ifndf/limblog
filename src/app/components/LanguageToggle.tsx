'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LanguageToggle() {
    const router = useRouter()
    const [lang, setLang] = useState('zh')

    useEffect(() => {
        const match = document.cookie.match(/(^| )NEXT_LOCALE=([^;]+)/)
        if (match) {
            setLang(match[2])
        }
    }, [])

    const toggle = () => {
        const nextLang = lang === 'zh' ? 'en' : 'zh'
        document.cookie = `NEXT_LOCALE=${nextLang}; path=/; max-age=31536000`
        setLang(nextLang)
        router.refresh()
    }

    return (
        <button
            type="button"
            onClick={toggle}
            className="hover:underline text-sm font-bold text-neutral-600 dark:text-neutral-400 font-mono tracking-wider"
            title="Toggle Language"
        >
            {lang === 'zh' ? 'EN' : '中文'}
        </button>
    )
}
