#!/usr/bin/env node

/**
 * OMC Test Runner
 * Runs all test suites in sequence
 * 
 * Usage: node run-tests.js [baseUrl]
 * Example: node run-tests.js http://localhost:3000
 */

const { spawn } = require('child_process');
const path = require('path');

const BASE_URL = process.argv[2] || 'http://localhost:3000';

function runTest(scriptName, description) {
  return new Promise((resolve) => {
    console.log(`\n🚀 Running ${description}...`);
    console.log('=' * 50);
    
    const child = spawn('node', [scriptName, BASE_URL], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    child.on('close', (code) => {
      console.log(`\n✅ ${description} completed with exit code: ${code}`);
      resolve(code === 0);
    });
    
    child.on('error', (error) => {
      console.error(`❌ Error running ${description}:`, error);
      resolve(false);
    });
  });
}

async function runAllTests() {
  console.log('🎯 OMC Comprehensive Test Suite');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('=' * 60);
  
  const startTime = Date.now();
  const results = [];
  
  // Run API tests first (fastest)
  results.push(await runTest('api-test.js', 'API Tests'));
  
  // Run quick tests
  results.push(await runTest('quick-test.js', 'Quick Tests'));
  
  // Run comprehensive tests
  results.push(await runTest('test-features.js', 'Comprehensive Feature Tests'));
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Summary
  console.log('\n' + '=' * 60);
  console.log('📊 FINAL TEST SUMMARY');
  console.log('=' * 60);
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Test Suites Passed: ${passed}/${total}`);
  console.log(`⏱️  Total Duration: ${duration}s`);
  console.log(`📈 Overall Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! OMC is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Review any failed tests above');
  console.log('2. Run manual tests using MANUAL_TEST_CHECKLIST.md');
  console.log('3. Test in Pi Browser specifically');
  console.log('4. Deploy to staging environment for final validation');
  
  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch(console.error);
