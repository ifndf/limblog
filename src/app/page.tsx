import Link from 'next/link'
import prisma from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

export default async function Home() {
  const configs = await prisma.siteConfig.findMany()
  const siteConfig: Record<string, string> = {}
  for (const c of configs) {
    siteConfig[c.key] = c.value
  }

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

  const homeContent = siteConfig.home_content?.trim() || defaultHomeContent

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-0 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="mt-4 space-y-6">
        <div className="prose prose-neutral dark:prose-invert">
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
            {homeContent}
          </ReactMarkdown>
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
