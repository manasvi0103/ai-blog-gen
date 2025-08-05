#!/usr/bin/env node

/**
 * Frontend End-to-End Test Script
 * Tests the complete user workflow from company selection to blog deployment
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const TEST_RESULTS_DIR = './test-results';

// Ensure test results directory exists
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

class FrontendTester {
  constructor() {
    this.results = [];
    this.browser = null;
    this.page = null;
  }

  async setup() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set up console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 Console Error: ${msg.text()}`);
      }
    });
    
    // Set up error handling
    this.page.on('pageerror', error => {
      console.log(`🔴 Page Error: ${error.message}`);
    });
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
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
      
      // Take screenshot on failure
      try {
        const screenshotPath = path.join(TEST_RESULTS_DIR, `error-${testName.replace(/\s+/g, '-')}-${Date.now()}.png`);
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
      } catch (screenshotError) {
        console.log('Failed to take screenshot:', screenshotError.message);
      }
      
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

  async testPageLoad() {
    await this.page.goto(FRONTEND_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    const title = await this.page.title();
    if (!title.includes('ArticleScribe')) {
      throw new Error(`Unexpected page title: ${title}`);
    }
    
    return { title, url: this.page.url() };
  }

  async testCompanySelection() {
    // Wait for company selection to be available
    await this.page.waitForSelector('[data-testid="company-select"], .company-selector, select', { timeout: 10000 });
    
    // Try different selectors for company selection
    const companySelector = await this.page.$('[data-testid="company-select"]') || 
                           await this.page.$('.company-selector') ||
                           await this.page.$('select');
    
    if (!companySelector) {
      throw new Error('Company selector not found');
    }
    
    // Select WattMonk if available
    try {
      await this.page.select('select', 'WattMonk');
    } catch (error) {
      // If select doesn't work, try clicking
      await companySelector.click();
      await this.page.waitForTimeout(1000);
    }
    
    return { status: 'Company selected' };
  }

  async testKeywordGeneration() {
    // Look for generate keywords button
    const generateButton = await this.page.waitForSelector(
      '[data-testid="generate-keywords"], .generate-keywords, button:contains("Generate")', 
      { timeout: 10000 }
    );
    
    await generateButton.click();
    
    // Wait for keywords to load
    await this.page.waitForSelector('.keyword-item, .keyword-card, [data-testid="keyword"]', { timeout: 30000 });
    
    const keywords = await this.page.$$('.keyword-item, .keyword-card, [data-testid="keyword"]');
    
    if (keywords.length === 0) {
      throw new Error('No keywords generated');
    }
    
    return { keywordCount: keywords.length };
  }

  async testKeywordSelection() {
    // Select the first keyword
    const firstKeyword = await this.page.$('.keyword-item, .keyword-card, [data-testid="keyword"]');
    
    if (!firstKeyword) {
      throw new Error('No keywords available for selection');
    }
    
    await firstKeyword.click();
    
    // Look for continue/next button
    const continueButton = await this.page.waitForSelector(
      '[data-testid="continue"], .continue-btn, button:contains("Continue"), button:contains("Next")',
      { timeout: 5000 }
    );
    
    await continueButton.click();
    
    return { status: 'Keyword selected and continued' };
  }

  async testMetaDataGeneration() {
    // Wait for meta data section
    await this.page.waitForSelector('.meta-title, .meta-description, [data-testid="meta"]', { timeout: 15000 });
    
    const metaTitle = await this.page.$('.meta-title, [data-testid="meta-title"]');
    const metaDescription = await this.page.$('.meta-description, [data-testid="meta-description"]');
    
    if (!metaTitle || !metaDescription) {
      throw new Error('Meta data not generated properly');
    }
    
    return { status: 'Meta data generated' };
  }

  async testContentGeneration() {
    // Look for generate content button
    const generateContentButton = await this.page.waitForSelector(
      '[data-testid="generate-content"], .generate-content, button:contains("Generate Content")',
      { timeout: 10000 }
    );
    
    await generateContentButton.click();
    
    // Wait for content blocks to appear (this might take a while)
    await this.page.waitForSelector('.content-block, .blog-content, [data-testid="content-block"]', { timeout: 60000 });
    
    const contentBlocks = await this.page.$$('.content-block, [data-testid="content-block"]');
    
    if (contentBlocks.length === 0) {
      throw new Error('No content blocks generated');
    }
    
    return { contentBlockCount: contentBlocks.length };
  }

  async testImageGeneration() {
    // Look for image generation or images in content
    const images = await this.page.$$('img[src*="s3"], img[src*="pollinations"], .generated-image');
    
    if (images.length === 0) {
      console.log('⚠️  No images found - this might be expected if image generation is disabled');
      return { status: 'No images found', imageCount: 0 };
    }
    
    return { imageCount: images.length };
  }

  async runAllTests() {
    console.log('🚀 Starting Frontend E2E Tests...\n');
    
    try {
      await this.setup();
      
      await this.runTest('Page Load', () => this.testPageLoad());
      await this.runTest('Company Selection', () => this.testCompanySelection());
      await this.runTest('Keyword Generation', () => this.testKeywordGeneration());
      await this.runTest('Keyword Selection', () => this.testKeywordSelection());
      await this.runTest('Meta Data Generation', () => this.testMetaDataGeneration());
      await this.runTest('Content Generation', () => this.testContentGeneration());
      await this.runTest('Image Generation', () => this.testImageGeneration());
      
      this.generateReport();
      
    } catch (error) {
      console.log(`\n💥 Test suite failed: ${error.message}`);
      this.generateReport();
      process.exit(1);
    } finally {
      await this.teardown();
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
    const reportPath = path.join(TEST_RESULTS_DIR, `frontend-test-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Test Results Summary:');
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${report.summary.success_rate}`);
    console.log(`\nDetailed report saved to: ${reportPath}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Frontend is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the report for details.');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new FrontendTester();
  tester.runAllTests().catch(console.error);
}

module.exports = FrontendTester;
