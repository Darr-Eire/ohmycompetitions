#!/usr/bin/env node

/**
 * Try Your Luck Games - Comprehensive Test Script
 * 
 * This script tests:
 * 1. Hack the Vault API
 * 2. Match Pi Code API
 * 3. Pi Payout Integration
 * 4. Daily Limits
 * 5. Database Integration
 * 
 * Usage: node test-try-your-luck.js
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const TEST_USER_UID = 'test_user_' + Date.now();
const TEST_USERNAME = 'TestUser' + Date.now();

console.log('🎮 Try Your Luck Games Test Suite');
console.log('==================================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Test User: ${TEST_USERNAME} (${TEST_USER_UID})`);
console.log('');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testApiEndpoint(name, url, data = null, method = 'GET') {
  try {
    logInfo(`Testing ${name}...`);
    
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data && method === 'POST') {
      config.data = data;
    }
    
    const response = await axios(config);
    logSuccess(`${name} - Status: ${response.status}`);
    
    if (response.data) {
      console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    }
    
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const status = error.response?.status || 'No Response';
    const message = error.response?.data?.error || error.message;
    
    if (error.response?.status === 400 && message.includes('already won')) {
      logWarning(`${name} - Expected daily limit: ${message}`);
      return { success: true, data: error.response.data, status: error.response.status, dailyLimit: true };
    } else {
      logError(`${name} - Status: ${status}, Error: ${message}`);
      return { success: false, error: message, status };
    }
  }
}

async function testHackTheVaultWin() {
  log('\n🔓 Testing Hack the Vault Win API', 'bold');
  log('==================================');
  
  const testData = {
    userUid: TEST_USER_UID,
    username: TEST_USERNAME,
    prizeAmount: 50
  };
  
  return await testApiEndpoint(
    'Hack the Vault Win',
    '/api/try-your-luck/hack-vault-win',
    testData,
    'POST'
  );
}

async function testMatchPiCodeWin() {
  log('\n🕒 Testing Match Pi Code Win API', 'bold');
  log('=================================');
  
  const testData = {
    userUid: TEST_USER_UID,
    username: TEST_USERNAME,
    prizeAmount: 50,
    isJackpot: false,
    perfectTiming: true // Test with bonus
  };
  
  return await testApiEndpoint(
    'Match Pi Code Win',
    '/api/try-your-luck/match-pi-win',
    testData,
    'POST'
  );
}

async function testJackpotWin() {
  log('\n🎰 Testing Jackpot Win', 'bold');
  log('======================');
  
  const testData = {
    userUid: TEST_USER_UID + '_jackpot',
    username: TEST_USERNAME + '_Jackpot',
    prizeAmount: 50,
    isJackpot: true,
    perfectTiming: true
  };
  
  return await testApiEndpoint(
    'Match Pi Code Jackpot Win',
    '/api/try-your-luck/match-pi-win',
    testData,
    'POST'
  );
}

async function testDailyLimits() {
  log('\n⏰ Testing Daily Limits', 'bold');
  log('=======================');
  
  logInfo('Testing second win attempt (should be blocked)...');
  
  const testData = {
    userUid: TEST_USER_UID,
    username: TEST_USERNAME,
    prizeAmount: 50
  };
  
  const result = await testApiEndpoint(
    'Hack the Vault Daily Limit',
    '/api/try-your-luck/hack-vault-win',
    testData,
    'POST'
  );
  
  if (result.dailyLimit) {
    logSuccess('Daily limit protection working correctly!');
  } else if (!result.success) {
    logWarning('Daily limit might not be working - check database');
  }
  
  return result;
}

async function testInvalidInputs() {
  log('\n🚫 Testing Invalid Inputs', 'bold');
  log('==========================');
  
  // Test missing userUid
  await testApiEndpoint(
    'Missing UserUID',
    '/api/try-your-luck/hack-vault-win',
    { username: TEST_USERNAME, prizeAmount: 50 },
    'POST'
  );
  
  // Test invalid prize amount
  await testApiEndpoint(
    'Invalid Prize Amount',
    '/api/try-your-luck/hack-vault-win',
    { userUid: TEST_USER_UID, username: TEST_USERNAME, prizeAmount: -50 },
    'POST'
  );
  
  // Test excessive prize amount
  await testApiEndpoint(
    'Excessive Prize Amount',
    '/api/try-your-luck/hack-vault-win',
    { userUid: TEST_USER_UID, username: TEST_USERNAME, prizeAmount: 10000 },
    'POST'
  );
}

async function testDatabaseConnection() {
  log('\n🗄️  Testing Database Operations', 'bold');
  log('================================');
  
  // This would require accessing the database directly
  // For now, we'll test through the API endpoints
  logInfo('Database tests are performed through API endpoint validation');
  logInfo('Check your MongoDB to verify game results are being saved');
}

async function testPiPayoutIntegration() {
  log('\n💰 Testing Pi Payout Integration', 'bold');
  log('=================================');
  
  logInfo('Pi payout integration is tested through the win APIs above');
  logInfo('Check the server logs and your Pi wallet for actual payouts');
  logWarning('Note: Pi payouts may fail in development/sandbox mode');
}

async function testFrontendGames() {
  log('\n🎮 Frontend Game Testing URLs', 'bold');
  log('==============================');
  
  logInfo(`Hack the Vault: ${BASE_URL}/try-your-luck/hack-the-vault`);
  logInfo(`Match Pi Code: ${BASE_URL}/try-your-luck/match-code`);
  logInfo(`Try Your Luck Hub: ${BASE_URL}/try-your-luck`);
  
  log('\n📝 Manual Testing Steps:', 'yellow');
  log('1. Navigate to each game URL above');
  log('2. Login with Pi Network');
  log('3. Play the games and win');
  log('4. Check browser console for secret codes (Hack the Vault)');
  log('5. Verify Pi payouts in your wallet');
  log('6. Try to play again to test daily limits');
}

async function generateTestReport(results) {
  log('\n📊 Test Report', 'bold');
  log('===============');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  
  log(`Total Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`Failed: ${failedTests}`, failedTests === 0 ? 'green' : 'red');
  
  if (failedTests > 0) {
    log('\n❌ Failed Tests:', 'red');
    results.filter(r => !r.success).forEach(result => {
      log(`   - ${result.name}: ${result.error}`);
    });
  }
  
  log('\n🎯 Next Steps:', 'blue');
  log('1. Check server logs for detailed error messages');
  log('2. Verify MongoDB connection and data');
  log('3. Test frontend games manually');
  log('4. Check Pi wallet for actual payouts');
}

async function runAllTests() {
  const results = [];
  
  try {
    // Test core functionality
    const hackVaultResult = await testHackTheVaultWin();
    results.push({ name: 'Hack the Vault Win', ...hackVaultResult });
    
    await delay(1000); // Wait between tests
    
    const matchPiResult = await testMatchPiCodeWin();
    results.push({ name: 'Match Pi Code Win', ...matchPiResult });
    
    await delay(1000);
    
    const jackpotResult = await testJackpotWin();
    results.push({ name: 'Jackpot Win', ...jackpotResult });
    
    await delay(1000);
    
    // Test daily limits
    await testDailyLimits();
    
    // Test invalid inputs
    await testInvalidInputs();
    
    // Other tests
    await testDatabaseConnection();
    await testPiPayoutIntegration();
    await testFrontendGames();
    
    // Generate report
    await generateTestReport(results);
    
    log('\n🎉 Test Suite Complete!', 'green');
    log('Check the results above and test the frontend games manually.', 'blue');
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    console.error(error);
  }
}

// Run the test suite
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testHackTheVaultWin,
  testMatchPiCodeWin,
  testJackpotWin,
  testDailyLimits,
  testInvalidInputs,
  runAllTests
}; 