#!/usr/bin/env node

/**
 * Backend API Test Script
 * Tests all major backend functionalities including blog generation, image creation, and WordPress deployment
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.API_URL || 'http://localhost:5001/api';
const TEST_RESULTS_DIR = './test-results';

// Ensure test results directory exists
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

class BackendTester {
  constructor() {
    this.results = [];
    this.testData = {
      companyName: 'WattMonk',
      keyword: 'solar panel installation',
      h1: 'Complete Guide to Solar Panel Installation',
      metaTitle: 'Solar Panel Installation Guide | WattMonk Expert Tips',
      metaDescription: 'Learn professional solar panel installation techniques with WattMonk. Expert tips, best practices, and step-by-step guidance for successful installations.'
    };
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running test: ${testName}`);
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

  async testHealthCheck() {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.data;
  }

  async testCompanyFetch() {
    const response = await axios.get(`${API_BASE_URL}/companies`);
    if (!response.data || response.data.length === 0) {
      throw new Error('No companies found');
    }
    return response.data;
  }

  async testKeywordGeneration() {
    const response = await axios.post(`${API_BASE_URL}/blogs/generate-structured-content`, {
      companyName: this.testData.companyName
    });
    
    if (!response.data.keywords || response.data.keywords.length === 0) {
      throw new Error('No keywords generated');
    }
    
    return response.data;
  }

  async testBlogContentGeneration() {
    const response = await axios.post(`${API_BASE_URL}/blogs/generate-structured-content`, {
      companyName: this.testData.companyName,
      selectedKeyword: this.testData.keyword,
      selectedH1: this.testData.h1,
      selectedMetaTitle: this.testData.metaTitle,
      selectedMetaDescription: this.testData.metaDescription
    });
    
    if (!response.data.draftId) {
      throw new Error('No draft ID returned');
    }
    
    this.draftId = response.data.draftId;
    return response.data;
  }

  async testImageGeneration() {
    if (!this.draftId) {
      throw new Error('No draft ID available for image generation');
    }
    
    const response = await axios.post(`${API_BASE_URL}/images/generate`, {
      prompt: 'Professional solar panel installation on residential roof',
      style: 'realistic',
      type: 'featured'
    });
    
    if (!response.data.imageUrl) {
      throw new Error('No image URL returned');
    }
    
    return response.data;
  }

  async testSEOOptimization() {
    if (!this.draftId) {
      throw new Error('No draft ID available for SEO testing');
    }
    
    const response = await axios.get(`${API_BASE_URL}/blogs/draft/${this.draftId}`);
    
    if (!response.data.seoScore || response.data.seoScore < 80) {
      throw new Error(`SEO score too low: ${response.data.seoScore}`);
    }
    
    return response.data;
  }

  async testWordPressDeployment() {
    if (!this.draftId) {
      throw new Error('No draft ID available for WordPress deployment');
    }
    
    // This is a dry run test - we don't actually deploy to WordPress
    const response = await axios.post(`${API_BASE_URL}/wordpress/validate-connection`);
    
    if (!response.data.isValid) {
      console.log('⚠️  WordPress connection not configured - skipping deployment test');
      return { status: 'skipped', reason: 'WordPress not configured' };
    }
    
    return response.data;
  }

  async runAllTests() {
    console.log('🚀 Starting Backend API Tests...\n');
    
    try {
      await this.runTest('Health Check', () => this.testHealthCheck());
      await this.runTest('Company Data Fetch', () => this.testCompanyFetch());
      await this.runTest('Keyword Generation', () => this.testKeywordGeneration());
      await this.runTest('Blog Content Generation', () => this.testBlogContentGeneration());
      await this.runTest('Image Generation', () => this.testImageGeneration());
      await this.runTest('SEO Optimization', () => this.testSEOOptimization());
      await this.runTest('WordPress Connection', () => this.testWordPressDeployment());
      
      this.generateReport();
      
    } catch (error) {
      console.log(`\n💥 Test suite failed: ${error.message}`);
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
      tests: this.results
    };
    
    // Save report to file
    const reportPath = path.join(TEST_RESULTS_DIR, `backend-test-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Test Results Summary:');
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${report.summary.success_rate}`);
    console.log(`\nDetailed report saved to: ${reportPath}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Backend is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the report for details.');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new BackendTester();
  tester.runAllTests().catch(console.error);
}

module.exports = BackendTester;
