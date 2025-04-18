import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
// scripts/seedCompetitions.ts
await prisma.competition.create({
  data: {
    title: '1000 Pi Giveaway',
    slug: '1000-pi-giveaway',
    imageUrl: '/pi.jpeg', // ✅ points to /public/pi-1000.png
    ticketsToSell: 1000,
    ticketsSold: 0,
    entryFee: 1,
    endDate: new Date('2025-05-01T15:14:00Z'),
    description: 'Win 1000 Pi for free!',
  },
})



  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
