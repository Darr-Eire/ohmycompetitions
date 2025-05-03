    import CompetitionCard from '@/components/CompetitionCard'
    export default function AllFreeCompsPage() {const freeComps = [
    { comp:{slug:'pi-day-freebie', entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-06T20:00:00Z'}, title:'Pi‑Day Freebie', href:'/competitions/pi-day-freebie', prize:'Special Badge', fee:'Free', imageUrl:'/images/freebie.png', theme:'green' },
    { comp:{slug:'everyone-wins',   entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-10T18:00:00Z'}, title:"Everyone Wins",    href:'/competitions/everyones-a-winner', prize:'9,999 / 5,555 / 1,111 π', fee:'Free', imageUrl:'/images/everyone.png', theme:'green' },
    { comp:{slug:'weekly-giveaway', entryFee:0, totalTickets:5000,  ticketsSold:0, endsAt:'2025-05-05T23:59:59Z'}, title:'Weekly Giveaway',  href:'/competitions/weekly-pi-giveaway', prize:'1,000 π', fee:'Free', imageUrl:'/images/weekly.png', theme:'green' },
    { comp:{slug:'pi-day-freebie', entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-06T20:00:00Z'}, title:'Pi‑Day Freebie', href:'/competitions/pi-day-freebie', prize:'Special Badge', fee:'Free', imageUrl:'/images/freebie.png', theme:'green' },
    { comp:{slug:'everyone-wins',   entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-10T18:00:00Z'}, title:"Everyone Wins",    href:'/competitions/everyones-a-winner', prize:'9,999 / 5,555 / 1,111 π', fee:'Free', imageUrl:'/images/everyone.png', theme:'green' },
    { comp:{slug:'weekly-giveaway', entryFee:0, totalTickets:5000,  ticketsSold:0, endsAt:'2025-05-05T23:59:59Z'}, title:'Weekly Giveaway',  href:'/competitions/weekly-pi-giveaway', prize:'1,000 π', fee:'Free', imageUrl:'/images/weekly.png', theme:'green' },
    { comp:{slug:'pi-day-freebie', entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-06T20:00:00Z'}, title:'Pi‑Day Freebie', href:'/competitions/pi-day-freebie', prize:'Special Badge', fee:'Free', imageUrl:'/images/freebie.png', theme:'green' },
    { comp:{slug:'everyone-wins',   entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-10T18:00:00Z'}, title:"Everyone Wins",    href:'/competitions/everyones-a-winner', prize:'9,999 / 5,555 / 1,111 π', fee:'Free', imageUrl:'/images/everyone.png', theme:'green' },]
     return (
     <main className="py-10 px-4"><h1 className="category-page-title text-center text-2xl font-bold mb-6">
     All Free Competitions
    </h1><div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
     {freeComps.map(item => (
    <CompetitionCard key={item.comp.slug} {...item} small />))}</div></main> )}
