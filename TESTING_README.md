# OMC Testing Guide

This directory contains comprehensive test scripts to verify all implemented features of the OMC (Oh My Competitions) platform.

## Test Scripts Overview

### 1. `api-test.js` - Backend API Tests
**Purpose**: Tests all backend APIs without frontend dependencies
**Usage**: `node api-test.js [baseUrl]`
**Example**: `node api-test.js http://localhost:3000`

**Tests**:
- Basic endpoints (homepage, competitions)
- User APIs (profile, tickets, credits, XP)
- Stage system (issue, use, list)
- Referral system (stats, leaderboard, generation)
- Voucher system (generate, list, history)
- Admin APIs (dashboard, stats, logs)
- Community APIs (pioneer, feed)
- Notification system
- PWA features (manifest, service worker)
- Free competition entry

### 2. `quick-test.js` - Quick Health Check
**Purpose**: Fast verification of critical endpoints
**Usage**: `node quick-test.js [baseUrl]`
**Example**: `node quick-test.js http://localhost:3000`

**Tests**:
- Homepage loading
- Core API endpoints
- Admin panel access
- PWA features
- Community features

### 3. `test-features.js` - Comprehensive Feature Tests
**Purpose**: Detailed testing of all implemented features
**Usage**: `node test-features.js [baseUrl]`
**Example**: `node test-features.js http://localhost:3000`

**Test Suites**:
- User authentication & login
- Ticket purchase system
- XP system
- Stage system
- Voucher system
- Referral system
- Gift system
- Notification system
- Admin system
- Community features
- Free competition
- Refund system
- PWA features
- Multi-language support

### 4. `run-tests.js` - Test Runner
**Purpose**: Runs all test suites in sequence
**Usage**: `node run-tests.js [baseUrl]`
**Example**: `node run-tests.js http://localhost:3000`

**Execution Order**:
1. API tests (fastest)
2. Quick tests
3. Comprehensive feature tests

### 5. `MANUAL_TEST_CHECKLIST.md` - Manual Testing Guide
**Purpose**: Step-by-step manual testing instructions
**Usage**: Follow the checklist in your browser

**Categories**:
- Core features testing
- Admin panel testing
- User experience testing
- Growth & extras testing
- Error handling testing
- Performance testing
- Security testing
- Browser compatibility

## Quick Start

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Run all tests**:
   ```bash
   node run-tests.js
   ```

3. **Run specific tests**:
   ```bash
   # Quick health check
   node quick-test.js
   
   # API tests only
   node api-test.js
   
   # Comprehensive tests
   node test-features.js
   ```

4. **Manual testing**:
   - Open `MANUAL_TEST_CHECKLIST.md`
   - Follow the step-by-step instructions
   - Test in different browsers (especially Pi Browser)

## Test Configuration

### Environment Variables
Make sure these are set in your `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/omc
PI_API_KEY=your_pi_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Test Data Setup
Before running tests, ensure you have:
- At least 2 test users with different usernames
- Admin user with proper credentials
- Some test competitions (active and ended)
- Test voucher codes
- Test referral codes

## Expected Results

### API Tests
- **Success Rate**: 90%+ (some endpoints may require specific data)
- **Response Time**: < 2 seconds per request
- **Error Handling**: Proper HTTP status codes

### Quick Tests
- **Success Rate**: 95%+ (basic functionality)
- **Response Time**: < 1 second per request
- **Coverage**: All critical endpoints

### Comprehensive Tests
- **Success Rate**: 85%+ (some features may need manual setup)
- **Response Time**: < 5 seconds per test suite
- **Coverage**: All implemented features

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure the development server is running
   - Check the base URL is correct
   - Verify port 3000 is available

2. **Authentication Errors**
   - Some tests require admin authentication
   - Check if admin credentials are set up
   - Verify API endpoints are properly protected

3. **Database Errors**
   - Ensure MongoDB is running
   - Check database connection string
   - Verify required collections exist

4. **Pi Network Errors**
   - Some tests require Pi Network integration
   - Check if Pi API key is configured
   - Verify Pi Network endpoints are accessible

### Debug Mode
Run tests with debug output:
```bash
DEBUG=1 node test-features.js
```

### Verbose Output
Get detailed test results:
```bash
node test-features.js 2>&1 | tee test-results.log
```

## Test Coverage

### Core Features ✅
- [x] Limit tickets per user
- [x] Multiple winners
- [x] Show winners in Admin
- [x] Redeem vouchers
- [x] Tickets as prizes
- [x] OMC Stages
- [x] Skill questions saved
- [x] XP system
- [x] Gift tickets

### Admin Panel ✅
- [x] Admin login
- [x] Fix broken APIs
- [x] Winners table
- [x] Voucher history
- [x] Competition stats
- [x] Admin log

### User Experience ✅
- [x] Account page
- [x] Ticket cards
- [x] Pop-up messages
- [x] Multi-language support
- [x] Fairness & proof

### Growth & Extras ✅
- [x] Referral leaderboard
- [x] Community tools
- [x] Analytics dashboards
- [x] Notifications system
- [x] Free Competition
- [x] Refund flow
- [x] Cheat prevention
- [x] Self-gift block
- [x] Mobile-first PWA polish

## Contributing

When adding new features:
1. Add corresponding tests to the appropriate test script
2. Update the manual testing checklist
3. Ensure tests cover both success and failure scenarios
4. Test in multiple browsers and devices

## Support

If you encounter issues with the tests:
1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure the development server is running
4. Check the database connection
5. Review the manual testing checklist for additional verification
