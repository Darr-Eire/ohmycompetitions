// src/hooks/useUserTicketLimits.js
import { useState, useEffect } from 'react';
import { usePiAuth } from '../context/PiAuthContext';

export function useUserTicketLimits(competitionSlug, competition) {
  const { user } = usePiAuth();
  const [ticketData, setTicketData] = useState({
    currentCount: 0,
    limit: 50,
    remaining: 50,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchTicketLimits = async () => {
      // Check for user and get username from various possible fields
      const username = user?.username || user?.piUserId || user?.uid;
      
      if (!user || !username || !competitionSlug) {
        console.log('useUserTicketLimits: Skipping fetch - missing data:', {
          hasUser: !!user,
          hasUsername: !!username,
          hasCompetitionSlug: !!competitionSlug,
          user: user,
          availableFields: user ? Object.keys(user) : []
        });
        setTicketData({
          currentCount: 0,
          limit: 50,
          remaining: 50,
          loading: false,
          error: null
        });
        return;
      }

      try {
        setTicketData(prev => ({ ...prev, loading: true, error: null }));

        console.log('useUserTicketLimits: Fetching ticket data for:', {
          username: username,
          competitionSlug
        });

        // Get user's current ticket count for this competition
        const response = await fetch(`/api/user/tickets?username=${encodeURIComponent(username)}&slug=${encodeURIComponent(competitionSlug)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ticket data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log('useUserTicketLimits: Received ticket data:', {
          dataLength: Array.isArray(data) ? data.length : 'not array',
          data: data
        });
        
        // Calculate current count from user's tickets
        const currentCount = Array.isArray(data) ? data.reduce((total, ticket) => {
          if (ticket.competitionSlug === competitionSlug && !ticket.gifted) {
            return total + (ticket.quantity || 1);
          }
          return total;
        }, 0) : 0;

        // Determine limit
        let limit = 50; // default
        if (competition?.comp?.maxPerUser) {
          limit = competition.comp.maxPerUser;
        } else if (user?.maxTicketsDefault) {
          limit = user.maxTicketsDefault;
        } else if (user?.maxTicketsOverrides?.[competitionSlug]) {
          limit = user.maxTicketsOverrides[competitionSlug];
        }

        const remaining = Math.max(0, limit - currentCount);

        console.log('useUserTicketLimits: Calculated limits:', {
          currentCount,
          limit,
          remaining,
          competitionMaxPerUser: competition?.comp?.maxPerUser,
          userMaxTicketsDefault: user?.maxTicketsDefault
        });

        setTicketData({
          currentCount,
          limit,
          remaining,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching ticket limits:', error);
        setTicketData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchTicketLimits();
  }, [user, competitionSlug, competition]);

  return ticketData;
}
