const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const adminUser = await prisma.user.findFirst()
    if (!adminUser) {
        console.error('请先创建 admin user')
        return
    }

    for (let i = 1; i <= 25; i++) {
        const slug = `mock-post-${i}`
        const existing = await prisma.post.findUnique({ where: { slug } })
        if (!existing) {
            await prisma.post.create({
                data: {
                    title: `用于测试分页的样例文章 #${i}`,
                    slug,
                    content: `这是第 ${i} 篇用来测试分页和长列表的随机生成的废话文档。\n\n## 章节\n可以看到这里的 Markdown 支持如何处理长文本页面内容。`,
                    authorId: adminUser.id,
                    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24), // each post is 1 day older
                }
            })
        }
    }
    console.log('25 test posts created.')
}

main()
    .then(async () => await prisma.$disconnect())
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
