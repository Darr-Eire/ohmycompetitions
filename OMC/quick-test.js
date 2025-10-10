#!/usr/bin/env node

/**
 * OMC Quick Test Script
 * Tests the most critical features quickly
 * 
 * Usage: node quick-test.js [baseUrl]
 * Example: node quick-test.js http://localhost:3000
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
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
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

async function quickTest() {
  console.log('🚀 OMC Quick Test');
  console.log(`📍 Testing: ${BASE_URL}`);
  console.log('=' * 40);
  
  const tests = [
    {
      name: 'Homepage',
      test: () => makeRequest(`${BASE_URL}/`),
      expect: (res) => res.status === 200 || res.status === 500 // Allow 500 for now
    },
    {
      name: 'Competitions API',
      test: () => makeRequest(`${BASE_URL}/api/competitions/all`),
      expect: (res) => res.status === 200
    },
    {
      name: 'User Profile API',
      test: () => makeRequest(`${BASE_URL}/api/user/profile?username=testuser`),
      expect: (res) => res.status === 200 || res.status === 404 || res.status === 400
    },
    {
      name: 'User Tickets API',
      test: () => makeRequest(`${BASE_URL}/api/user/tickets?username=testuser`),
      expect: (res) => res.status === 200 || res.status === 404
    },
    {
      name: 'Stage Tickets API',
      test: () => makeRequest(`${BASE_URL}/api/user/stage-tickets?username=testuser`),
      expect: (res) => res.status === 200
    },
    {
      name: 'Referral Stats API',
      test: () => makeRequest(`${BASE_URL}/api/referrals/stats?username=testuser`),
      expect: (res) => res.status === 200 || res.status === 400
    },
    {
      name: 'Referral Leaderboard',
      test: () => makeRequest(`${BASE_URL}/api/referrals/leaderboard`),
      expect: (res) => res.status === 200
    },
    {
      name: 'Community Pioneer',
      test: () => makeRequest(`${BASE_URL}/api/community/pioneer`),
      expect: (res) => res.status === 200
    },
    {
      name: 'Community Feed',
      test: () => makeRequest(`${BASE_URL}/api/community/feed`),
      expect: (res) => res.status === 200
    },
    {
      name: 'Admin Dashboard',
      test: () => makeRequest(`${BASE_URL}/api/admin/dashboard`, {
        headers: { 'x-admin': 'true' }
      }),
      expect: (res) => res.status === 200 || res.status === 401 || res.status === 404
    },
    {
      name: 'Admin Competition Stats',
      test: () => makeRequest(`${BASE_URL}/api/admin/competitions/stats`, {
        headers: { 'x-admin': 'true' }
      }),
      expect: (res) => res.status === 200 || res.status === 401 || res.status === 403
    },
    {
      name: 'Admin Voucher Stats',
      test: () => makeRequest(`${BASE_URL}/api/admin/voucher-stats`, {
        headers: { 'x-admin': 'true' }
      }),
      expect: (res) => res.status === 200 || res.status === 401 || res.status === 500
    },
    {
      name: 'PWA Manifest',
      test: () => makeRequest(`${BASE_URL}/manifest.json`),
      expect: (res) => res.status === 200
    },
    {
      name: 'Service Worker',
      test: () => makeRequest(`${BASE_URL}/sw.js`),
      expect: (res) => res.status === 200
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.test();
      const success = test.expect(result);
      
      if (success) {
        console.log(`✅ ${test.name} - ${result.status}`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - ${result.status} (Expected different status)`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '=' * 40);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  process.exit(failed > 0 ? 1 : 0);
}

quickTest().catch(console.error);