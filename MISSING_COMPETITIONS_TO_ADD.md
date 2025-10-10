# 🎯 MISSING COMPETITIONS TO ADD

## How to Add
Go to: `http://localhost:3000/admin/competitions/create`

Fill in the form for each competition below and click "Create Competition".

---

## 1. Ray-Ban Meta Wayfarer
- **Slug**: `ray-ban`
- **Title**: `Ray-Ban Meta Wayfarer`
- **Prize**: `Ray-Ban Meta Wayfarer`
- **Entry Fee**: `0.60`
- **Total Tickets**: `2000`
- **Theme**: `tech`
- **Starts At**: `2025-07-05T13:30:00Z`
- **Ends At**: `2025-07-12T13:30:00Z`
- **Pi Amount**: `0.60`

---

## 2. First Class Flight
- **Slug**: `first-class-flight`
- **Title**: `First Class Flight`
- **Prize**: `Return flights to anywhere in the world`
- **Entry Fee**: `1`
- **Total Tickets**: `2500`
- **Theme**: `premium`
- **Starts At**: `2025-06-25T21:00:00Z`
- **Ends At**: `2025-08-25T21:00:00Z`
- **Pi Amount**: `1`

---

## 3. Weekend Getaway
- **Slug**: `weekend-getaway`
- **Title**: `Weekend Getaway`
- **Prize**: `€2,000 Travel Voucher`
- **Entry Fee**: `2.5`
- **Total Tickets**: `4000`
- **Theme**: `premium`
- **Starts At**: `2025-06-01T22:00:00Z`
- **Ends At**: `2025-08-01T22:00:00Z`
- **Pi Amount**: `2.5`

---

## 4. 10,000 Pi Giveaway
- **Slug**: `pi-giveaway-10k`
- **Title**: `10,000 Pi`
- **Prize**: `10,000 π`
- **Entry Fee**: `2.2`
- **Total Tickets**: `5200`
- **Theme**: `pi`
- **Starts At**: `2025-06-15T00:00:00Z`
- **Ends At**: `2025-08-31T00:00:00Z`
- **Pi Amount**: `2.2`

---

## 5. 5,000 Pi Giveaway
- **Slug**: `pi-giveaway-5k`
- **Title**: `5,000 Pi`
- **Prize**: `5,000 π`
- **Entry Fee**: `1.8`
- **Total Tickets**: `2900`
- **Theme**: `pi`
- **Starts At**: `2025-06-15T00:00:00Z`
- **Ends At**: `2025-09-01T00:00:00Z`
- **Pi Amount**: `1.8`

---

## 6. 2,500 Pi Giveaway
- **Slug**: `pi-giveaway-2.5k`
- **Title**: `2,500 Pi`
- **Prize**: `2,500 π`
- **Entry Fee**: `1.6`
- **Total Tickets**: `1600`
- **Theme**: `pi`
- **Starts At**: `2025-06-15T00:00:00Z`
- **Ends At**: `2025-09-02T00:00:00Z`
- **Pi Amount**: `1.6`

---

## 7. Pi To The Moon (FREE)
- **Slug**: `pi-to-the-moon`
- **Title**: `Pi To The Moon`
- **Prize**: `10,000 π`
- **Entry Fee**: `0`
- **Total Tickets**: `20000`
- **Theme**: `free`
- **Starts At**: `2025-08-20T18:00:00Z`
- **Ends At**: `2025-08-31T18:00:00Z`
- **Pi Amount**: `0`

---

## ✅ Already Added
- **penthouse-stay** ✅ (Successfully added - confirmed in logs)

---

## Verification Steps

After adding each competition:

1. **Check Admin Dashboard**: Visit `/admin/competitions` - should see the new competition
2. **Test API**: Visit `/api/competitions/[slug]` - should return competition data
3. **Check Homepage**: The competition should appear on the relevant page
4. **Test Purchase**: Try buying a ticket - should work without 404 errors

---

## Expected Final Count

After adding all 7 missing competitions, you should have:
- **Tech competitions**: 6 total (PS5, TV, Xbox, Nintendo, AirPods, Ray-Ban)
- **Premium competitions**: 4 total (Dubai, Penthouse, First Class, Weekend Getaway)  
- **Pi competitions**: 3 total (10k, 5k, 2.5k)
- **Free competitions**: 1 total (Pi To The Moon)
- **Others**: Daily competitions, etc.

**Total: 14+ active competitions** 🎯 

# Missing Competitions Database Sync Fix

## Issue Summary
The error `ray-ban` competition already exists indicates that some competitions are in the database but others are missing. The Pi SDK timeout and 500 errors occur when trying to add duplicates.

## Current Status (Based on Logs)
✅ **CONFIRMED IN DATABASE:**
- `penthouse-stay` - Added successfully (shown in logs: "Competition found")
- `ray-ban` - Already exists (duplicate key error indicates it's in DB)

❌ **MISSING FROM DATABASE (Need to Add):**
1. `first-class-flight` - First Class Flight - 1π
2. `weekend-getaway` - Weekend Getaway - 2.5π  
3. `pi-giveaway-10k` - 10,000 Pi - 2.2π
4. `pi-giveaway-5k` - 5,000 Pi - 1.8π
5. `pi-giveaway-2.5k` - 2,500 Pi - 1.6π
6. `pi-to-the-moon` - Pi To The Moon - FREE

## IMMEDIATE FIX INSTRUCTIONS

### Option 1: Use Admin Panel (RECOMMENDED)
Go to: `http://localhost:3000/admin/competitions/create`

**1. First Class Flight**
- Slug: `first-class-flight`
- Title: `First Class Flight`
- Prize: `Return flights to anywhere in the world`
- Entry Fee: `1`
- Total Tickets: `2500`
- Theme: `premium`

**2. Weekend Getaway**
- Slug: `weekend-getaway`
- Title: `Weekend Getaway`
- Prize: `€2,000 Travel Voucher`
- Entry Fee: `2.5`
- Total Tickets: `4000`
- Theme: `premium`

**3. Pi Giveaway 10k**
- Slug: `pi-giveaway-10k`
- Title: `10,000 Pi`
- Prize: `10,000 π`
- Entry Fee: `2.2`
- Total Tickets: `5200`
- Theme: `pi`

**4. Pi Giveaway 5k**
- Slug: `pi-giveaway-5k`
- Title: `5,000 Pi`
- Prize: `5,000 π`
- Entry Fee: `1.8`
- Total Tickets: `2900`
- Theme: `pi`

**5. Pi Giveaway 2.5k**
- Slug: `pi-giveaway-2.5k`
- Title: `2,500 Pi`
- Prize: `2,500 π`
- Entry Fee: `1.6`
- Total Tickets: `1600`
- Theme: `pi`

**6. Pi To The Moon**
- Slug: `pi-to-the-moon`
- Title: `Pi To The Moon`
- Prize: `10,000 π`
- Entry Fee: `0` (FREE)
- Total Tickets: `20000`
- Theme: `free`

### Status After Fix:
Once these 6 competitions are added through the admin panel, all competitions from the static data will be synchronized with the database, and the purchase system will work correctly for all competitions.

### Error Prevention:
The admin API has been updated to handle duplicate entries gracefully, so you'll get clear error messages instead of 500 errors if you accidentally try to add an existing competition. 