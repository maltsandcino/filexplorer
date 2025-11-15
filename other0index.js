const { PrismaClient } = require('./generated/prisma')

const prisma = new PrismaClient()

async function main() {


  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true,
    },
  })

  const posts = await prisma.post.findMany()
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