// components/CryptoGiveawayCard.jsx

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function CryptoGiveawayCard({ comp, title, prize, fee }) {
  return (
    <Link href={comp?.slug ? `/competitions/${comp.slug}` : '#'} className="block bg-white rounded-xl shadow hover:shadow-lg transition duration-300 p-4 text-center">
      <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
        <Image
          src={`/images/${comp?.slug}.png`} // fallback to a dynamic image or use static imageUrl
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{prize}</p>
      <p className="text-sm font-medium text-blue-500 mt-2">{fee}</p>
    </Link>
  )
}
