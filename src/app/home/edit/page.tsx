'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { Eye, Edit3, Save, Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, Link as LinkIcon, Image as ImageIcon, Quote, Code, Braces, List, ListOrdered, ListChecks, Minus, Table } from 'lucide-react'
import PreBlock from '@/components/PreBlock'

export default function EditHomePage() {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

    const router = useRouter()

    useEffect(() => {
        async function loadConfig() {
            try {
                const res = await fetch('/api/site-config')
                if (!res.ok) throw new Error('获取配置失败')
                const data = await res.json()
                
                const defaultHomeContent = `
Hello, 这是 LimBlog 主页！

在这里，你可以随时快速写作，记录技术心得或生活点滴。

我们主旨在于“回归文字本身”：摒弃了花哨的动画与复杂的分类流，给你提供一个最纯粹、最安静的阅读与创作空间。

点击上方的 [博客](/blog) 可以查看全部文章列表。

你可以随时登入 [后台](/login) 页面编辑关于你自己的独特介绍。

开始你的文字之旅吧！

---

Hello, this is the **LimBlog** homepage!

Here, you can quickly write and record technical insights or life moments at any time.

Our mission is to **"Return to the essence of writing"**: discarding fancy animations and complex categorization to provide you with the purest and quietest space for reading and creating.

Click on [Blog](/blog) above to view the full list of articles.

You can log in to the [Admin](/login) page at any time to edit your own unique introduction.

Start your writing journey now!
                `
                setContent(data.home_content?.trim() || defaultHomeContent.trim())
            } catch (err: any) {
                setError(err.message)
            } finally {
                setFetching(false)
            }
        }
        loadConfig()
    }, [])

    const handleSubmit = async () => {
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/site-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ home_content: content }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '更新失败')
            }

            router.push('/')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

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

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault()
                const file = items[i].getAsFile()
                if (file) {
                    const url = await uploadImage(file)
                    if (url) {
                        insertTextAtCursor(`![${file.name}](${url})\n`)
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
                insertTextAtCursor(`![${file.name}](${url})\n`)
            } else {
                alert('图片上传失败')
            }
        }
        e.target.value = ''
    }

    const insertTextAtCursor = (textToInsert: string) => {
        const textarea = document.getElementById('content') as HTMLTextAreaElement;
        if (!textarea) {
            setContent((prev) => prev + textToInsert);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = content.substring(0, start);
        const after = content.substring(end);

        setContent(before + textToInsert + after);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + textToInsert.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }

    const handleFormat = (prefix: string, suffix: string = '') => {
        const textarea = document.getElementById('content') as HTMLTextAreaElement
        if (!textarea) return
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = content.substring(0, start)
        const selected = content.substring(start, end)
        const after = content.substring(end)
        setContent(before + prefix + selected + suffix + after)
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + prefix.length, end + prefix.length)
        }, 0)
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-neutral-500">加载中...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-[calc(100dvh-140px)] md:h-[calc(100vh-140px)] h-auto max-w-[1400px] w-full mx-auto px-5 gap-6 pb-10 md:pb-0 font-sans">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">编辑主页内容</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                        <Save size={16} />
                        {loading ? '保存中...' : '保存更改'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm shrink-0 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Editor & Preview */}
            <div className="flex-1 flex flex-col border border-neutral-300 rounded-xl overflow-hidden dark:border-neutral-700 bg-white dark:bg-neutral-900 min-h-[500px] md:min-h-0">
                {/* Mobile Tabs */}
                <div className="flex border-b border-neutral-200 dark:border-neutral-800 md:hidden bg-neutral-50 dark:bg-neutral-950">
                    <button
                        className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'write' ? 'text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100' : 'text-neutral-500'}`}
                        onClick={() => setActiveTab('write')}
                    >
                        <Edit3 size={16} /> 编辑
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'preview' ? 'text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100' : 'text-neutral-500'}`}
                        onClick={() => setActiveTab('preview')}
                    >
                        <Eye size={16} /> 预览
                    </button>
                </div>

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
                            <button type="button" onClick={() => handleFormat('> ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="引用"><Quote size={16} /></button>
                            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>
                            <button type="button" onClick={() => handleFormat('`', '`')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="行内代码"><Code size={16} /></button>
                            <button type="button" onClick={() => handleFormat('```\n', '\n```')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="代码块"><Braces size={16} /></button>
                            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>
                            <button type="button" onClick={() => handleFormat('- ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="无序列表"><List size={16} /></button>
                            <button type="button" onClick={() => handleFormat('1. ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="有序列表"><ListOrdered size={16} /></button>
                            <button type="button" onClick={() => handleFormat('- [ ] ', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="任务列表"><ListChecks size={16} /></button>
                            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0"></div>
                            <button type="button" onClick={() => handleFormat('\n---\n', '')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="分隔线"><Minus size={16} /></button>
                            <button type="button" onClick={() => handleFormat('\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| ', ' |  |  |\n')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors" title="表格"><Table size={16} /></button>
                        </div>
                        <div className="absolute top-[52px] right-4 opacity-0 group-focus-within:opacity-100 transition-opacity flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs text-neutral-500 dark:text-neutral-400 font-medium z-10 pointer-events-none">
                            MD 支持剪贴板传图
                        </div>
                        <textarea
                            id="content"
                            required
                            onPaste={handlePaste}
                            className="flex-1 w-full p-6 font-mono text-sm leading-relaxed resize-none bg-transparent focus:outline-none placeholder:text-neutral-400 break-words"
                            placeholder="Markdown 正文..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
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
                                                        const url = new URL(src.startsWith('//') ? `https://${src}` : src)
                                                        if (url.searchParams.has('autoplay')) {
                                                            url.searchParams.set('autoplay', '0')
                                                        } else {
                                                            url.searchParams.append('autoplay', '0')
                                                        }
                                                        if (src.includes('bilibili.com')) {
                                                            url.searchParams.set('high_quality', '1')
                                                        }
                                                        src = url.toString()
                                                    } catch (e) {
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
        </div>
    )
}
