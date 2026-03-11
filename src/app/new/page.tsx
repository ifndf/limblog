'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Eye, Edit3, Save, Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, Link as LinkIcon, Image as ImageIcon, Quote, Code, Braces, List, ListOrdered, ListChecks, Minus, Table } from 'lucide-react'

export default function NewPost() {
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write') // Mobile primarily

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, slug, content }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '发布失败')
            }

            const post = await res.json()
            router.push(`/${post.slug}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
        if (!slug || slug === title.toLowerCase().replace(/[\s\W-]+/g, '-')) {
            setSlug(e.target.value.toLowerCase().replace(/[\s\W-]+/g, '-'))
        }
    }

    const uploadImage = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })
        if (uploadRes.ok) {
            const data = await uploadRes.json()
            return data.url
        }
        return null
    }

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault()
                const file = items[i].getAsFile()
                if (file) {
                    const url = await uploadImage(file)
                    if (url) {
                        const imgMd = `![${file.name}](${url})\n`
                        setContent((prev) => prev + imgMd)
                    } else {
                        alert('图片上传失败')
                    }
                }
            }
        }
    }

    const handleFormat = (prefix: string, suffix: string = '') => {
        const textarea = document.getElementById('content') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = content;

        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end, text.length);

        const newText = before + prefix + selected + suffix + after;
        setContent(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-[1400px] w-full mx-auto px-5 gap-6">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">撰写新博客</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                        <Save size={16} />
                        {loading ? '发布中...' : '立即发布'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm shrink-0">
                    {error}
                </div>
            )}

            <div className="flex gap-4 shrink-0 flex-col md:flex-row">
                <div className="flex-1 flex flex-col gap-2">
                    <input
                        required
                        type="text"
                        className="border border-neutral-300 p-2 text-lg rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700"
                        placeholder="输入博客标题..."
                        value={title}
                        onChange={handleTitleChange}
                    />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center">
                        <span className="text-neutral-500 bg-neutral-100 p-2.5 border border-r-0 border-neutral-300 rounded-l-md text-sm dark:bg-neutral-900 dark:border-neutral-700">/</span>
                        <input
                            required
                            type="text"
                            className="border border-neutral-300 p-2 text-sm rounded-r-md flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 h-full"
                            placeholder="my-first-post"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[\s]+/g, '-'))}
                        />
                    </div>
                </div>
            </div>

            {/* Editor & Preview Area */}
            <div className="flex-1 flex flex-col border border-neutral-300 rounded-xl overflow-hidden dark:border-neutral-700 bg-white dark:bg-neutral-900">
                {/* Mobile Tabs */}
                <div className="flex border-b border-neutral-200 dark:border-neutral-800 md:hidden bg-neutral-50 dark:bg-neutral-950">
                    <button
                        className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'write' ? 'text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100' : 'text-neutral-500 hover:text-neutral-700'}`}
                        onClick={() => setActiveTab('write')}
                    >
                        <Edit3 size={16} /> 写作
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'preview' ? 'text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100' : 'text-neutral-500 hover:text-neutral-700'}`}
                        onClick={() => setActiveTab('preview')}
                    >
                        <Eye size={16} /> 预览
                    </button>
                </div>

                {/* PC Split View / Mobile Tabs View */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Write Pane */}
                    <div className={`${activeTab === 'preview' ? 'hidden' : 'flex'} md:flex flex-1 flex-col border-r border-neutral-200 dark:border-neutral-800 relative group`}>
                        {/* Toolbar */}
                        <div className="flex items-center gap-0.5 border-b border-neutral-200 dark:border-neutral-800 px-2 py-1.5 overflow-x-auto bg-neutral-50 dark:bg-neutral-900/50 shrink-0">
                            {/* Text Formatting */}
                            <button type="button" onClick={() => handleFormat('**', '**')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="加粗 (Ctrl+B)"><Bold size={16} /></button>
                            <button type="button" onClick={() => handleFormat('*', '*')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="斜体 (Ctrl+I)"><Italic size={16} /></button>
                            <button type="button" onClick={() => handleFormat('~~', '~~')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="删除线"><Strikethrough size={16} /></button>

                            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>

                            {/* Headings */}
                            <button type="button" onClick={() => handleFormat('# ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="一级标题"><Heading1 size={16} /></button>
                            <button type="button" onClick={() => handleFormat('## ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="二级标题"><Heading2 size={16} /></button>
                            <button type="button" onClick={() => handleFormat('### ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="三级标题"><Heading3 size={16} /></button>

                            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>

                            {/* Insert */}
                            <button type="button" onClick={() => handleFormat('[', '](url)')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="插入链接"><LinkIcon size={16} /></button>
                            <button type="button" onClick={() => handleFormat('![alt](', ')')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="插入图片"><ImageIcon size={16} /></button>
                            <button type="button" onClick={() => handleFormat('> ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="引用块"><Quote size={16} /></button>

                            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>

                            {/* Code */}
                            <button type="button" onClick={() => handleFormat('`', '`')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="行内代码"><Code size={16} /></button>
                            <button type="button" onClick={() => handleFormat('```\n', '\n```')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="代码块"><Braces size={16} /></button>

                            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>

                            {/* Lists */}
                            <button type="button" onClick={() => handleFormat('- ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="无序列表"><List size={16} /></button>
                            <button type="button" onClick={() => handleFormat('1. ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="有序列表"><ListOrdered size={16} /></button>
                            <button type="button" onClick={() => handleFormat('- [ ] ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="任务列表"><ListChecks size={16} /></button>

                            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>

                            {/* Misc */}
                            <button type="button" onClick={() => handleFormat('\n---\n', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="分隔线"><Minus size={16} /></button>
                            <button type="button" onClick={() => handleFormat('\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| ', ' |  |  |\n')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="插入表格"><Table size={16} /></button>
                        </div>
                        <div className="absolute top-[52px] right-4 opacity-0 group-focus-within:opacity-100 transition-opacity flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs text-neutral-500 dark:text-neutral-400 font-medium z-10">
                            MD 支持剪贴板传图
                        </div>
                        <textarea
                            id="content"
                            required
                            onPaste={handlePaste}
                            className="flex-1 p-6 font-mono text-sm leading-relaxed resize-none bg-transparent focus:outline-none placeholder:text-neutral-400"
                            placeholder="开始使用 Markdown 泼墨挥笔...&#10;直接 Ctrl+V 即可上传并粘贴图片。"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Preview Pane */}
                    <div className={`${activeTab === 'write' ? 'hidden' : 'flex'} md:flex flex-1 flex-col overflow-y-auto bg-neutral-50 dark:bg-[#121212]`}>
                        <div className="p-8 h-full">
                            {content ? (
                                <div className="prose prose-neutral md:prose-sm lg:prose-base xl:prose-lg min-w-full dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl break-words">
                                    <ReactMarkdown>{content}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-neutral-400 dark:text-neutral-600 text-sm flex-col gap-4">
                                    <Eye size={32} className="opacity-50" />
                                    <span>实时预览栏</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
