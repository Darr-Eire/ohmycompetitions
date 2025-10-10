#!/usr/bin/env node

/**
 * OMC Feature Test Script
 * Tests all implemented features systematically
 * 
 * Usage: node test-features.js [baseUrl]
 * Example: node test-features.js http://localhost:3000
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:3000';
const TEST_USER = {
  username: 'testuser',
  piUserId: 'test-pi-user-123',
  email: 'test@example.com'
};
const TEST_ADMIN = {
  username: 'admin',
  password: 'admin123'
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Utility functions
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

function logTest(name, status, details = '') {
  const result = { name, status, details, timestamp: new Date().toISOString() };
  results.tests.push(result);
  
  if (status === 'PASS') {
    results.passed++;
    console.log(`✅ ${name}`);
  } else if (status === 'FAIL') {
    results.failed++;
    console.log(`❌ ${name}: ${details}`);
  } else {
    results.skipped++;
    console.log(`⏭️  ${name}: ${details}`);
  }
}

// Test functions
async function testBasicEndpoints() {
  console.log('\n🔍 Testing Basic Endpoints...');
  
  try {
    // Test homepage
    const homeResponse = await makeRequest(`${BASE_URL}/`);
    logTest('Homepage loads', homeResponse.status === 200 ? 'PASS' : 'FAIL', 
      `Status: ${homeResponse.status}`);
    
    // Test competitions list
    const compsResponse = await makeRequest(`${BASE_URL}/api/competitions/all`);
    logTest('Competitions API', compsResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${compsResponse.status}, Count: ${compsResponse.data?.data?.length || 0}`);
    
  } catch (error) {
    logTest('Basic endpoints', 'FAIL', error.message);
  }
}

async function testUserAuthentication() {
  console.log('\n🔐 Testing User Authentication...');
  
  try {
    // Test Pi verification (mock)
    const verifyResponse = await makeRequest(`${BASE_URL}/api/pi/verify`, {
      method: 'POST',
      body: {
        username: TEST_USER.username,
        piUserId: TEST_USER.piUserId,
        accessToken: 'mock-token'
      }
    });
    
    logTest('Pi verification', verifyResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${verifyResponse.status}, User: ${verifyResponse.data?.username || 'N/A'}`);
    
    // Test user profile
    const profileResponse = await makeRequest(`${BASE_URL}/api/user/profile?username=${TEST_USER.username}`);
    logTest('User profile', profileResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${profileResponse.status}`);
    
  } catch (error) {
    logTest('User authentication', 'FAIL', error.message);
  }
}

async function testTicketSystem() {
  console.log('\n🎫 Testing Ticket System...');
  
  try {
    // Test ticket creation from payment
    const ticketResponse = await makeRequest(`${BASE_URL}/api/tickets/create-from-payment`, {
      method: 'POST',
      body: {
        username: TEST_USER.username,
        competitionSlug: 'test-competition',
        ticketQuantity: 1,
        paymentId: 'test-payment-123',
        txid: 'test-tx-123'
      }
    });
    
    logTest('Ticket creation', ticketResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${ticketResponse.status}, Message: ${ticketResponse.data?.message || 'N/A'}`);
    
    // Test user tickets
    const userTicketsResponse = await makeRequest(`${BASE_URL}/api/user/tickets?username=${TEST_USER.username}`);
    logTest('User tickets list', userTicketsResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${userTicketsResponse.status}, Count: ${userTicketsResponse.data?.length || 0}`);
    
    // Test ticket limits
    const limitsResponse = await makeRequest(`${BASE_URL}/api/user/ticket-limits?username=${TEST_USER.username}&competitionSlug=test-competition`);
    logTest('Ticket limits', limitsResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${limitsResponse.status}`);
    
  } catch (error) {
    logTest('Ticket system', 'FAIL', error.message);
  }
}

async function testXPSystem() {
  console.log('\n⭐ Testing XP System...');
  
  try {
    // Test XP spending
    const spendResponse = await makeRequest(`${BASE_URL}/api/user/xp/spend`, {
      method: 'POST',
      body: {
        username: TEST_USER.username,
        competitionSlug: 'test-competition',
        quantity: 1
      }
    });
    
    logTest('XP spending', spendResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${spendResponse.status}, Message: ${spendResponse.data?.message || 'N/A'}`);
    
    // Test XP award
    const awardResponse = await makeRequest(`${BASE_URL}/api/user/xp/award`, {
      method: 'POST',
      body: {
        username: TEST_USER.username,
        amount: 100,
        reason: 'test-award'
      }
    });
    
    logTest('XP award', awardResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${awardResponse.status}`);
    
  } catch (error) {
    logTest('XP system', 'FAIL', error.message);
  }
}

async function testStageSystem() {
  console.log('\n🎯 Testing Stage System...');
  
  try {
    // Test stage ticket issuance
    const issueResponse = await makeRequest(`${BASE_URL}/api/stages/issue`, {
      method: 'POST',
      body: {
        username: TEST_USER.username,
        stage: 2,
        count: 1,
        source: 'test'
      }
    });
    
    logTest('Stage ticket issuance', issueResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${issueResponse.status}`);
    
    // Test stage ticket usage
    const useResponse = await makeRequest(`${BASE_URL}/api/stages/use`, {
      method: 'POST',
      body: {
        username: TEST_USER.username,
        stage: 2
      }
    });
    
    logTest('Stage ticket usage', useResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${useResponse.status}`);
    
    // Test stage tickets list
    const listResponse = await makeRequest(`${BASE_URL}/api/user/stage-tickets?username=${TEST_USER.username}`);
    logTest('Stage tickets list', listResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${listResponse.status}, Count: ${listResponse.data?.length || 0}`);
    
  } catch (error) {
    logTest('Stage system', 'FAIL', error.message);
  }
}

async function testVoucherSystem() {
  console.log('\n🎟️ Testing Voucher System...');
  
  try {
    // Test voucher generation (admin)
    const generateResponse = await makeRequest(`${BASE_URL}/api/admin/vouchers/generate`, {
      method: 'POST',
      body: {
        competitionSlug: 'test-competition',
        quantity: 5,
        maxRedemptions: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      headers: {
        'x-admin': 'true'
      }
    });
    
    logTest('Voucher generation', generateResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${generateResponse.status}, Count: ${generateResponse.data?.count || 0}`);
    
    // Test voucher redemption
    const redeemResponse = await makeRequest(`${BASE_URL}/api/vouchers/redeem`, {
      method: 'POST',
      body: {
        code: 'TEST-VOUCHER-123',
        username: TEST_USER.username
      }
    });
    
    logTest('Voucher redemption', redeemResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${redeemResponse.status}, Message: ${redeemResponse.data?.message || 'N/A'}`);
    
    // Test voucher history
    const historyResponse = await makeRequest(`${BASE_URL}/api/admin/vouchers/history`);
    logTest('Voucher history', historyResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${historyResponse.status}`);
    
  } catch (error) {
    logTest('Voucher system', 'FAIL', error.message);
  }
}

async function testReferralSystem() {
  console.log('\n👥 Testing Referral System...');
  
  try {
    // Test referral code generation
    const generateResponse = await makeRequest(`${BASE_URL}/api/user/generate-referral`, {
      method: 'POST',
      body: {
        username: TEST_USER.username
      }
    });
    
    logTest('Referral code generation', generateResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${generateResponse.status}, Code: ${generateResponse.data?.referralCode || 'N/A'}`);
    
    // Test referral application
    const applyResponse = await makeRequest(`${BASE_URL}/api/user/apply-referral`, {
      method: 'POST',
      body: {
        username: 'newuser',
        referralCode: 'TEST123'
      }
    });
    
    logTest('Referral application', applyResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${applyResponse.status}`);
    
    // Test referral stats
    const statsResponse = await makeRequest(`${BASE_URL}/api/referrals/stats?username=${TEST_USER.username}`);
    logTest('Referral stats', statsResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${statsResponse.status}`);
    
    // Test referral leaderboard
    const leaderboardResponse = await makeRequest(`${BASE_URL}/api/referrals/leaderboard`);
    logTest('Referral leaderboard', leaderboardResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${leaderboardResponse.status}, Count: ${leaderboardResponse.data?.length || 0}`);
    
  } catch (error) {
    logTest('Referral system', 'FAIL', error.message);
  }
}

async function testGiftSystem() {
  console.log('\n🎁 Testing Gift System...');
  
  try {
    // Test gift with skill question
    const giftResponse = await makeRequest(`${BASE_URL}/api/tickets/gift-with-skill`, {
      method: 'POST',
      body: {
        username: TEST_USER.username,
        recipientUsername: 'recipient',
        competitionSlug: 'test-competition',
        quantity: 1,
        skillQuestion: 'What is 2+2?',
        skillAnswer: '4',
        paymentId: 'gift-payment-123'
      }
    });
    
    logTest('Gift with skill question', giftResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${giftResponse.status}, Message: ${giftResponse.data?.message || 'N/A'}`);
    
    // Test self-gift blocking
    const selfGiftResponse = await makeRequest(`${BASE_URL}/api/tickets/gift-with-skill`, {
      method: 'POST',
      body: {
        username: TEST_USER.username,
        recipientUsername: TEST_USER.username, // Same user
        competitionSlug: 'test-competition',
        quantity: 1,
        skillQuestion: 'What is 2+2?',
        skillAnswer: '4',
        paymentId: 'self-gift-payment-123'
      }
    });
    
    logTest('Self-gift blocking', selfGiftResponse.status === 400 ? 'PASS' : 'FAIL',
      `Status: ${selfGiftResponse.status}, Should block self-gifting`);
    
  } catch (error) {
    logTest('Gift system', 'FAIL', error.message);
  }
}

async function testNotificationSystem() {
  console.log('\n🔔 Testing Notification System...');
  
  try {
    // Test notification creation
    const createResponse = await makeRequest(`${BASE_URL}/api/notifications/create`, {
      method: 'POST',
      body: {
        username: TEST_USER.username,
        type: 'win',
        title: 'Test Win!',
        message: 'You won a test competition!',
        data: { competitionId: 'test-123' }
      }
    });
    
    logTest('Notification creation', createResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${createResponse.status}`);
    
    // Test notification list
    const listResponse = await makeRequest(`${BASE_URL}/api/notifications/list?username=${TEST_USER.username}`);
    logTest('Notification list', listResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${listResponse.status}, Count: ${listResponse.data?.length || 0}`);
    
    // Test mark as read
    const markReadResponse = await makeRequest(`${BASE_URL}/api/notifications/mark-read`, {
      method: 'POST',
      body: {
        username: TEST_USER.username,
        notificationId: 'test-notification-123'
      }
    });
    
    logTest('Mark notification as read', markReadResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${markReadResponse.status}`);
    
  } catch (error) {
    logTest('Notification system', 'FAIL', error.message);
  }
}

async function testAdminSystem() {
  console.log('\n👨‍💼 Testing Admin System...');
  
  try {
    // Test admin login
    const loginResponse = await makeRequest(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      body: {
        username: TEST_ADMIN.username,
        password: TEST_ADMIN.password
      }
    });
    
    logTest('Admin login', loginResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${loginResponse.status}`);
    
    // Test admin dashboard
    const dashboardResponse = await makeRequest(`${BASE_URL}/api/admin/dashboard`, {
      headers: {
        'x-admin': 'true'
      }
    });
    
    logTest('Admin dashboard', dashboardResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${dashboardResponse.status}`);
    
    // Test competition stats
    const statsResponse = await makeRequest(`${BASE_URL}/api/admin/competitions/stats`, {
      headers: {
        'x-admin': 'true'
      }
    });
    
    logTest('Competition stats', statsResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${statsResponse.status}`);
    
    // Test voucher stats
    const voucherStatsResponse = await makeRequest(`${BASE_URL}/api/admin/voucher-stats`, {
      headers: {
        'x-admin': 'true'
      }
    });
    
    logTest('Voucher stats', voucherStatsResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${voucherStatsResponse.status}`);
    
    // Test admin logs
    const logsResponse = await makeRequest(`${BASE_URL}/api/admin/log`, {
      headers: {
        'x-admin': 'true'
      }
    });
    
    logTest('Admin logs', logsResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${logsResponse.status}`);
    
  } catch (error) {
    logTest('Admin system', 'FAIL', error.message);
  }
}

async function testCommunityFeatures() {
  console.log('\n🌐 Testing Community Features...');
  
  try {
    // Test Pioneer of the Week
    const pioneerResponse = await makeRequest(`${BASE_URL}/api/community/pioneer`);
    logTest('Pioneer of the Week', pioneerResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${pioneerResponse.status}`);
    
    // Test community feed
    const feedResponse = await makeRequest(`${BASE_URL}/api/community/feed`);
    logTest('Community feed', feedResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${feedResponse.status}, Count: ${feedResponse.data?.length || 0}`);
    
  } catch (error) {
    logTest('Community features', 'FAIL', error.message);
  }
}

async function testFreeCompetition() {
  console.log('\n🆓 Testing Free Competition...');
  
  try {
    // Test free competition entry
    const entryResponse = await makeRequest(`${BASE_URL}/api/competitions/free/enter`, {
      method: 'POST',
      body: {
        username: TEST_USER.username,
        competitionSlug: 'free-test-competition',
        socialProof: 'https://twitter.com/test/status/123'
      }
    });
    
    logTest('Free competition entry', entryResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${entryResponse.status}, Message: ${entryResponse.data?.message || 'N/A'}`);
    
  } catch (error) {
    logTest('Free competition', 'FAIL', error.message);
  }
}

async function testRefundSystem() {
  console.log('\n💰 Testing Refund System...');
  
  try {
    // Test competition cancel and refund
    const refundResponse = await makeRequest(`${BASE_URL}/api/competitions/cancel-and-refund`, {
      method: 'POST',
      body: {
        competitionId: 'test-competition-123',
        reason: 'test-cancellation'
      },
      headers: {
        'x-admin': 'true'
      }
    });
    
    logTest('Competition cancel and refund', refundResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${refundResponse.status}, Message: ${refundResponse.data?.message || 'N/A'}`);
    
  } catch (error) {
    logTest('Refund system', 'FAIL', error.message);
  }
}

async function testPWAFeatures() {
  console.log('\n📱 Testing PWA Features...');
  
  try {
    // Test manifest
    const manifestResponse = await makeRequest(`${BASE_URL}/manifest.json`);
    logTest('PWA manifest', manifestResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${manifestResponse.status}`);
    
    // Test service worker
    const swResponse = await makeRequest(`${BASE_URL}/sw.js`);
    logTest('Service worker', swResponse.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${swResponse.status}`);
    
  } catch (error) {
    logTest('PWA features', 'FAIL', error.message);
  }
}

async function testMultiLanguage() {
  console.log('\n🌍 Testing Multi-language Support...');
  
  try {
    // Test language switching (this would need to be implemented in the frontend)
    logTest('Multi-language support', 'SKIP', 'Requires frontend testing');
    
  } catch (error) {
    logTest('Multi-language', 'FAIL', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting OMC Feature Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('=' * 50);
  
  const startTime = Date.now();
  
  // Run all test suites
  await testBasicEndpoints();
  await testUserAuthentication();
  await testTicketSystem();
  await testXPSystem();
  await testStageSystem();
  await testVoucherSystem();
  await testReferralSystem();
  await testGiftSystem();
  await testNotificationSystem();
  await testAdminSystem();
  await testCommunityFeatures();
  await testFreeCompetition();
  await testRefundSystem();
  await testPWAFeatures();
  await testMultiLanguage();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Print summary
  console.log('\n' + '=' * 50);
  console.log('📊 TEST SUMMARY');
  console.log('=' * 50);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  // Print failed tests
  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`  - ${t.name}: ${t.details}`));
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run tests
runAllTests().catch(console.error);
