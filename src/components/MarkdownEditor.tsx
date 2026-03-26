'use client'

import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { Eye, Edit3, Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, Link as LinkIcon, Image as ImageIcon, Quote, Code, Braces, List, ListOrdered, ListChecks, Minus, Table } from 'lucide-react'
import PreBlock from '@/components/PreBlock'

interface MarkdownEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

export default function MarkdownEditor({ content, onChange, placeholder }: MarkdownEditorProps) {
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

    const uploadImage = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (uploadRes.ok) {
            const data = await uploadRes.json()
            return data.url
        }
        return null
    }

    const insertAtCursor = (textToInsert: string) => {
        const textarea = document.getElementById('md-content') as HTMLTextAreaElement
        if (!textarea) {
            onChange(content + textToInsert)
            return
        }
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = content.substring(0, start)
        const after = content.substring(end)
        const newContent = before + textToInsert + after
        onChange(newContent)
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length)
        }, 0)
    }

    const handleFormat = (prefix: string, suffix: string = '') => {
        const textarea = document.getElementById('md-content') as HTMLTextAreaElement
        if (!textarea) return
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selected = content.substring(start, end)
        const before = content.substring(0, start)
        const after = content.substring(end)
        onChange(before + prefix + selected + suffix + after)
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + prefix.length, end + prefix.length)
        }, 0)
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
                        insertAtCursor(`![${file.name}](${url})\n`)
                    } else {
                        alert('图片上传失败')
                    }
                }
            }
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = await uploadImage(file)
            if (url) {
                insertAtCursor(`![${file.name}](${url})\n`)
            } else {
                alert('图片上传失败')
            }
        }
        e.target.value = ''
    }

    return (
        <div className="flex flex-col border border-neutral-300 rounded-xl overflow-hidden dark:border-neutral-700 bg-white dark:bg-neutral-900 min-h-[500px] md:min-h-0 flex-1">
            {/* Mobile Tabs */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 md:hidden bg-neutral-50 dark:bg-neutral-950">
                <button
                    className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'write' ? 'text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100' : 'text-neutral-500'}`}
                    onClick={() => setActiveTab('write')}
                    type="button"
                >
                    <Edit3 size={16} /> 写作
                </button>
                <button
                    className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'preview' ? 'text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100' : 'text-neutral-500'}`}
                    onClick={() => setActiveTab('preview')}
                    type="button"
                >
                    <Eye size={16} /> 预览
                </button>
            </div>

            {/* Editor & Preview */}
            <div className="flex flex-1 overflow-hidden">
                {/* Write Pane */}
                <div className={`${activeTab === 'preview' ? 'hidden' : 'flex'} md:flex flex-1 flex-col min-w-0 border-r border-neutral-200 dark:border-neutral-800 relative group`}>
                    {/* Toolbar */}
                    <div className="flex items-center gap-0.5 border-b border-neutral-200 dark:border-neutral-800 px-2 py-1.5 overflow-x-auto bg-neutral-50 dark:bg-neutral-900/50 shrink-0">
                        <button type="button" onClick={() => handleFormat('**', '**')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="加粗"><Bold size={16} /></button>
                        <button type="button" onClick={() => handleFormat('*', '*')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="斜体"><Italic size={16} /></button>
                        <button type="button" onClick={() => handleFormat('~~', '~~')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="删除线"><Strikethrough size={16} /></button>
                        <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>
                        <button type="button" onClick={() => handleFormat('# ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="一级标题"><Heading1 size={16} /></button>
                        <button type="button" onClick={() => handleFormat('## ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="二级标题"><Heading2 size={16} /></button>
                        <button type="button" onClick={() => handleFormat('### ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="三级标题"><Heading3 size={16} /></button>
                        <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>
                        <button type="button" onClick={() => handleFormat('[', '](url)')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="链接"><LinkIcon size={16} /></button>
                        <label className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer" title="上传本地图片">
                            <ImageIcon size={16} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                        </label>
                        <button type="button" onClick={() => handleFormat('![alt](', ')')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="插入外链图片"><LinkIcon size={16} className="rotate-45" /></button>
                        <button type="button" onClick={() => handleFormat('> ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="引用块"><Quote size={16} /></button>
                        <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>
                        <button type="button" onClick={() => handleFormat('`', '`')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="行内代码"><Code size={16} /></button>
                        <button type="button" onClick={() => handleFormat('```\n', '\n```')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="代码块"><Braces size={16} /></button>
                        <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>
                        <button type="button" onClick={() => handleFormat('- ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="无序列表"><List size={16} /></button>
                        <button type="button" onClick={() => handleFormat('1. ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="有序列表"><ListOrdered size={16} /></button>
                        <button type="button" onClick={() => handleFormat('- [ ] ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="任务列表"><ListChecks size={16} /></button>
                        <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>
                        <button type="button" onClick={() => handleFormat('\n---\n', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="分隔线"><Minus size={16} /></button>
                        <button type="button" onClick={() => handleFormat('\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| ', ' |  |  |\n')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="插入表格"><Table size={16} /></button>
                    </div>
                    <div className="absolute top-[52px] right-4 opacity-0 group-focus-within:opacity-100 transition-opacity flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs text-neutral-500 dark:text-neutral-400 font-medium z-10 pointer-events-none">
                        MD 支持剪贴板传图
                    </div>
                    <textarea
                        id="md-content"
                        className="flex-1 w-full p-6 font-mono text-sm leading-relaxed resize-none bg-transparent focus:outline-none placeholder:text-neutral-400 break-words"
                        placeholder={placeholder || 'Markdown 正文...'}
                        value={content}
                        onChange={(e) => onChange(e.target.value)}
                        onPaste={handlePaste}
                    />
                </div>

                {/* Preview Pane */}
                <div className={`${activeTab === 'write' ? 'hidden' : 'flex'} md:flex flex-1 flex-col overflow-y-auto bg-neutral-50 dark:bg-[#121212]`}>
                    <div className="p-8 h-full">
                        {content ? (
                            <div className="prose prose-neutral md:prose-sm lg:prose-base xl:prose-lg min-w-full dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl break-words">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                    rehypePlugins={[rehypeRaw]}
                                    components={{
                                        pre: ({ node, ...props }) => <PreBlock {...props} />,
                                        table: ({ node, ...props }) => (
                                            <div className="w-full overflow-x-auto my-6 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                                                <table {...props} className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800" />
                                            </div>
                                        ),
                                        iframe: ({ node, ...props }) => {
                                            let src = props.src || ''
                                            if (src) {
                                                try {
                                                    const url = new URL(src.startsWith('//') ? `https:${src}` : src)
                                                    if (url.searchParams.has('autoplay')) {
                                                        url.searchParams.set('autoplay', '0')
                                                    } else {
                                                        url.searchParams.append('autoplay', '0')
                                                    }
                                                    if (src.includes('bilibili.com')) {
                                                        url.searchParams.set('high_quality', '1')
                                                    }
                                                    src = url.toString()
                                                } catch {
                                                    const connector = src.includes('?') ? '&' : '?'
                                                    if (!src.includes('autoplay=')) {
                                                        src = `${src}${connector}autoplay=0`
                                                    } else {
                                                        src = src.replace(/autoplay=[^&]*/, 'autoplay=0')
                                                    }
                                                }
                                            }
                                            return <iframe {...props} src={src} className="w-full aspect-video rounded-lg my-4" allowFullScreen />
                                        }
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
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
    )
}
