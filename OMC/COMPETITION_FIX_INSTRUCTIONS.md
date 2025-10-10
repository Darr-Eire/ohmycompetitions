# 🚨 COMPETITION DATABASE SYNC FIX

## Problem
The `penthouse-stay` competition exists in static data (`src/data/competitions.js`) but is missing from the MongoDB database, causing 404 errors when users try to purchase tickets.

**Error Pattern:**
```
❌ Competition not found: penthouse-stay
```

## Immediate Solutions

### Option 1: Admin Panel (RECOMMENDED) ⭐
1. Visit `http://localhost:3000/admin/competitions/create`
2. Add the competition with these details:
   - **Slug**: `penthouse-stay`
   - **Title**: `Penthouse Stay`
   - **Prize**: `Penthouse Hotel Stay of your choice`
   - **Entry Fee**: `0.75`
   - **Total Tickets**: `3000`
   - **Theme**: `premium`
   - **Starts At**: `2025-06-20T21:00:00Z`
   - **Ends At**: `2025-08-20T21:00:00Z`
   - **Pi Amount**: `0.75`

### Option 2: Database Direct Insert
Run this MongoDB command directly:
```javascript
db.competitions.insertOne({
  comp: {
    slug: 'penthouse-stay',
    entryFee: 0.75,
    totalTickets: 3000,
    ticketsSold: 0,
    startsAt: '2025-06-20T21:00:00Z',
    endsAt: '2025-08-20T21:00:00Z',
    paymentType: 'pi',
    piAmount: 0.75,
    status: 'active'
  },
  title: 'Penthouse Stay',
  prize: 'Penthouse Hotel Stay of your choice',
  href: '/competitions/penthouse-stay',
  imageUrl: '/images/hotel.jpeg',
  theme: 'premium',
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Option 3: API Call
```bash
curl -X POST "http://localhost:3000/api/admin/competitions" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "penthouse-stay",
    "title": "Penthouse Stay", 
    "prize": "Penthouse Hotel Stay of your choice",
    "entryFee": 0.75,
    "totalTickets": 3000,
    "theme": "premium",
    "startsAt": "2025-06-20T21:00:00Z",
    "endsAt": "2025-08-20T21:00:00Z",
    "piAmount": 0.75
  }'
```

## Other Missing Competitions

These competitions also exist in static data but may be missing from database:

1. **First Class Flight** (`first-class-flight`)
2. **Weekend Getaway** (`weekend-getaway`) 
3. **Ray-Ban Meta Wayfarer** (`ray-ban`)
4. **Pi Giveaway 10k** (`pi-giveaway-10k`)
5. **Pi Giveaway 5k** (`pi-giveaway-5k`)
6. **Pi Giveaway 2.5k** (`pi-giveaway-2.5k`)
7. **Pi To The Moon** (`pi-to-the-moon`)

## Verification

After adding competitions, verify they work:

1. **Check Database:**
   ```javascript
   db.competitions.find({ "comp.slug": "penthouse-stay" })
   ```

2. **Test API:**
   ```
   GET http://localhost:3000/api/competitions/penthouse-stay
   ```

3. **Test Payment:**
   - Try purchasing a ticket for penthouse-stay
   - Should no longer show 404 error

## Long-term Solution

Create an automated sync between static data and database:

1. **Modify seed scripts** to pull from `src/data/competitions.js`
2. **Add database validation** in payment API to fall back to static data
3. **Create admin tool** to sync static data to database automatically

## Success Indicators

✅ No more `❌ Competition not found: penthouse-stay` in logs  
✅ `/api/competitions/penthouse-stay` returns competition data  
✅ Ticket purchases work without 404 errors  
✅ Competition appears in admin dashboard  

## Emergency Fallback

If none of the above work, modify the payment API to fall back to static data:

In `src/pages/api/pi/approve-payment.js`, add static data fallback after line 84:

```javascript
// If not found in database, check static data
if (!competition) {
  const { premiumItems } = require('../../../data/competitions');
  const staticComp = premiumItems.find(item => item.comp.slug === slug);
  if (staticComp) {
    competition = staticComp;
    console.log('✅ Found competition in static data:', slug);
  }
}
```

This ensures the system works even with missing database entries. 