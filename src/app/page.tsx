import Link from 'next/link'
import prisma from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { Github, Twitter, Mail, Pencil } from 'lucide-react'
import { checkVisibility } from '@/lib/visibility'
import { getSession } from '@/lib/auth'

export default async function Home() {
  await checkVisibility()
  const configs = await prisma.siteConfig.findMany()
  const siteConfig: Record<string, string> = {}
  for (const c of configs) {
    siteConfig[c.key] = c.value
  }

  const session = await getSession()

  const defaultHomeContent = `Welcome to **LimBlog** — a minimalist space built for writing that matters.

Here you can capture technical insights, document your thinking, or jot down ideas worth keeping.

Browse the [Blog](/blog) for all posts, or head to [Admin](/login) to manage your content.

Less noise. More words.`

  const homeContent = siteConfig.home_content?.trim() || defaultHomeContent

  return (
    <div className="max-w-3xl mx-auto px-5 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
      {session && (
        <div className="flex justify-end mb-4 absolute top-0 right-5">
          <Link
            href="/home/edit"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Pencil size={14} />
            编辑
          </Link>
        </div>
      )}
      <section className={`space-y-6 ${session ? 'pt-12' : 'pt-4'}`}>
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
        <div className="flex gap-6 items-center">
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Get in touch</span>
          <div className="flex gap-4 items-center">
            {siteConfig.contact_github && (
              <a
                href={siteConfig.contact_github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                title="GitHub"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            )}
            {siteConfig.contact_twitter && (
              <a
                href={siteConfig.contact_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-sky-500 dark:text-neutral-400 dark:hover:text-sky-400 transition-colors"
                title="Twitter"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            )}
            {siteConfig.contact_mail && (
              <a
                href={`mailto:${siteConfig.contact_mail}`}
                className="text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
                title="Email"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            )}
            {!siteConfig.contact_github && !siteConfig.contact_twitter && !siteConfig.contact_mail && (
              <span className="text-sm text-neutral-400 font-normal">（暂无联系方式）</span>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
