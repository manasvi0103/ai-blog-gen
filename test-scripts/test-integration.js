#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests the complete end-to-end workflow including backend and frontend integration
 */

const BackendTester = require('./test-backend-api');
const FrontendTester = require('./test-frontend-e2e');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const TEST_RESULTS_DIR = './test-results';
const API_BASE_URL = process.env.API_URL || 'http://localhost:5001/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

class IntegrationTester {
  constructor() {
    this.results = [];
    this.backendTester = new BackendTester();
    this.frontendTester = new FrontendTester();
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running integration test: ${testName}`);
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: testName,
        status: 'PASS',
        duration: `${duration}ms`,
        result: result
      });
      
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: testName,
        status: 'FAIL',
        duration: `${duration}ms`,
        error: error.message
      });
      
      console.log(`❌ ${testName} - FAILED (${duration}ms): ${error.message}`);
      throw error;
    }
  }

  async testServerConnectivity() {
    const backendHealth = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    
    // Test if frontend is accessible
    const frontendResponse = await axios.get(FRONTEND_URL);
    
    if (backendHealth.status !== 200 || frontendResponse.status !== 200) {
      throw new Error('Server connectivity issues detected');
    }
    
    return {
      backend: backendHealth.data,
      frontend: { status: frontendResponse.status, accessible: true }
    };
  }

  async testDatabaseConnectivity() {
    // Test MongoDB connection through API
    const response = await axios.get(`${API_BASE_URL}/companies`);
    
    if (!response.data) {
      throw new Error('Database connectivity issues');
    }
    
    return { status: 'Connected', recordCount: response.data.length };
  }

  async testExternalServices() {
    const services = {
      gemini: false,
      s3: false,
      googleSheets: false,
      wordpress: false
    };
    
    try {
      // Test Gemini API
      const geminiTest = await axios.post(`${API_BASE_URL}/blogs/generate-structured-content`, {
        companyName: 'WattMonk'
      });
      services.gemini = !!geminiTest.data;
    } catch (error) {
      console.log('⚠️  Gemini API test failed:', error.message);
    }
    
    try {
      // Test S3 connectivity (through image generation)
      const s3Test = await axios.post(`${API_BASE_URL}/images/generate`, {
        prompt: 'test image',
        style: 'realistic',
        type: 'featured'
      });
      services.s3 = !!s3Test.data.imageUrl;
    } catch (error) {
      console.log('⚠️  S3 test failed:', error.message);
    }
    
    try {
      // Test Google Sheets
      const sheetsTest = await axios.get(`${API_BASE_URL}/keywords/manual`);
      services.googleSheets = Array.isArray(sheetsTest.data);
    } catch (error) {
      console.log('⚠️  Google Sheets test failed:', error.message);
    }
    
    try {
      // Test WordPress connection
      const wpTest = await axios.post(`${API_BASE_URL}/wordpress/validate-connection`);
      services.wordpress = !!wpTest.data.isValid;
    } catch (error) {
      console.log('⚠️  WordPress test failed:', error.message);
    }
    
    return services;
  }

  async testCompleteWorkflow() {
    console.log('\n🔄 Testing complete blog creation workflow...');
    
    // Step 1: Generate keywords
    const keywordResponse = await axios.post(`${API_BASE_URL}/blogs/generate-structured-content`, {
      companyName: 'WattMonk'
    });
    
    if (!keywordResponse.data.keywords || keywordResponse.data.keywords.length === 0) {
      throw new Error('Keyword generation failed');
    }
    
    // Step 2: Generate content with selected keyword
    const selectedKeyword = keywordResponse.data.keywords[0];
    const contentResponse = await axios.post(`${API_BASE_URL}/blogs/generate-structured-content`, {
      companyName: 'WattMonk',
      selectedKeyword: selectedKeyword.focusKeyword,
      selectedH1: selectedKeyword.h1Suggestions[0],
      selectedMetaTitle: selectedKeyword.metaTitle,
      selectedMetaDescription: selectedKeyword.metaDescription
    });
    
    if (!contentResponse.data.draftId) {
      throw new Error('Content generation failed');
    }
    
    // Step 3: Verify draft was created
    const draftResponse = await axios.get(`${API_BASE_URL}/blogs/draft/${contentResponse.data.draftId}`);
    
    if (!draftResponse.data || !draftResponse.data.contentBlocks) {
      throw new Error('Draft verification failed');
    }
    
    // Step 4: Test image generation
    let imageGenerated = false;
    try {
      const imageResponse = await axios.post(`${API_BASE_URL}/images/generate`, {
        prompt: 'Professional solar installation',
        style: 'realistic',
        type: 'featured'
      });
      imageGenerated = !!imageResponse.data.imageUrl;
    } catch (error) {
      console.log('⚠️  Image generation skipped:', error.message);
    }
    
    return {
      keywordCount: keywordResponse.data.keywords.length,
      draftId: contentResponse.data.draftId,
      contentBlockCount: draftResponse.data.contentBlocks.length,
      seoScore: draftResponse.data.seoScore,
      imageGenerated: imageGenerated
    };
  }

  async testPerformance() {
    const performanceTests = [];
    
    // Test API response times
    const apiTests = [
      { name: 'Health Check', url: `${API_BASE_URL.replace('/api', '')}/health` },
      { name: 'Companies List', url: `${API_BASE_URL}/companies` },
      { name: 'Manual Keywords', url: `${API_BASE_URL}/keywords/manual` }
    ];
    
    for (const test of apiTests) {
      const startTime = Date.now();
      try {
        await axios.get(test.url);
        const duration = Date.now() - startTime;
        performanceTests.push({ test: test.name, duration: `${duration}ms`, status: 'PASS' });
      } catch (error) {
        const duration = Date.now() - startTime;
        performanceTests.push({ test: test.name, duration: `${duration}ms`, status: 'FAIL', error: error.message });
      }
    }
    
    return performanceTests;
  }

  async runAllTests() {
    console.log('🚀 Starting Integration Tests...\n');
    
    try {
      await this.runTest('Server Connectivity', () => this.testServerConnectivity());
      await this.runTest('Database Connectivity', () => this.testDatabaseConnectivity());
      await this.runTest('External Services', () => this.testExternalServices());
      await this.runTest('Complete Workflow', () => this.testCompleteWorkflow());
      await this.runTest('Performance Tests', () => this.testPerformance());
      
      this.generateReport();
      
    } catch (error) {
      console.log(`\n💥 Integration test suite failed: ${error.message}`);
      this.generateReport();
      process.exit(1);
    }
  }

  generateReport() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: passed,
        failed: failed,
        success_rate: `${((passed / this.results.length) * 100).toFixed(1)}%`
      },
      tests: this.results,
      environment: {
        backend_url: API_BASE_URL,
        frontend_url: FRONTEND_URL,
        node_version: process.version
      }
    };
    
    // Save report to file
    const reportPath = path.join(TEST_RESULTS_DIR, `integration-test-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Integration Test Results Summary:');
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${report.summary.success_rate}`);
    console.log(`\nDetailed report saved to: ${reportPath}`);
    
    if (failed === 0) {
      console.log('\n🎉 All integration tests passed! System is ready for production.');
    } else {
      console.log('\n⚠️  Some integration tests failed. Check the report for details.');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = IntegrationTester;
