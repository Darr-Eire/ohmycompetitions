// src/components/Carousel.js
'use client'

import { useRef, useState, useEffect } from 'react'

export default function Carousel({ children }) {
  const ref = useRef(null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const el = ref.current
    const onScroll = () => {
      const cardWidth = el.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(el).gap)
      const newPage = Math.round(el.scrollLeft / cardWidth)
      setPage(newPage)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative">
      {/* arrows */}
      <button onClick={() => ref.current.scrollBy({ left: -ref.current.clientWidth, behavior: 'smooth' })} className="carousel-arrow left">‹</button>
      <button onClick={() => ref.current.scrollBy({ left: ref.current.clientWidth, behavior: 'smooth' })} className="carousel-arrow right">›</button>

      {/* track */}
      <div ref={ref} className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar px-4 sm:px-0"
>
        {children}
      </div>

      {/* dots */}
      <div className="carousel-dots">
        {React.Children.map(children, (_, i) => (
          <button
            key={i}
            className={`dot ${i === page ? 'active' : ''}`}
            onClick={() => {
              const el = ref.current
              const cardWidth = el.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(el).gap)
              el.scrollTo({ left: i * cardWidth, behavior: 'smooth' })
            }}
          />
        ))}
      </div>
    </div>
  )
}
