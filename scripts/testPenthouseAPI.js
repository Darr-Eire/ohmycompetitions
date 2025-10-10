const axios = require('axios');

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

async function testPenthouseAPI() {
  try {
    console.log('🔄 Testing penthouse-stay API endpoint...');
    console.log('📍 Base URL:', BASE_URL);
    
    // Test the competition API endpoint
    const response = await axios.get(`${BASE_URL}/api/competitions/penthouse-stay`);
    
    console.log('✅ API Response Status:', response.status);
    console.log('📋 API Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testPenthouseAPI(); 