#!/usr/bin/env node

/**
 * AI Blog Platform - Health Check Script
 * Checks for common issues and validates the setup
 */

const fs = require('fs');
const path = require('path');

console.log('🏥 AI Blog Platform - Health Check\n');

const issues = [];
const warnings = [];

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  issues.push(`Node.js version ${nodeVersion} is too old. Requires Node.js 18+`);
} else {
  console.log(`✅ Node.js version: ${nodeVersion}`);
}

// Check if required directories exist
const requiredDirs = [
  'ai-blog-platform-backend',
  'ai-blog-platform-frontend',
  'test-scripts',
  'config'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ Directory exists: ${dir}`);
  } else {
    issues.push(`Missing directory: ${dir}`);
  }
});

// Check if required files exist
const requiredFiles = [
  'ai-blog-platform-backend/package.json',
  'ai-blog-platform-backend/server.js',
  'ai-blog-platform-frontend/package.json',
  'ai-blog-platform-frontend/next.config.mjs',
  'config/production.env.example',
  'README.md'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ File exists: ${file}`);
  } else {
    issues.push(`Missing file: ${file}`);
  }
});

// Check backend package.json
try {
  const backendPkg = JSON.parse(fs.readFileSync('ai-blog-platform-backend/package.json', 'utf8'));
  
  // Check for required dependencies
  const requiredDeps = ['express', 'mongoose', 'cors', 'dotenv'];
  requiredDeps.forEach(dep => {
    if (backendPkg.dependencies && backendPkg.dependencies[dep]) {
      console.log(`✅ Backend dependency: ${dep}`);
    } else {
      issues.push(`Missing backend dependency: ${dep}`);
    }
  });
  
  // Check scripts
  const requiredScripts = ['start', 'dev'];
  requiredScripts.forEach(script => {
    if (backendPkg.scripts && backendPkg.scripts[script]) {
      console.log(`✅ Backend script: ${script}`);
    } else {
      warnings.push(`Missing backend script: ${script}`);
    }
  });
  
} catch (error) {
  issues.push(`Error reading backend package.json: ${error.message}`);
}

// Check frontend package.json
try {
  const frontendPkg = JSON.parse(fs.readFileSync('ai-blog-platform-frontend/package.json', 'utf8'));
  
  // Check for required dependencies
  const requiredDeps = ['next', 'react', 'react-dom'];
  requiredDeps.forEach(dep => {
    if (frontendPkg.dependencies && frontendPkg.dependencies[dep]) {
      console.log(`✅ Frontend dependency: ${dep}`);
    } else {
      issues.push(`Missing frontend dependency: ${dep}`);
    }
  });
  
  // Check scripts
  const requiredScripts = ['dev', 'build', 'start'];
  requiredScripts.forEach(script => {
    if (frontendPkg.scripts && frontendPkg.scripts[script]) {
      console.log(`✅ Frontend script: ${script}`);
    } else {
      warnings.push(`Missing frontend script: ${script}`);
    }
  });
  
} catch (error) {
  issues.push(`Error reading frontend package.json: ${error.message}`);
}

// Check environment file
if (fs.existsSync('ai-blog-platform-backend/.env')) {
  console.log('✅ Backend .env file exists');
  
  try {
    const envContent = fs.readFileSync('ai-blog-platform-backend/.env', 'utf8');
    const requiredEnvVars = ['MONGODB_URI', 'GEMINI_API_KEY'];
    
    requiredEnvVars.forEach(envVar => {
      if (envContent.includes(envVar)) {
        console.log(`✅ Environment variable configured: ${envVar}`);
      } else {
        warnings.push(`Environment variable not configured: ${envVar}`);
      }
    });
  } catch (error) {
    warnings.push(`Error reading .env file: ${error.message}`);
  }
} else {
  warnings.push('Backend .env file not found. Copy from config/production.env.example');
}

// Check test scripts
if (fs.existsSync('test-scripts/package.json')) {
  console.log('✅ Test scripts package.json exists');
  
  try {
    const testPkg = JSON.parse(fs.readFileSync('test-scripts/package.json', 'utf8'));
    const requiredDeps = ['axios', 'puppeteer'];
    
    requiredDeps.forEach(dep => {
      if (testPkg.dependencies && testPkg.dependencies[dep]) {
        console.log(`✅ Test dependency: ${dep}`);
      } else {
        warnings.push(`Missing test dependency: ${dep}`);
      }
    });
  } catch (error) {
    warnings.push(`Error reading test scripts package.json: ${error.message}`);
  }
} else {
  warnings.push('Test scripts package.json not found');
}

// Summary
console.log('\n📊 Health Check Summary:');
console.log(`✅ Checks passed: ${requiredDirs.length + requiredFiles.length - issues.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Issues: ${issues.length}`);

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`   - ${warning}`));
}

if (issues.length > 0) {
  console.log('\n❌ Issues that need to be fixed:');
  issues.forEach(issue => console.log(`   - ${issue}`));
  console.log('\nPlease fix these issues before running the application.');
  process.exit(1);
} else {
  console.log('\n🎉 Health check passed! The platform appears to be properly configured.');
  
  if (warnings.length > 0) {
    console.log('\n💡 Next steps:');
    console.log('   1. Address the warnings above');
    console.log('   2. Install dependencies: cd ai-blog-platform-backend && npm install');
    console.log('   3. Install dependencies: cd ai-blog-platform-frontend && npm install --legacy-peer-deps');
    console.log('   4. Configure environment: cp config/production.env.example ai-blog-platform-backend/.env');
    console.log('   5. Start backend: cd ai-blog-platform-backend && npm start');
    console.log('   6. Start frontend: cd ai-blog-platform-frontend && npm run dev');
  }
}

console.log('\n📚 For detailed setup instructions, see README.md');
