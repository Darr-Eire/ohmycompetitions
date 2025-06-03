// /lib/streak.js

export function updateDailyStreak(key = 'dailyStreak') {
    const today = new Date().toDateString()
    const stored = JSON.parse(localStorage.getItem(key)) || {}
  
    if (stored.lastDate === today) return stored.streak // already counted today
  
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const newStreak = stored.lastDate === yesterday ? (stored.streak || 0) + 1 : 1
  
    const updated = {
      lastDate: today,
      streak: newStreak,
    }
  
    localStorage.setItem(key, JSON.stringify(updated))
    return newStreak
  }
  
  export function getStreak(key = 'dailyStreak') {
    if (typeof window === 'undefined') {
      return 0; // server-side: return default safely
    }
    const stored = JSON.parse(localStorage.getItem(key)) || {}
    return stored.streak || 0
  }
  

  