'use client'

import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FaThumbsUp, FaArrowLeft, FaLock, FaCheckCircle } from 'react-icons/fa'
import { usePiAuth } from '../../context/PiAuthContext'

export default function PioneerVotePage() {
  const { user, loginWithPi } = usePiAuth()
  const [nominations, setNominations] = useState([])
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState({})
  const [userVote, setUserVote] = useState(null) // Track what user has voted for

  useEffect(() => {
    const fetchNominations = async () => {
      try {
        const res = await fetch('/api/nominations')
        const data = await res.json()
        setNominations(data)
      } catch (err) {
        console.error('Failed to fetch nominations:', err)
      }
      setLoading(false)
    }

    fetchNominations()
  }, [])

  // Check if user has already voted
  useEffect(() => {
    const checkUserVote = async () => {
      if (!user) return

      const userUid = user.uid || user.piUserId || user._id?.toString()
      if (!userUid) return

      try {
        const res = await fetch(`/api/user-vote?userUid=${userUid}`)
        if (res.ok) {
          const voteData = await res.json()
          setUserVote(voteData.nomineeName)
        }
      } catch (err) {
        console.error('Error checking user vote:', err)
      }
    }

    checkUserVote()
  }, [user])

  const handleVote = async (nomineeName, index) => {
    if (!user) {
      alert('Please login with Pi to vote')
      return loginWithPi()
    }

    if (userVote) {
      alert(`You have already voted for ${userVote}. You can only vote once per voting period.`)
      return
    }

    if (voting[nomineeName]) return // Prevent double-clicking

    // Get user ID - try multiple possible fields
    const userUid = user.uid || user.piUserId || user._id?.toString()
    
    console.log('🔍 Vote attempt:', { 
      nomineeName, 
      userUid, 
      user: {
        username: user.username,
        uid: user.uid,
        piUserId: user.piUserId,
        _id: user._id
      }
    })

    if (!userUid) {
      alert('❌ User ID not found. Please try logging in again.')
      return
    }

    setVoting(prev => ({ ...prev, [nomineeName]: true }))

    try {
      const res = await fetch('/api/pioneer-nomination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: nomineeName, 
          action: 'vote',
          userUid: userUid
        }),
      })

      const result = await res.json()
      
      console.log('📝 Vote response:', { status: res.status, result })
      
      if (res.ok) {
        // Update the vote count in the local state
        setNominations(prev => 
          prev.map((nom, i) => 
            i === index 
              ? { ...nom, votes: (nom.votes || 0) + 1 }
              : nom
          )
        )
        setUserVote(nomineeName) // Mark that user has voted
        alert(`✅ Vote recorded for ${nomineeName}! You can only vote once per voting period.`)
      } else {
        if (res.status === 409) {
          if (result.previousVote) {
            setUserVote(result.previousVote)
            alert(`⚠️ You have already voted for ${result.previousVote}!`)
          } else {
            alert('⚠️ ' + result.error)
          }
        } else {
          alert('❌ Error: ' + result.error)
        }
      }
    } catch (err) {
      console.error('Vote error:', err)
      alert('❌ Failed to record vote')
    }

    setVoting(prev => ({ ...prev, [nomineeName]: false }))
  }

  return (
    <>
      <Head>
        <title>Pioneer of the Week | Vote Now</title>
      </Head>

      <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
        <div className="max-w-3xl mx-auto border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white px-6 py-4 rounded-xl shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400 inline-block">
              Vote for Pioneer of the Week
            </h1>
          </div>

          {/* Authentication Status */}
          {!user && (
            <div className="text-center mb-6 p-4 border border-yellow-400 rounded-lg bg-yellow-400/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaLock className="text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Login Required</span>
              </div>
              <p className="text-white text-sm mb-4">
                You must be logged in with Pi Network to vote for nominees.
              </p>
              <button
                onClick={loginWithPi}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-6 py-2 rounded-full transition"
              >
                Login with Pi
              </button>
            </div>
          )}

          {user && !userVote && (
            <div className="text-center mb-6 p-3 border border-green-400 rounded-lg bg-green-400/10">
              <span className="text-green-400 text-sm">
                ✅ Logged in as {user.username} - You can vote once!
              </span>
            </div>
          )}

          {user && userVote && (
            <div className="text-center mb-6 p-3 border border-blue-400 rounded-lg bg-blue-400/10">
              <div className="flex items-center justify-center gap-2">
                <FaCheckCircle className="text-blue-400" />
                <span className="text-blue-400 text-sm">
                  You have voted for <strong>{userVote}</strong>
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">You can only vote once per voting period</p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center mb-6">
            <p className="text-white text-sm">
              Vote for the Pioneer you think deserves recognition this week! <strong>You can only vote once total.</strong>
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <p className="text-center text-white">Loading nominations...</p>
          ) : nominations.length === 0 ? (
            <div className="text-center">
              <p className="text-white mb-4">No nominations yet. Be the first to nominate someone!</p>
              <Link href="/forums">
                <button className="btn-gradient px-6 py-2 rounded-full">
                  Submit a Nomination
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {nominations.map((entry, i) => (
                <div
                  key={i}
                  className="border border-cyan-600 rounded-xl bg-[#0f172a]/60 p-6 shadow-[0_0_20px_#00fff044] backdrop-blur-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-bold text-cyan-300">{entry.nominee}</h2>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold text-lg">
                        {entry.votes || 0} votes
                      </div>
                      {userVote === entry.nominee && (
                        <div className="text-blue-400 text-xs mt-1">
                          ✓ Your vote
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-white mb-4">{entry.reason}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      Nominated on {new Date(entry.createdAt).toLocaleDateString()}
                    </div>
                    
                    <button
                      onClick={() => handleVote(entry.nominee, i)}
                      disabled={!user || voting[entry.nominee] || userVote}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                        !user 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : userVote
                          ? 'bg-gray-600 cursor-not-allowed'
                          : voting[entry.nominee] 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      }`}
                    >
                      <FaThumbsUp />
                      {!user 
                        ? 'Login to Vote' 
                        : userVote 
                        ? 'Already Voted' 
                        : voting[entry.nominee] 
                        ? 'Voting...' 
                        : 'Vote'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/forums">
              <button className="flex items-center gap-2 btn-gradient px-6 py-2 rounded-full">
                <FaArrowLeft />
                Back to Forums
              </button>
            </Link>
            
            <Link href="/forums/pioneer-of-the-week/celebrate">
              <button className="btn-gradient px-6 py-2 rounded-full">
                Current Pioneer
              </button>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
