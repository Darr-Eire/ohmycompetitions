const axios = require('axios');

// Configuration
const BASE_URL = 'https://0e5168d0d549.ngrok-free.app'; // Change this to your server URL
const TEST_USER_UID = 'b172eb2c-7e7d-4c81-8111-4a9f11ddb2d0'; // The user UID from your logs

const headers = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

// Test cases
const testCases = [
  {
    name: 'Send 0.1π reward',
    userUid: TEST_USER_UID,
    amount: 0.1,
    memo: 'Test reward payout',
    reason: 'test_reward',
    metadata: { testCase: 'reward_payout' }
  },
  {
    name: 'Send 0.05π referral bonus',
    userUid: TEST_USER_UID,
    amount: 0.05,
    memo: 'Referral bonus for bringing friends',
    reason: 'referral_bonus',
    metadata: { testCase: 'referral_bonus', referrals: 1 }
  }
];

// Helper function to make API calls with error handling
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers,
      timeout: 30000
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
}

// Test function: Send A2U payment
async function testSendPayout(testCase) {
  console.log(`\n🔄 Testing: ${testCase.name}`);
  console.log('📝 Payload:', testCase);

  const result = await makeRequest('POST', '/api/pi/send-payout', {
    userUid: testCase.userUid,
    amount: testCase.amount,
    memo: testCase.memo,
    reason: testCase.reason,
    metadata: testCase.metadata
  });

  if (result.success) {
    console.log('✅ Payout created successfully:', {
      paymentId: result.data.paymentId,
      amount: result.data.amount,
      username: result.data.username,
      status: result.data.status
    });
    return result.data.paymentId;
  } else {
    console.log('❌ Payout failed:', result.error);
    return null;
  }
}

// Test function: Check payout status
async function testPayoutStatus(paymentId) {
  console.log(`\n🔄 Checking status for payment: ${paymentId}`);

  const result = await makeRequest('GET', `/api/pi/payout-status?paymentId=${paymentId}`);

  if (result.success) {
    console.log('✅ Status retrieved:', {
      paymentId: result.data.paymentId,
      username: result.data.username,
      amount: result.data.amount,
      status: result.data.status,
      piStatus: result.data.piStatus
    });
    return result.data;
  } else {
    console.log('❌ Status check failed:', result.error);
    return null;
  }
}

// Test function: List all payouts
async function testListPayouts(filters = {}) {
  console.log('\n🔄 Testing: List all payouts');
  if (Object.keys(filters).length > 0) {
    console.log('📝 Filters:', filters);
  }

  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = `/api/pi/list-payouts${queryParams ? '?' + queryParams : ''}`;

  const result = await makeRequest('GET', endpoint);

  if (result.success) {
    console.log('✅ Payouts retrieved:', {
      count: result.data.payouts.length,
      totalCount: result.data.pagination.totalCount,
      currentPage: result.data.pagination.currentPage,
      totalPages: result.data.pagination.totalPages
    });

    // Show first few payouts
    if (result.data.payouts.length > 0) {
      console.log('📋 Recent payouts:');
      result.data.payouts.slice(0, 3).forEach((payout, index) => {
        console.log(`  ${index + 1}. ${payout.username} - ${payout.amount}π - ${payout.status} (${payout.reason})`);
      });
    }
    return result.data;
  } else {
    console.log('❌ List payouts failed:', result.error);
    return null;
  }
}

// Test function: Invalid scenarios
async function testInvalidScenarios() {
  console.log('\n🔄 Testing: Invalid scenarios');

  const invalidTests = [
    {
      name: 'Missing userUid',
      data: { amount: 0.1, memo: 'Test' },
      expectedStatus: 400
    },
    {
      name: 'Missing amount',
      data: { userUid: TEST_USER_UID, memo: 'Test' },
      expectedStatus: 400
    },
    {
      name: 'Invalid amount (too high)',
      data: { userUid: TEST_USER_UID, amount: 1001, memo: 'Test' },
      expectedStatus: 400
    },
    {
      name: 'Invalid amount (negative)',
      data: { userUid: TEST_USER_UID, amount: -0.1, memo: 'Test' },
      expectedStatus: 400
    },
    {
      name: 'Non-existent user',
      data: { userUid: 'fake-user-uid', amount: 0.1, memo: 'Test' },
      expectedStatus: 404
    }
  ];

  for (const test of invalidTests) {
    console.log(`\n  📝 ${test.name}`);
    const result = await makeRequest('POST', '/api/pi/send-payout', test.data);
    
    if (!result.success && result.error.status === test.expectedStatus) {
      console.log(`  ✅ Correctly rejected: ${result.error.data?.error || result.error.message}`);
    } else if (result.success) {
      console.log(`  ❌ Unexpectedly succeeded (should have failed with ${test.expectedStatus})`);
    } else {
      console.log(`  ⚠️  Failed with wrong status: expected ${test.expectedStatus}, got ${result.error.status}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting App-to-User Payment Tests');
  console.log('=====================================');

  const createdPayments = [];

  // Test 1: Send payouts
  console.log('\n📤 TESTING PAYOUT CREATION');
  for (const testCase of testCases) {
    const paymentId = await testSendPayout(testCase);
    if (paymentId) {
      createdPayments.push(paymentId);
    }
  }

  // Wait a bit for payments to process
  if (createdPayments.length > 0) {
    console.log('\n⏳ Waiting 3 seconds for payments to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Test 2: Check status of created payments
  console.log('\n📋 TESTING STATUS CHECKS');
  for (const paymentId of createdPayments) {
    await testPayoutStatus(paymentId);
  }

  // Test 3: List payouts
  console.log('\n📂 TESTING PAYOUT LISTING');
  await testListPayouts();
  
  // Test with filters
  await testListPayouts({ status: 'created', limit: '5' });
  await testListPayouts({ userUid: TEST_USER_UID, limit: '10' });

  // Test 4: Invalid scenarios
  console.log('\n🚫 TESTING INVALID SCENARIOS');
  await testInvalidScenarios();

  console.log('\n✅ All tests completed!');
  console.log('=====================================');

  if (createdPayments.length > 0) {
    console.log('\n📝 Created payment IDs for manual verification:');
    createdPayments.forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`);
    });
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`
App-to-User Payment Testing Script
==================================

Usage: node test-a2u-payments.js [options]

Options:
  --help           Show this help message
  --send-only      Only test payout creation
  --status-only    Only test status checking (requires payment ID)
  --list-only      Only test listing payouts
  --invalid-only   Only test invalid scenarios

Examples:
  node test-a2u-payments.js
  node test-a2u-payments.js --send-only
  node test-a2u-payments.js --status-only
  `);
  process.exit(0);
}

// Run specific tests based on arguments
if (args.includes('--send-only')) {
  console.log('🚀 Running payout creation tests only');
  (async () => {
    for (const testCase of testCases) {
      await testSendPayout(testCase);
    }
  })();
} else if (args.includes('--status-only')) {
  console.log('🚀 Running status check test');
  console.log('💡 Tip: Replace with actual payment ID for real testing');
  testPayoutStatus('test-payment-id');
} else if (args.includes('--list-only')) {
  console.log('🚀 Running list payouts test only');
  testListPayouts();
} else if (args.includes('--invalid-only')) {
  console.log('🚀 Running invalid scenarios test only');
  testInvalidScenarios();
} else {
  // Run all tests
  runAllTests().catch(console.error);
} 