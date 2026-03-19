import prisma from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { checkVisibility } from '@/lib/visibility'

export default async function FriendsPage() {
    await checkVisibility()
    const configs = await prisma.siteConfig.findMany()
    const siteConfig: Record<string, string> = {}
    for (const c of configs) {
        siteConfig[c.key] = c.value
    }

    const defaultFriendsContent = `
# Friends

这里是我的朋友们。排名不分先后！

---

目前还没有添加友链。你可以在后台的“站点配置”中进行添加。
    `

    const friendsContent = siteConfig.friends_content?.trim() || defaultFriendsContent

    return (
        <div className="max-w-2xl mx-auto px-5 lg:px-0 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <div className="prose prose-neutral dark:prose-invert min-w-full">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                        table: ({ node, ...props }) => (
                            <div className="w-full overflow-x-auto my-6 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                                <table {...props} className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800" />
                            </div>
                        ),
                    }}
                >
                    {friendsContent}
                </ReactMarkdown>
            </div>
        </div>
    )
}
