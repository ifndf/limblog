import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="mt-12 space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight">你好，我是 Lim.</h1>

        <div className="prose prose-neutral dark:prose-invert">
          <p>
            欢迎来到我的极简博客！这是一个受到 Bear Blog 启发的轻量级动态博客架构。
            在这里，你可以随时快速写作，记录技术心得或生活点滴。
          </p>
          <p>
            我们主旨在于“回归文字本身”：摒弃了花哨的动画与复杂的分类流，给你提供一个最纯粹、最安静的阅读与创作空间。
          </p>
          <p>
            点击上方的 <Link href="/blog">博客</Link> 可以查看我的全部文章列表。
            所有的代码都是由我自己从零搭建（包括极简的管理后台）。你可以随时在这个页面编辑关于你自己的独特介绍。
          </p>
        </div>
      </section>

      <section className="space-y-4 pt-6">
        <h2 className="text-xl font-bold">我的重点小册</h2>
        <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
          <li><Link href="/mock-post-1" className="hover:underline">构建极简博客背后的设计哲学</Link></li>
          <li>如何基于 Next.js + Server Actions 把全栈做轻</li>
          <li>关于摄影与我的一些瞬间</li>
        </ul>
      </section>

      <section className="space-y-4 pt-6">
        <h2 className="text-xl font-bold">联系我</h2>
        <div className="flex gap-4">
          <a href="https://github.com/yourname" target="_blank" rel="noopener noreferrer" className="hover:underline text-neutral-600 dark:text-neutral-400">GitHub</a>
          <a href="https://twitter.com/yourname" target="_blank" rel="noopener noreferrer" className="hover:underline text-neutral-600 dark:text-neutral-400">Twitter</a>
          <a href="mailto:your.email@example.com" className="hover:underline text-neutral-600 dark:text-neutral-400">Email</a>
        </div>
      </section>
    </div>
  )
}
