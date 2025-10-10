# 🎮 Try Your Luck Games - Testing Guide

## 🚀 Quick Start Testing

### 1. **Start Development Server**
```bash
npm run dev
```

### 2. **Run Automated Test Script**
```bash
node test-try-your-luck.js
```

### 3. **Manual Frontend Testing**
Navigate to these URLs and test manually:
- **Hack the Vault**: http://localhost:3000/try-your-luck/hack-the-vault
- **Match Pi Code**: http://localhost:3000/try-your-luck/match-code
- **Main Hub**: http://localhost:3000/try-your-luck

---

## 🔧 Manual Testing Checklist

### **🔓 Hack the Vault Testing**

#### ✅ Basic Functionality
- [ ] Page loads without errors
- [ ] Login button appears when not logged in
- [ ] Game requires Pi authentication
- [ ] Secret code appears in browser console (for testing)
- [ ] Skill question (6 + 3 = 9) is required
- [ ] Digit adjustment buttons work (▲/▼)
- [ ] "Crack Code" button only works with correct skill answer

#### ✅ Win Scenario
- [ ] Use console code to set correct digits
- [ ] Answer skill question correctly (9)
- [ ] Click "Crack Code"
- [ ] Confetti animation plays
- [ ] Win message displays: "🎉 You cracked the Vault & won 50π!"
- [ ] Payout status shows: "💰 Sending Pi payout..."
- [ ] Success message: "✅ Congratulations! You won 50π! Pi has been sent to your wallet."
- [ ] Check Pi wallet for actual 50π transaction

#### ✅ Daily Limit Testing
- [ ] Try to play again immediately
- [ ] Should show: "You already won Hack the Vault today! Come back tomorrow."
- [ ] Button disabled with "Already Played Today"

---

### **🕒 Match Pi Code Testing**

#### ✅ Basic Functionality
- [ ] Page loads without errors
- [ ] Login required message appears
- [ ] Game requires Pi authentication
- [ ] Skill question (6 + 3 = 9) is required
- [ ] Progress indicators show π digits: 3.1415926
- [ ] Timer scrolls through numbers when started
- [ ] "STOP" button stops the timer

#### ✅ Win Scenario
- [ ] Answer skill question correctly (9)
- [ ] Click "Free Try Today"
- [ ] Use timing to match π sequence: 3.1415926
- [ ] Win message: "🏆 You matched π! You win XXπ"
- [ ] Payout status shows: "💰 Sending Pi payout..."
- [ ] Success message with final amount (50π + bonuses)
- [ ] Check Pi wallet for transaction

#### ✅ Bonus Testing
- [ ] **Perfect Timing Bonus**: Extra 2π for precise timing
- [ ] **Jackpot Mode**: Randomly activated, doubles prize
- [ ] **Win Streak**: Shows consecutive daily wins

#### ✅ Daily Limit Testing
- [ ] Try to play again after winning
- [ ] Should prevent multiple wins per day
- [ ] Shows appropriate error message

---

## 🧪 API Testing

### **Test Hack the Vault Win API**
```bash
curl -X POST http://localhost:3000/api/try-your-luck/hack-vault-win \
  -H "Content-Type: application/json" \
  -d '{
    "userUid": "test_user_123",
    "username": "TestUser",
    "prizeAmount": 50
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Congratulations! You won 50π! Pi has been sent to your wallet.",
  "prizeAmount": 50,
  "paymentId": "payment_id_here",
  "gameResultId": "game_result_id_here"
}
```

### **Test Match Pi Code Win API**
```bash
curl -X POST http://localhost:3000/api/try-your-luck/match-pi-win \
  -H "Content-Type: application/json" \
  -d '{
    "userUid": "test_user_456",
    "username": "TestUser2",
    "prizeAmount": 50,
    "isJackpot": true,
    "perfectTiming": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Congratulations! You won 52π! Pi has been sent to your wallet.",
  "prizeAmount": 52,
  "basePrize": 50,
  "isJackpot": true,
  "perfectTiming": true,
  "paymentId": "payment_id_here",
  "gameResultId": "game_result_id_here"
}
```

### **Test Daily Limit Protection**
```bash
# Run the same API call twice - second should fail
curl -X POST http://localhost:3000/api/try-your-luck/hack-vault-win \
  -H "Content-Type: application/json" \
  -d '{
    "userUid": "test_user_123",
    "username": "TestUser",
    "prizeAmount": 50
  }'
```

**Expected Response (Second Call):**
```json
{
  "error": "You already won Hack the Vault today! Come back tomorrow."
}
```

---

## 📊 Database Verification

### **Check Game Results in MongoDB**
```javascript
// In MongoDB Compass or shell
db.gameresults.find().sort({createdAt: -1}).limit(10)
```

**Expected Document:**
```json
{
  "_id": "ObjectId",
  "userUid": "test_user_123",
  "game": "hack_vault",
  "result": "Won 50π by cracking the vault!",
  "prizeAmount": 50,
  "metadata": {
    "game": "hack_vault",
    "winDate": "2025-01-XX",
    "username": "TestUser"
  },
  "createdAt": "2025-01-XX"
}
```

### **Check Payout Records**
```javascript
db.payouts.find().sort({createdAt: -1}).limit(10)
```

---

## 🐛 Troubleshooting

### **Common Issues & Solutions**

#### ❌ **"Failed to parse URL" Error**
- **Cause**: Relative URL issue in server-side fetch
- **Solution**: Ensure `NEXT_PUBLIC_SITE_URL` is set in `.env.local`
- **Check**: `piPayouts.js` uses full URLs

#### ❌ **"User not found" Error**
- **Cause**: User not in database
- **Solution**: Login with Pi Network first to create user record
- **Check**: MongoDB users collection

#### ❌ **"Pi payout failed" Error**
- **Cause**: Pi Network API issues or sandbox limitations
- **Solution**: Check Pi API credentials in `.env.local`
- **Note**: Sandbox payouts may not actually send Pi

#### ❌ **Games not requiring login**
- **Cause**: Pi authentication not working
- **Solution**: Check Pi SDK initialization
- **Check**: Browser console for Pi SDK errors

#### ❌ **Secret code not showing**
- **Cause**: Console logging may be disabled
- **Solution**: Open browser dev tools, check Console tab
- **Look for**: "🔓 HACK THE VAULT - Secret Code: XXXX"

---

## 📈 Performance Testing

### **Load Testing with Multiple Users**
```bash
# Test with multiple concurrent users
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/try-your-luck/hack-vault-win \
    -H "Content-Type: application/json" \
    -d "{\"userUid\": \"test_user_$i\", \"username\": \"TestUser$i\", \"prizeAmount\": 50}" &
done
wait
```

### **Database Performance**
- Monitor MongoDB for query performance
- Check for proper indexing on `userUid` and `createdAt`
- Verify daily limit queries are fast

---

## ✅ Success Criteria

### **All Tests Pass When:**
- [ ] Both games load and function correctly
- [ ] Pi authentication is required and working
- [ ] Winners receive actual Pi payouts
- [ ] Daily limits prevent multiple wins
- [ ] Game results are saved to MongoDB
- [ ] Error handling works gracefully
- [ ] Console logs show proper debugging info
- [ ] Pi wallet shows received transactions

### **Performance Benchmarks:**
- [ ] Page load time < 3 seconds
- [ ] API response time < 2 seconds
- [ ] Pi payout initiation < 5 seconds
- [ ] Daily limit check < 500ms

---

## 🎯 Next Steps After Testing

1. **Fix any failing tests** identified during testing
2. **Optimize performance** if benchmarks aren't met
3. **Add more games** using the same payout infrastructure
4. **Implement admin dashboard** for monitoring wins/payouts
5. **Add analytics** for game popularity and win rates

---

## 📞 Support

If you encounter issues during testing:
1. Check server logs for detailed error messages
2. Verify `.env.local` configuration
3. Ensure MongoDB is connected and accessible
4. Test Pi Network connectivity and credentials
5. Review browser console for frontend errors

Happy Testing! 🎮🎉 