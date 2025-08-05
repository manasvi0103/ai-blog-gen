# AI Blog Platform - Production Ready

A comprehensive AI-powered blog generation platform that creates SEO-optimized, company-specific content with automated WordPress deployment capabilities.

## 🚀 Features

### Core Functionality
- **AI-Powered Content Generation**: Uses Google Gemini AI for high-quality, company-specific blog content
- **SEO Optimization**: Built-in RankMath compliance with 85-88/100 SEO scores
- **Dynamic Image Generation**: AI-generated images with company branding
- **WordPress Integration**: One-click deployment to WordPress sites
- **Company-Specific Content**: Tailored content based on company profiles and services
- **Keyword Research**: Manual and AI-generated keyword suggestions with trend analysis
- **Real-time Preview**: Live editing and preview capabilities
- **Markdown Support**: Rich formatting with tables, lists, and professional styling

### Technical Features
- **Production Ready**: Comprehensive error handling, logging, and monitoring
- **Scalable Architecture**: Modular design with microservices approach
- **Cloud Storage**: AWS S3 integration for image storage
- **Database**: MongoDB for data persistence
- **API-First**: RESTful API with comprehensive documentation
- **Testing Suite**: Automated testing for backend, frontend, and integration
- **Deployment Scripts**: One-command production deployment

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [API Documentation](#api-documentation)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Architecture](#architecture)
8. [Troubleshooting](#troubleshooting)
9. [Contributing](#contributing)

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 4.4+
- Git

### 1. Clone and Install
```bash
git clone <repository-url>
cd ai-blog-platform

# Install backend dependencies
cd ai-blog-platform-backend
npm install

# Install frontend dependencies
cd ../ai-blog-platform-frontend
npm install --legacy-peer-deps

# Install test dependencies
cd ../test-scripts
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp config/production.env.example ai-blog-platform-backend/.env

# Edit configuration (see Configuration section)
nano ai-blog-platform-backend/.env
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd ai-blog-platform-backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd ai-blog-platform-frontend
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/health

## 🔧 Installation

### System Requirements
- **OS**: Linux, macOS, or Windows
- **Node.js**: Version 18.0.0 or higher
- **MongoDB**: Version 4.4 or higher
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: 10GB free space

### Detailed Installation Steps

#### 1. Install Node.js and npm
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (using Homebrew)
brew install node

# Windows
# Download from https://nodejs.org/
```

#### 2. Install MongoDB
```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# macOS
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

#### 3. Clone Repository
```bash
git clone <repository-url>
cd ai-blog-platform
```

#### 4. Install Dependencies
```bash
# Backend
cd ai-blog-platform-backend
npm install

# Frontend
cd ../ai-blog-platform-frontend
npm install --legacy-peer-deps

# Test Scripts
cd ../test-scripts
npm install
```

## ⚙️ Configuration

### Environment Variables

Copy the example environment file and configure:
```bash
cp config/production.env.example ai-blog-platform-backend/.env
```

#### Required Configuration

**Database**
```env
MONGODB_URI=mongodb://localhost:27017/ai-blog-platform
```

**AI Services**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Cloud Storage**
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your-s3-bucket-name
```

#### Optional Configuration

**Google Sheets Integration**
```env
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
```

**WordPress Integration**
```env
WORDPRESS_SITE_URL=https://your-wordpress-site.com
WORDPRESS_USERNAME=your_wp_username
WORDPRESS_PASSWORD=your_wp_app_password
```

**News APIs**
```env
NEWSDATA_API_KEY=your_newsdata_api_key
GNEWS_API_KEY=your_gnews_api_key
```

### API Keys Setup Guide

#### 1. Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `GEMINI_API_KEY` in .env

#### 2. AWS S3 Setup
1. Create AWS account and S3 bucket
2. Create IAM user with S3 permissions
3. Add credentials to .env file

#### 3. Google Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sheets API
3. Create API key or service account
4. Add to .env file

#### 4. WordPress Setup
1. Install WordPress site
2. Create Application Password in user profile
3. Add credentials to .env file

## 📚 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication
Currently using API key authentication. Include in headers:
```
Authorization: Bearer your-api-key
```

### Core Endpoints

#### Blog Generation
```http
POST /api/blogs/generate-structured-content
Content-Type: application/json

{
  "companyName": "WattMonk",
  "selectedKeyword": "solar panel installation",
  "selectedH1": "Complete Guide to Solar Panel Installation",
  "selectedMetaTitle": "Solar Panel Installation Guide | WattMonk",
  "selectedMetaDescription": "Learn professional solar panel installation..."
}
```

#### Image Generation
```http
POST /api/images/generate
Content-Type: application/json

{
  "prompt": "Professional solar installation",
  "style": "realistic",
  "type": "featured"
}
```

#### WordPress Deployment
```http
POST /api/wordpress/deploy
Content-Type: application/json

{
  "draftId": "draft_id_here",
  "publishStatus": "draft"
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Handling
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}

## 🧪 Testing

The platform includes comprehensive test scripts to verify all functionality.

### Test Scripts

#### 1. Backend API Tests
```bash
cd test-scripts
npm run test:backend
```
Tests all backend APIs including:
- Health checks
- Company data fetching
- Keyword generation
- Blog content generation
- Image generation
- SEO optimization
- WordPress connection

#### 2. Frontend E2E Tests
```bash
cd test-scripts
npm run test:frontend
```
Tests complete user workflow:
- Page loading
- Company selection
- Keyword generation and selection
- Meta data generation
- Content generation
- Image generation

#### 3. Integration Tests
```bash
cd test-scripts
npm run test:integration
```
Tests system integration:
- Server connectivity
- Database connectivity
- External services
- Complete workflow
- Performance metrics

#### 4. Run All Tests
```bash
cd test-scripts
npm run test:all
```

### Test Results
All tests generate detailed reports in `test-results/` directory with:
- Success/failure status
- Performance metrics
- Error details
- Screenshots (for frontend tests)

## 🚀 Deployment

### Automated Production Deployment
```bash
# Make script executable (Linux/Mac)
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

The deployment script handles:
- Dependency installation
- Environment validation
- Database setup
- Frontend building
- Service configuration
- Health checks

### Manual Production Setup

#### 1. Environment Configuration
```bash
# Copy environment template
cp config/production.env.example ai-blog-platform-backend/.env

# Edit with your production values
nano ai-blog-platform-backend/.env

# Set production environment
export NODE_ENV=production
```

#### 2. Install Dependencies
```bash
# Backend dependencies
cd ai-blog-platform-backend
npm install --production

# Frontend dependencies
cd ../ai-blog-platform-frontend
npm install --legacy-peer-deps
```

#### 3. Build & Start
```bash
# Build frontend
cd ai-blog-platform-frontend
npm run build

# Start backend (Terminal 1)
cd ../ai-blog-platform-backend
npm start

# Start frontend (Terminal 2)
cd ../ai-blog-platform-frontend
npm start
```

### Docker Deployment (Optional)
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • User Interface│    │ • API Routes    │    │ • Google Gemini │
│ • Blog Editor   │    │ • AI Services   │    │ • AWS S3        │
│ • Preview       │    │ • WordPress API │    │ • WordPress     │
│ • Deployment    │    │ • Database      │    │ • News APIs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **User Input** → Frontend collects company and keyword preferences
2. **AI Generation** → Backend uses Gemini AI to create content
3. **SEO Optimization** → Content optimized for RankMath compliance
4. **Image Generation** → AI creates relevant images with branding
5. **WordPress Deployment** → Content deployed as draft with proper formatting

### Key Components

#### Frontend (Next.js 14)
- **App Router**: Modern routing with server components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Error Boundaries**: Graceful error handling
- **Real-time Updates**: Live content preview

#### Backend (Node.js/Express)
- **RESTful API**: Clean, documented endpoints
- **MongoDB**: Document-based data storage
- **Service Layer**: Modular external integrations
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed request/response logging

#### External Integrations
- **Google Gemini**: AI content generation
- **AWS S3**: Image storage and CDN
- **WordPress REST API**: Content deployment
- **News APIs**: Trend analysis and keyword research
- **Google Sheets**: Manual keyword management

## 🚨 Troubleshooting

### Common Issues

#### 1. ChunkLoadError (Frontend)
**Problem**: JavaScript chunk loading errors in browser
**Solution**:
```bash
# Clear browser cache (Ctrl+Shift+R)
# Or restart frontend server
cd ai-blog-platform-frontend
npm run dev
```

#### 2. MongoDB Connection Failed
**Problem**: Cannot connect to database
**Solution**:
```bash
# Check MongoDB status
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS

# Verify connection string
echo $MONGODB_URI
```

#### 3. Gemini API Errors
**Problem**: AI content generation fails
**Solution**:
```bash
# Verify API key
echo $GEMINI_API_KEY

# Test API connection
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models
```

#### 4. WordPress Deployment Failed
**Problem**: Cannot deploy to WordPress
**Solution**:
```bash
# Test WordPress connection
cd ai-blog-platform-backend
node -e "
const axios = require('axios');
axios.get('$WORDPRESS_SITE_URL/wp-json/wp/v2/users/me', {
  auth: {
    username: '$WORDPRESS_USERNAME',
    password: '$WORDPRESS_PASSWORD'
  }
}).then(r => console.log('✅ Connected')).catch(e => console.log('❌ Failed:', e.message));
"
```

#### 5. Image Generation Issues
**Problem**: Images not generating or uploading
**Solution**:
```bash
# Check AWS credentials
aws s3 ls s3://$S3_BUCKET_NAME

# Verify S3 permissions
# Ensure bucket has public read access for images
```

### Debug Commands
```bash
# Check all environment variables
cd ai-blog-platform-backend
node -e "console.log(process.env)" | grep -E "(GEMINI|MONGODB|WORDPRESS|AWS)"

# Test all services
npm run test:health

# View logs
tail -f logs/backend.log
tail -f logs/frontend.log
```

### Performance Issues
- **Slow content generation**: Check Gemini API rate limits
- **High memory usage**: Restart services periodically
- **Database slow queries**: Add indexes for frequently queried fields
- **Image upload timeouts**: Increase timeout values in configuration

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test:all`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards
- **TypeScript**: Use strict typing
- **ESLint**: Follow configured linting rules
- **Prettier**: Format code consistently
- **Testing**: Add tests for new features
- **Documentation**: Update README for new features

### Project Structure
```
ai-blog-platform/
├── ai-blog-platform-backend/     # Express.js backend
├── ai-blog-platform-frontend/    # Next.js frontend
├── test-scripts/                 # Automated test suites
├── config/                       # Configuration templates
├── scripts/                      # Deployment and utility scripts
└── README.md                     # This documentation
```

## 📊 Production Checklist

### Before Deployment
- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] WordPress credentials verified
- [ ] AWS S3 bucket configured
- [ ] API keys validated
- [ ] Tests passing
- [ ] Frontend built successfully
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Monitoring setup

### Security Checklist
- [ ] Environment variables secured
- [ ] WordPress application passwords (not regular passwords)
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive data
- [ ] Database access restricted
- [ ] API keys rotated regularly

### Performance Checklist
- [ ] Frontend optimized and minified
- [ ] Images compressed and optimized
- [ ] Database queries optimized
- [ ] Caching implemented
- [ ] CDN configured for static assets
- [ ] Monitoring and alerting setup
- [ ] Backup strategy implemented
- [ ] Load testing completed

## 📞 Support

### Getting Help
1. **Documentation**: Check this comprehensive README
2. **Test Scripts**: Run automated diagnostics
3. **Debug Commands**: Use built-in debugging tools
4. **Logs**: Check application logs for errors
5. **Health Checks**: Verify system status

### Reporting Issues
When reporting issues, please include:
- Operating system and version
- Node.js version
- Error messages and logs
- Steps to reproduce
- Expected vs actual behavior

---

## 🎉 Success Metrics

### Performance Targets
- **Content Generation**: < 15 seconds
- **WordPress Deployment**: < 5 seconds
- **SEO Score**: 85-100/100 (RankMath)
- **Uptime**: 99.9%
- **Error Rate**: < 1%

### Quality Metrics
- **Content Quality**: Company-specific, SEO-optimized
- **Image Quality**: Professional, branded images
- **WordPress Integration**: Seamless deployment
- **User Experience**: Intuitive, fast workflow

---

**🚀 Ready to generate amazing AI-powered blog content!**

*This platform combines cutting-edge AI technology with seamless WordPress integration to create a complete blog generation solution for modern businesses.*


