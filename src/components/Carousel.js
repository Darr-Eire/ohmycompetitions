'use client'

import { useRef, useState, useEffect } from 'react'
import React from 'react'

export default function Carousel({ children }) {
  const ref = useRef(null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onScroll = () => {
      const cardWidth =
        el.firstElementChild.getBoundingClientRect().width +
        parseFloat(getComputedStyle(el).gap)
      const newPage = Math.round(el.scrollLeft / cardWidth)
      setPage(newPage)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollByOffset = (offset) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const scrollToPage = (pageIndex) => {
    if (ref.current) {
      const el = ref.current
      const cardWidth =
        el.firstElementChild.getBoundingClientRect().width +
        parseFloat(getComputedStyle(el).gap)
      el.scrollTo({ left: pageIndex * cardWidth, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative">
      {/* arrows */}
      <button
        onClick={() => scrollByOffset(-ref.current.clientWidth)}
        className="carousel-arrow left"
      >
        ‹
      </button>
      <button
        onClick={() => scrollByOffset(ref.current.clientWidth)}
        className="carousel-arrow right"
      >
        ›
      </button>

      {/* track */}
      <div
        ref={ref}
        className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar px-4 sm:px-0"
      >
        {children}
      </div>

      {/* dots */}
      <div className="carousel-dots flex justify-center mt-4 space-x-2">
        {React.Children.map(children, (_, i) => (
          <button
            key={i}
            className={`dot ${i === page ? 'active' : ''}`}
            onClick={() => scrollToPage(i)}
          />
        ))}
      </div>
    </div>
  )
}
