'use client'
import { useRef, useEffect, useState } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

export default function AllCompetitions() {
  const carouselRef = useRef(null)
  const [competitions, setCompetitions] = useState([])

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const res = await fetch('/api/competitions')
    const data = await res.json()
    setCompetitions(data)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this competition?')) return
    const res = await fetch(`/api/competitions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      // remove locally
      setCompetitions(comps => comps.filter(c => c._id !== id))
    } else {
      alert('Delete failed')
    }
  }

  return (
    <main>… 
      <div ref={carouselRef} className="flex overflow-x-auto">
        {competitions.map(comp => (
          <CompetitionCard
            key={comp._id}
            title={comp.title}
            prize={comp.prize}
            fee={`${comp.entryFee ?? 0} π`}
            href={`/competitions/${comp.slug}`}
            small
          >
            <button
              onClick={() => handleDelete(comp._id)}
              className="mt-2 text-red-500 hover:underline text-sm"
            >
              Delete
            </button>
          </CompetitionCard>
        ))}
      </div>
    </main>
  )
}
