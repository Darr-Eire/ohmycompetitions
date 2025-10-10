# OMC Manual Testing Checklist

## Prerequisites
- Start the development server: `npm run dev`
- Open browser to `http://localhost:3000`
- Have at least 2 test users ready (one for gifting)

## Core Features Testing

### 1. User Authentication & Login
<<<<<<< HEAD
- [✅ ] **Pi Login**: Click "Login with Pi" → Should redirect to Pi auth
- [✅ ] **Signup Flow**: New user signup → Should create account and redirect
- [✅ ] **Login Flow**: Existing user login → Should authenticate and show username in header
- [✅] **Logout**: Click logout → Should clear session and redirect to homepage

### 2. Ticket Purchase System
- [✅] **Buy Tickets**: Go to any competition → Click "Buy Tickets" → Complete Pi payment
- [✅] **Ticket Limits**: Try to buy more than maxPerUser → Should show limit error
- [✅] **Ticket Display**: Check account page → Should show purchased tickets with correct details
- [✅] **Ticket Numbers**: Verify ticket numbers are sequential and unique

### 3. XP System
- [✅] **XP Earning**: Make a purchase → Check if XP is awarded
- [✅] **XP Balance**: Account page → Should show current XP balance
- [❌] **XP Spending**: Try to buy tickets with XP → Should deduct XP and create tickets
- [❓] **XP Limits**: Try to spend more XP than available → Should show error

### 4. Stage System
- [❌] **Stage 1 Purchase**: Buy Stage 1 competition → Should auto-issue Stage 2 tickets
- [❓] **Stage Tickets Display**: Account page → Should show stage tickets in separate section
- [❓] **Stage Ticket Usage**: Try to use stage ticket → Should work and reduce count
- [❓] **Stage Progression**: Complete stage → Should advance to next stage

### 5. Gift System
- [❌] **Gift Ticket**: Go to competition → Click "Gift Ticket" → Enter recipient username----can not select competitions the drop down is not working but it should not be a drop down because its on the slug page. have image

- [❓] **Skill Question**: Answer skill question → Should validate answer
- [❓] **Payment**: Complete Pi payment for gift → Should create ticket for recipient
- [❓] **Self-Gift Block**: Try to gift to own username → Should show error
- [❓] **Success Message**: Should show success toast after gifting

### 6. Voucher System
- [✅] **Admin Generate**: Admin panel → Generate vouchers → Should create voucher codes
- [❌] **Voucher Redemption**: Account page → Enter voucher code → Should create ticket credits----redems the code but doesnt show the ticket in active tickets 

- [✅] **Voucher History**: Admin panel → Check voucher redemption history
- [✅] **Voucher Limits**: Try to redeem same voucher twice → Should show error

### 7. Referral System
- [ ] **Referral Code**: Account page → Should show user's referral code
=======
- [✅] **Pi Login**: Click "Login with Pi" → Should redirect to Pi auth  (logs in sandbox)
- [✅] **Signup Flow**: New user signup → Should create account and redirect (WORKS)
- [✅] **Login Flow**: Existing user login → Should authenticate and show username in header (WORKS)
- [✅] **Logout**: Click logout → Should clear session and redirect to homepage (WORKS)

### 2. Ticket Purchase System
- [✅] **Buy Tickets**: Go to any competition → Click "Buy Tickets" → Complete Pi payment 
- [✅] **Ticket Limits**: Try to buy more than maxPerUser → Should show limit error (YES SAYS 50 MAX CANT BUY MORE)
- [✅] **Ticket Display**: Check account page → Should show purchased tickets with correct details
- [✅] **Ticket Numbers**: Verify ticket numbers are sequential and unique

### 3. XP System  (not seeing anythi g about this) XXXXXXXX
- [X] **XP Earning**: Make a purchase → Check if XP is awarded
- [X] **XP Balance**: Account page → Should show current XP balance
- [X] **XP Spending**: Try to buy tickets with XP → Should deduct XP and create tickets
- [x] **XP Limits**: Try to spend more XP than available → Should show error

### 4. Stage System
- [X] **Stage 1 Purchase**:XX tried to but ticket didnt workXXX Buy Stage 1 competition → Should auto-issue Stage 2 tickets(stage 1 should only give stage 1 tickets you need to advance in stage 1 to get to stage 2)
- [X] **Stage Tickets Display**: Account page → Should show stage tickets in separate section
- [X] **Stage Ticket Usage**: Try to use stage ticket → Should work and reduce count
- [X] **Stage Progression**: Complete stage → Should advance to next stage

### 5. Gift System
- [X] **Gift Ticket**: Go to competition → Click "Gift Ticket" → Enter recipient username
- [X] **Skill Question**: Answer skill question → Should validate answer
- [X] **Payment**: Complete Pi payment for gift → Should create ticket for recipient
- [X] **Self-Gift Block**: Try to gift to own username → Should show error
- [X] **Success Message**: Should show success toast after gifting

### 6. Voucher System
- [X] **Admin Generate**: Admin panel → Generate vouchers → Should create voucher codes
- [x] **Voucher Redemption**: Account page → Enter voucher code → Should create ticket credits
- [X] **Voucher History**: Admin panel → Check voucher redemption history
- [x] **Voucher Limits**: Try to redeem same voucher twice → Should show error

### 7. Referral System
- [✅] **Referral Code**: Account page → Should show user's referral code
>>>>>>> origin/testnet
- [ ] **Apply Referral**: New user signup with referral code → Should award bonus tickets
- [ ] **Referral Stats**: Account page → Should show referral count and weekly count
- [ ] **Leaderboard**: Visit `/referrals/leaderboard` → Should show top referrers

## Admin Panel Testing

### 8. Admin Authentication
- [✅] **Admin Login**: Go to `/admin` → Login with admin credentials
- [✅] **Admin Dashboard**: Should show stats and overview
- [✅] **Admin Sidebar**: Should show all admin menu items

### 9. Competition Management
- [✅] **Create Competition**: Admin → Create new competition → Should save to database
- [ ] **Draw Winners**: Admin → Select competition → Draw winners → Should select random winners
- [ ] **Winners Table**: Competition detail page → Should show winners with ticket numbers
- [ ] **Cancel Competition**: Admin → Cancel competition → Should issue refunds

### 10. Voucher Management
- [ ] **Generate Vouchers**: Admin → Generate vouchers → Should create batch
- [ ] **Voucher List**: Admin → View vouchers → Should show all vouchers
- [ ] **Voucher History**: Admin → Voucher history → Should show redemptions

### 11. Analytics & Stats
- [✅] **Competition Stats**: Admin → Competition stats → Should show metrics
<<<<<<< HEAD
- [✅] **Voucher Stats**: Admin → Voucher stats → Should show redemption rates
=======
- [ ] **Voucher Stats**: Admin → Voucher stats → Should show redemption rates
>>>>>>> origin/testnet
- [✅] **Referral Stats**: Admin → Referral stats → Should show top referrers
- [✅] **Admin Logs**: Admin → Logs → Should show admin actions

## User Experience Testing

### 12. Account Page
<<<<<<< HEAD
- [✅] **XP Display**: Should show current XP balance and level
- [❓] **Stage Tickets**: Should show available stage tickets by stage
=======
- [X] **XP Display**: Should show current XP balance and level
- [X] **Stage Tickets**: Should show available stage tickets by stage
>>>>>>> origin/testnet
- [ ] **Gifted Tickets**: Should show tickets received as gifts
- [ ] **Voucher History**: Should show redeemed vouchers
- [ ] **Ticket Cards**: Should show proper badges (paid/free/gifted/stage)

### 13. Notifications
- [ ] **Win Notification**: Win a competition → Should show notification
- [ ] **Gift Notification**: Receive a gift → Should show notification
- [ ] **Notification Bell**: Header → Should show unread count
- [ ] **Mark as Read**: Click notification → Should mark as read

### 14. Multi-language Support
- [✅] **Language Switcher**: Header → Should show language dropdown
- [✅] **Switch Language**: Change language → Should update UI text
- [✅] **Persist Language**: Refresh page → Should remember language choice

### 15. Mobile/PWA Testing
- [✅] **Responsive Design**: Test on mobile → Should be responsive
<<<<<<< HEAD
- [❓] **PWA Install**: Should show install prompt on mobile
- [❓] **Offline**: Should work offline (basic functionality)
- [✅] **Pi Browser**: Test in Pi Browser → Should work properly
=======
- [ ] **PWA Install**: Should show install prompt on mobile
- [ ] **Offline**: Should work offline (basic functionality)
- [ ] **Pi Browser**: Test in Pi Browser → Should work properly
>>>>>>> origin/testnet

## Growth & Extras Testing

### 16. Free Competition
- [ ] **Free Entry**: Visit `/competitions/free` → Enter competition
- [ ] **Social Proof**: Share on social media → Should track entry
- [ ] **Anti-abuse**: Try to enter multiple times → Should be blocked

### 17. Community Features
- [✅] **Pioneer of the Week**: Should show top user
- [✅] **Activity Feed**: Should show recent activity
<<<<<<< HEAD
- [✅] **Community Stats**: Should show engagement metrics
=======
- [ ] **Community Stats**: Should show engagement metrics
>>>>>>> origin/testnet

### 18. Anti-abuse Features
- [ ] **Rate Limiting**: Try rapid requests → Should be throttled
- [ ] **IP Blocking**: Try suspicious activity → Should be blocked
- [ ] **Cooldowns**: Try to gift too frequently → Should show cooldown

### 19. Refund System
<<<<<<< HEAD
- [✅] **Cancel Competition**: Admin → Cancel competition
=======
- [ ] **Cancel Competition**: Admin → Cancel competition
>>>>>>> origin/testnet
- [ ] **Automatic Refunds**: Users should receive refunds
- [✅] **Refund Types**: Should support both Pi and ticket credits

## Error Handling Testing

### 20. Error Scenarios
- [ ] **Invalid Payment**: Try invalid Pi payment → Should show error
- [ ] **Network Error**: Disconnect internet → Should show error message
- [ ] **Invalid Data**: Submit invalid forms → Should show validation errors
- [ ] **Server Error**: Test with invalid API calls → Should handle gracefully

## Performance Testing

### 21. Load Testing
- [ ] **Multiple Users**: Test with multiple concurrent users
- [ ] **Large Datasets**: Test with many competitions and tickets
- [ ] **Database Performance**: Check query performance
- [ ] **Memory Usage**: Monitor memory consumption

## Security Testing

### 22. Security Checks
<<<<<<< HEAD
- [ ] **Admin Access**: Try to access admin without login → Should be blocked-----once logged in you log out close everything go you / admin and you already logged in 

=======
- [ ] **Admin Access**: Try to access admin without login → Should be blocked
>>>>>>> origin/testnet
- [ ] **User Data**: Verify users can only see their own data
- [ ] **API Security**: Test API endpoints for proper authentication
- [ ] **Input Validation**: Test for SQL injection and XSS

## Browser Compatibility

### 23. Browser Testing
<<<<<<< HEAD
- [✅] **Chrome**: Test in Chrome browser
- [✅] **Firefox**: Test in Firefox browser
- [✅] **Safari**: Test in Safari browser
- [✅] **Pi Browser**: Test in Pi Browser specifically
=======
- [ ] **Chrome**: Test in Chrome browser
- [ ] **Firefox**: Test in Firefox browser
- [ ] **Safari**: Test in Safari browser
- [ ] **Pi Browser**: Test in Pi Browser specifically
>>>>>>> origin/testnet

## Notes
- Mark each item as ✅ when completed
- Note any issues or bugs found
- Test both positive and negative scenarios
- Verify data persistence across page refreshes
- Check console for any JavaScript errors

## Test Data Setup
Before testing, ensure you have:
- At least 2 test users with different usernames
- Admin user with proper credentials
- Some test competitions (active and ended)
- Test voucher codes
- Test referral codes
