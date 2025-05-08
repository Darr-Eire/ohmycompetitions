// components/CompetitionCard.js

import Image from 'next/image'

export default function CompetitionCard({ title, imageUrl, endsAt, entryFee, totalTickets, ticketsSold }) {
  return (
    <div className="flex flex-col w-[260px] sm:w-[230px] md:w-[200px] mx-auto h-full bg-[#0f172a] border border-cyan-600 rounded-xl shadow-lg text-white font-orbitron overflow-hidden transition-all duration-300 hover:scale-[1.03]">
      <div className="relative w-full h-40 sm:h-36 md:h-32">
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-xl"
          priority
        />
      </div>

      <div className="flex flex-col justify-between p-4 space-y-2 flex-1">
        <h3 className="text-lg sm:text-base font-bold text-center">{title}</h3>

        <div className="text-sm sm:text-xs text-center">
          <p>🎟 Tickets Sold: {ticketsSold} / {totalTickets}</p>
          <p>💰 Entry Fee: {entryFee} π</p>
        </div>

        <div className="text-xs text-center text-gray-400">
          Ends At: {new Date(endsAt).toLocaleString()}
        </div>

        <button className="mt-auto bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-md text-sm">
          Enter Now
        </button>
      </div>
    </div>
  )
}
