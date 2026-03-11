import Link from 'next/link'
import prisma from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'

export default async function Home() {
  const configs = await prisma.siteConfig.findMany()
  const siteConfig: Record<string, string> = {}
  for (const c of configs) {
    siteConfig[c.key] = c.value
  }

  const defaultHomeContent = `
欢迎来到我的极简博客！这是一个受到 Bear Blog 启发的轻量级动态博客架构。
在这里，你可以随时快速写作，记录技术心得或生活点滴。

我们主旨在于“回归文字本身”：摒弃了花哨的动画与复杂的分类流，给你提供一个最纯粹、最安静的阅读与创作空间。

点击上方的 [博客](/blog) 可以查看我的全部文章列表。
所有的代码都是由我自己从零搭建（包括极简的管理后台）。你可以随时在这个页面编辑关于你自己的独特介绍。
  `

  const homeContent = siteConfig.home_content?.trim() || defaultHomeContent

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-0 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="mt-12 space-y-6">
        <div className="prose prose-neutral dark:prose-invert mt-8">
          <ReactMarkdown>{homeContent}</ReactMarkdown>
        </div>
      </section>



      <section className="pt-6">
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">联系我</span>
          {siteConfig.contact_github && (
            <a href={siteConfig.contact_github} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 hover:text-blue-600 dark:hover:text-blue-400">
              GitHub
            </a>
          )}
          {siteConfig.contact_twitter && (
            <a href={siteConfig.contact_twitter} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 hover:text-blue-600 dark:hover:text-blue-400">
              Twitter
            </a>
          )}
          {siteConfig.contact_mail && (
            <a href={`mailto:${siteConfig.contact_mail}`} className="text-sm underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 hover:text-blue-600 dark:hover:text-blue-400">
              Email
            </a>
          )}
          {!siteConfig.contact_github && !siteConfig.contact_twitter && !siteConfig.contact_mail && (
            <span className="text-sm text-neutral-400">（暂无）</span>
          )}
        </div>
      </section>
    </div>
  )
}
