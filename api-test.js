#!/usr/bin/env node

/**
 * OMC API Test Script
 * Tests backend APIs without frontend dependencies
 * 
 * Usage: node api-test.js [baseUrl]
 * Example: node api-test.js http://localhost:3000
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const BASE_URL = process.argv[2] || 'http://localhost:3000';

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

async function testAPI(name, testFn) {
  try {
    const result = await testFn();
    console.log(`✅ ${name} - ${result.status}`);
    return { name, status: 'PASS', result };
  } catch (error) {
    console.log(`❌ ${name} - ERROR: ${error.message}`);
    return { name, status: 'FAIL', error: error.message };
  }
}

async function runAPITests() {
  console.log('🚀 OMC API Tests');
  console.log(`📍 Testing: ${BASE_URL}`);
  console.log('=' * 50);
  
  const results = [];
  
  // Basic endpoints
  results.push(await testAPI('Homepage', () => makeRequest(`${BASE_URL}/`)));
  results.push(await testAPI('Competitions List', () => makeRequest(`${BASE_URL}/api/competitions/all`)));
  
  // User APIs
  results.push(await testAPI('User Profile', () => makeRequest(`${BASE_URL}/api/user/profile?username=testuser`)));
  results.push(await testAPI('User Tickets', () => makeRequest(`${BASE_URL}/api/user/tickets?username=testuser`)));
  results.push(await testAPI('User Credits', () => makeRequest(`${BASE_URL}/api/user/credits?username=testuser`)));
  results.push(await testAPI('User XP Award', () => makeRequest(`${BASE_URL}/api/user/xp/award`, {
    method: 'POST',
    body: { username: 'testuser', amount: 100, reason: 'test' }
  })));
  
  // Stage system
  results.push(await testAPI('Stage Tickets List', () => makeRequest(`${BASE_URL}/api/user/stage-tickets?username=testuser`)));
  results.push(await testAPI('Stage Ticket Issue', () => makeRequest(`${BASE_URL}/api/stages/issue`, {
    method: 'POST',
    body: { username: 'testuser', stage: 2, count: 1, source: 'test' }
  })));
  
  // Referral system
  results.push(await testAPI('Referral Stats', () => makeRequest(`${BASE_URL}/api/referrals/stats?username=testuser`)));
  results.push(await testAPI('Referral Leaderboard', () => makeRequest(`${BASE_URL}/api/referrals/leaderboard`)));
  results.push(await testAPI('Referral Code Generation', () => makeRequest(`${BASE_URL}/api/user/generate-referral`, {
    method: 'POST',
    body: { username: 'testuser' }
  })));
  
  // Voucher system
  results.push(await testAPI('Voucher Generation', () => makeRequest(`${BASE_URL}/api/admin/vouchers/generate`, {
    method: 'POST',
    body: { competitionSlug: 'test', quantity: 1, maxRedemptions: 1 },
    headers: { 'x-admin': 'true' }
  })));
  results.push(await testAPI('Voucher List', () => makeRequest(`${BASE_URL}/api/admin/vouchers/list`, {
    headers: { 'x-admin': 'true' }
  })));
  results.push(await testAPI('Voucher History', () => makeRequest(`${BASE_URL}/api/admin/vouchers/history`, {
    headers: { 'x-admin': 'true' }
  })));
  
  // Admin APIs
  results.push(await testAPI('Admin Dashboard', () => makeRequest(`${BASE_URL}/api/admin/dashboard`, {
    headers: { 'x-admin': 'true' }
  })));
  results.push(await testAPI('Admin Competition Stats', () => makeRequest(`${BASE_URL}/api/admin/competitions/stats`, {
    headers: { 'x-admin': 'true' }
  })));
  results.push(await testAPI('Admin Voucher Stats', () => makeRequest(`${BASE_URL}/api/admin/voucher-stats`, {
    headers: { 'x-admin': 'true' }
  })));
  results.push(await testAPI('Admin Logs', () => makeRequest(`${BASE_URL}/api/admin/log`, {
    headers: { 'x-admin': 'true' }
  })));
  
  // Community APIs
  results.push(await testAPI('Community Pioneer', () => makeRequest(`${BASE_URL}/api/community/pioneer`)));
  results.push(await testAPI('Community Feed', () => makeRequest(`${BASE_URL}/api/community/feed`)));
  
  // Notification system
  results.push(await testAPI('Notification List', () => makeRequest(`${BASE_URL}/api/notifications/list?username=testuser`)));
  results.push(await testAPI('Notification Create', () => makeRequest(`${BASE_URL}/api/notifications/create`, {
    method: 'POST',
    body: { username: 'testuser', type: 'test', title: 'Test', message: 'Test message' }
  })));
  
  // PWA features
  results.push(await testAPI('PWA Manifest', () => makeRequest(`${BASE_URL}/manifest.json`)));
  results.push(await testAPI('Service Worker', () => makeRequest(`${BASE_URL}/sw.js`)));
  
  // Free competition
  results.push(await testAPI('Free Competition Entry', () => makeRequest(`${BASE_URL}/api/competitions/free/enter`, {
    method: 'POST',
    body: { username: 'testuser', competitionSlug: 'free-test', socialProof: 'https://twitter.com/test' }
  })));
  
  // Print summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  console.log('\n' + '=' * 50);
  console.log('📊 API TEST SUMMARY');
  console.log('=' * 50);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

runAPITests().catch(console.error);
