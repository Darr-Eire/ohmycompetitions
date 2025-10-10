import { useEffect, useState } from 'react';

export default function XPBalance({ username }) {
  const [xp, setXp] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/user/xp/balance?username=${encodeURIComponent(username)}`);
        if (res.ok) {
          const j = await res.json();
          if (mounted) setXp(j.xp || 0);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [username]);

  return (
    <span className="text-xs text-yellow-400">XP: {xp}</span>
  );
}

// src/components/XPBalance.jsx
'use client';

import { useState, useEffect } from 'react';

export default function XPBalance({ userId, username }) {
  const [xpData, setXpData] = useState({
    xp: 0,
    level: 1,
    nextLevelXP: 100,
    loading: true
  });

  useEffect(() => {
    if (!userId && !username) return;

    const fetchXP = async () => {
      try {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (username) params.append('username', username);
        
        const response = await fetch(`/api/user/xp/get?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setXpData({
            xp: data.xp || 0,
            level: data.level || 1,
            nextLevelXP: data.nextLevelXP || 100,
            loading: false
          });
        } else {
          setXpData(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error fetching XP:', error);
        setXpData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchXP();
  }, [userId, username]);

  if (xpData.loading) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-3">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/3 mb-2"></div>
          <div className="h-2 bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const progressToNext = xpData.nextLevelXP > 0 
    ? Math.min(100, (xpData.xp / xpData.nextLevelXP) * 100)
    : 0;

  return (
    <div className="bg-gray-800/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <span className="text-sm font-semibold text-white">XP Balance</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-cyan-400">{xpData.xp.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Level {xpData.level}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Progress to Level {xpData.level + 1}</span>
          <span>{xpData.xp} / {xpData.nextLevelXP}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressToNext}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        Earn XP by spending Pi and winning competitions
      </div>
    </div>
  );
}

