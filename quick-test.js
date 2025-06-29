#!/usr/bin/env node

/**
 * Quick Test Script for Try Your Luck Games
 * Usage: node quick-test.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const TEST_USER = `test_${Date.now()}`;

console.log('🎮 Quick Test - Try Your Luck Games');
console.log('===================================');

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = lib.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testHackVault() {
  console.log('\n🔓 Testing Hack the Vault...');
  try {
    const result = await makeRequest('/api/try-your-luck/hack-vault-win', {
      userUid: TEST_USER,
      username: 'TestUser',
      prizeAmount: 50
    });
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ Hack the Vault - SUCCESS');
      console.log(`   Prize: ${result.data.prizeAmount}π`);
      console.log(`   Message: ${result.data.message}`);
    } else if (result.status === 400 && result.data.error?.includes('already won')) {
      console.log('⚠️  Hack the Vault - Daily limit (expected)');
    } else {
      console.log('❌ Hack the Vault - FAILED');
      console.log(`   Status: ${result.status}`);
      console.log(`   Error: ${result.data.error || result.data}`);
    }
  } catch (error) {
    console.log('❌ Hack the Vault - REQUEST FAILED');
    console.log(`   Error: ${error.message}`);
  }
}

async function testMatchPi() {
  console.log('\n🕒 Testing Match Pi Code...');
  try {
    const result = await makeRequest('/api/try-your-luck/match-pi-win', {
      userUid: TEST_USER + '_pi',
      username: 'TestUserPi',
      prizeAmount: 50,
      isJackpot: false,
      perfectTiming: true
    });
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ Match Pi Code - SUCCESS');
      console.log(`   Prize: ${result.data.prizeAmount}π`);
      console.log(`   Jackpot: ${result.data.isJackpot}`);
      console.log(`   Perfect Timing: ${result.data.perfectTiming}`);
    } else if (result.status === 400 && result.data.error?.includes('already won')) {
      console.log('⚠️  Match Pi Code - Daily limit (expected)');
    } else {
      console.log('❌ Match Pi Code - FAILED');
      console.log(`   Status: ${result.status}`);
      console.log(`   Error: ${result.data.error || result.data}`);
    }
  } catch (error) {
    console.log('❌ Match Pi Code - REQUEST FAILED');
    console.log(`   Error: ${error.message}`);
  }
}

async function testInvalidData() {
  console.log('\n🚫 Testing Invalid Data...');
  try {
    const result = await makeRequest('/api/try-your-luck/hack-vault-win', {
      // Missing userUid
      username: 'TestUser',
      prizeAmount: 50
    });
    
    if (result.status === 400) {
      console.log('✅ Invalid Data - Correctly rejected');
    } else {
      console.log('❌ Invalid Data - Should have been rejected');
    }
  } catch (error) {
    console.log('⚠️  Invalid Data - Request error (expected)');
  }
}

async function showManualTestURLs() {
  console.log('\n🎮 Manual Testing URLs:');
  console.log('========================');
  console.log(`Hack the Vault: ${BASE_URL}/try-your-luck/hack-the-vault`);
  console.log(`Match Pi Code:  ${BASE_URL}/try-your-luck/match-code`);
  console.log(`Try Your Luck:  ${BASE_URL}/try-your-luck`);
  
  console.log('\n📝 Manual Test Steps:');
  console.log('1. Open browser and navigate to game URLs');
  console.log('2. Login with Pi Network');
  console.log('3. Play games and check for Pi payouts');
  console.log('4. Open browser console to see secret codes');
  console.log('5. Check Pi wallet for received transactions');
}

async function runTests() {
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test User: ${TEST_USER}`);
  
  await testHackVault();
  await testMatchPi();
  await testInvalidData();
  await showManualTestURLs();
  
  console.log('\n🎉 Quick test complete!');
  console.log('💡 For comprehensive testing, see TESTING_GUIDE.md');
}

runTests().catch(console.error); 