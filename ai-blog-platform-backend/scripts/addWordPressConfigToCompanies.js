// scripts/addWordPressConfigToCompanies.js
const mongoose = require('mongoose');
const Company = require('../models/Company');

async function addWordPressConfigToCompanies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-blog-platform');
    console.log('✅ Connected to MongoDB');

    // Find all companies without WordPress configuration
    const companies = await Company.find({
      $or: [
        { wordpressConfig: { $exists: false } },
        { 'wordpressConfig.baseUrl': { $exists: false } }
      ]
    });

    console.log(`📊 Found ${companies.length} companies without WordPress configuration`);

    for (const company of companies) {
      console.log(`\n🏢 Updating company: ${company.name}`);
      
      // Add empty WordPress configuration structure
      await Company.findByIdAndUpdate(company._id, {
        $set: {
          'wordpressConfig': {
            baseUrl: '',
            username: '',
            appPassword: '',
            isActive: false,
            connectionStatus: 'not-tested',
            lastConnectionTest: null
          }
        }
      });

      console.log(`✅ Added WordPress config structure to ${company.name}`);
    }

    console.log('\n🎉 WordPress configuration structure added to all companies!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to http://localhost:3000/wordpress-setup');
    console.log('2. Select a company and enter WordPress credentials');
    console.log('3. Test the connection');
    console.log('4. Deploy your blog posts!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addWordPressConfigToCompanies();
