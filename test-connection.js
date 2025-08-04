// Simple test script to verify backend connection
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testConnection() {
  console.log('🧪 Testing Backend Connection...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:5001/health');
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: API Info
    console.log('2️⃣ Testing API Info...');
    const apiResponse = await axios.get('http://localhost:5001/api');
    console.log('✅ API Info:', apiResponse.data);
    console.log('');

    // Test 3: Companies Endpoint
    console.log('3️⃣ Testing Companies Endpoint...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/company`);
    console.log('✅ Companies:', companiesResponse.data);
    console.log('');

    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Start frontend: cd ai-blog-platform-frontend && npm run dev');
    console.log('2. Open browser: http://localhost:3000');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Solution: Backend server is not running');
      console.log('   Run: cd ai-blog-platform-backend && npm start');
    } else if (error.response) {
      console.log('');
      console.log('📊 Error Details:');
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

// Run the test
testConnection();
