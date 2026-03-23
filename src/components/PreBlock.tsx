'use client'

import { useState, useRef } from 'react'
import { Copy, Check } from 'lucide-react'

export default function PreBlock({ children, ...props }: any) {
    const [copied, setCopied] = useState(false)
    const textInput = useRef<HTMLPreElement>(null)

    const onCopy = () => {
        if (textInput.current) {
            const text = textInput.current.textContent
            if (text) {
                navigator.clipboard.writeText(text)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        }
    }

    return (
        <div className="relative group my-6 w-full shadow-lg rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
                type="button"
                onClick={onCopy}
                className="absolute right-2 top-2 p-2 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10 flex items-center justify-center cursor-pointer shadow-sm"
                aria-label="复制代码"
                title="复制代码"
            >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
            <div className="overflow-x-auto w-full no-scrollbar">
                <pre ref={textInput} {...props} className="p-4 m-0 bg-transparent relative w-full overflow-x-auto text-sm">
                    {children}
                </pre>
            </div>
        </div>
    )
}
