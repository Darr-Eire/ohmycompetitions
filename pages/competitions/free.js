    import CompetitionCard from '@/components/CompetitionCard'
    export default function AllFreeCompsPage() {const freeComps = [
    { comp:{slug:'pi-day-freebie', entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-06T20:00:00Z'}, title:'Pi‑Day Freebie', href:'/competitions/pi-day-freebie', prize:'Special Badge', fee:'Free', imageUrl:'/images/freebie.png', theme:'green' },
    { comp:{slug:'everyone-wins',   entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-10T18:00:00Z'}, title:"Everyone Wins",    href:'/competitions/everyones-a-winner', prize:'9,999 / 5,555 / 1,111 π', fee:'Free', imageUrl:'/images/everyone.png', theme:'green' },
    { comp:{slug:'weekly-giveaway', entryFee:0, totalTickets:5000,  ticketsSold:0, endsAt:'2025-05-05T23:59:59Z'}, title:'Weekly Giveaway',  href:'/competitions/weekly-pi-giveaway', prize:'1,000 π', fee:'Free', imageUrl:'/images/weekly.png', theme:'green' },
    { comp:{slug:'pi-miners-bonanza', entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-06T20:00:00Z'}, title:'Pi Miners Bonanza', href:'/competitions/pi-miners-bonanza', prize:'Special Badge', fee:'Free', imageUrl:'/images/freebie.png', theme:'green' },
    { comp:{slug:'pi-nugget-giveaway',   entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-10T18:00:00Z'}, title:"Pi Nugget Giveaway",    href:'/competitions/pi-nugget-giveaway', prize:'9,999 / 5,555 / 1,111 π', fee:'Free', imageUrl:'/images/everyone.png', theme:'green' },
    { comp:{slug:'free-for-all', entryFee:0, totalTickets:5000,  ticketsSold:0, endsAt:'2025-05-05T23:59:59Z'}, title:'Free For All',  href:'/competitions/free-for-all', prize:'1,000 π', fee:'Free', imageUrl:'/images/weekly.png', theme:'green' },
    { comp:{slug:'freebie-frenzy', entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-06T20:00:00Z'}, title:'Freebie Frenzy', href:'/competitions/freebie-frenzy', prize:'Special Badge', fee:'Free', imageUrl:'/images/freebie.png', theme:'green' },]
        return (
          <main className="pt-4 pb-10 px-4">
            {/* Title moved up (pt-4) and in white */}
            <h1
              className="category-page-title text-center text-2xl font-bold mb-6 text-white"
              style={{ marginTop: 0 }}
            >
              All Tech Giveaways
            </h1>
      
            {/* Always 3 columns */}
            <div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {techComps.map(item => (
                <CompetitionCard
                  key={item.comp.slug}
                  {...item}
                  theme="orange"
                  small
                />
              ))}
            </div>
          </main>
        )
      }