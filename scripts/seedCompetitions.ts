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
      slug: '1000-pi-giveaway',
      title: '1000 Pi Giveaway',
      ticketsSold: 0,
      totalTickets: 1000,
      entryFee: "0.314", // 👈 Fix here
      endDate: new Date('2025-05-01T15:14:00Z'),
      description: 'Enter now to win 1000 Pi! One lucky winner will be announced after the competition ends.',
      image: '/pi.jpeg',
    },
  })
  

  console.log('Seeded: 1000 Pi Giveaway ✅')
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
