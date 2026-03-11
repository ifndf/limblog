const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD || '123456'

    const existingUser = await prisma.user.findUnique({
        where: { username }
    })

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })
        console.log(`Created admin user with username: ${username} and password: ${password}`)
    } else {
        console.log(`Admin user ${username} already exists`)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
