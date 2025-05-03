// components/Carousel.js
'use client'

import { useRef, useState, useEffect } from 'react'
import React from 'react'

export default function Carousel({ children }) {
  const ref = useRef(null)
  const [page, setPage] = useState(0)

  // Track which “page” (card) you’re on
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onScroll = () => {
      const style = getComputedStyle(el)
      const gap   = parseFloat(style.gap)
      const firstWidth = el.firstElementChild.getBoundingClientRect().width
      const cardWidth  = firstWidth + gap
      setPage(Math.round(el.scrollLeft / cardWidth))
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Friction for touch-drag on mobile
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const FRICTION = 0.3
    let startX = 0
    let startScroll = 0

    const onTouchStart = (e) => {
      startX = e.touches[0].pageX
      startScroll = el.scrollLeft
    }

    const onTouchMove = (e) => {
      const delta = startX - e.touches[0].pageX
      el.scrollLeft = startScroll + delta * FRICTION
      e.preventDefault() // stop native inertia
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
    }
  }, [])

  const scrollByOffset = (offset) => {
    ref.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const scrollToPage = (pageIndex) => {
    const el = ref.current
    if (!el) return
    const style = getComputedStyle(el)
    const gap   = parseFloat(style.gap)
    const firstWidth = el.firstElementChild.getBoundingClientRect().width
    const cardWidth  = firstWidth + gap
    el.scrollTo({ left: pageIndex * cardWidth, behavior: 'smooth' })
  }

  return (
    <div className="relative">
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
