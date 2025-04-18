import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 🧹 Clear existing competition with same slug
  await prisma.competition.deleteMany({
    where: { slug: '1000-pi-giveaway' },
  })

  // ✅ Now safely seed it
  await prisma.competition.create({
    data: {
      title: '1000 Pi Giveaway',
      slug: '1000-pi-giveaway',
      imageUrl: '/pi.jpeg',
      ticketsToSell: 1000,
      ticketsSold: 0,
      entryFee: 0.314,
      endDate: new Date('2025-05-01T15:14:00Z'),
      description: 'Enter now to win 1000 Pi! One lucky winner will be announced after the competition ends.',
    },
  })

  console.log('Seeded: 1000 Pi Giveaway ✅')
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
