/**
 * Test script for Elementor service
 * Run with: node test-elementor.js
 */

try {
  console.log('🔄 Loading Elementor service...');
  const elementorService = require('./services/elementorService');
  console.log('✅ Elementor service loaded successfully');
} catch (error) {
  console.error('❌ Error loading Elementor service:', error.message);
  process.exit(1);
}

const elementorService = require('./services/elementorService');

// Sample content blocks (similar to what your system generates)
const sampleContentBlocks = [
  {
    id: "title-1",
    type: "title",
    content: "What Is Solo Solar Software? Complete Guide for Solar Professionals"
  },
  {
    id: "intro-1", 
    type: "introduction",
    content: "Solo is a cloud-based, sales-driven solar proposal platform tailored for speed, simplicity, and scale. WattMonk's expertise in solar design and engineering makes Solo an ideal choice for solar professionals looking to streamline their proposal process."
  },
  {
    id: "h2-1",
    type: "h2", 
    content: "Feature Highlights"
  },
  {
    id: "section-1",
    type: "paragraph",
    content: "Solo offers several key features that set it apart from other solar software solutions. The DirectDesign & Fast Proposal Engine generates comprehensive proposals in minutes, while integrated financing supports real-time financing options for customers."
  },
  {
    id: "list-1",
    type: "list",
    content: "DirectDesign & Fast Proposal Engine - Generates proposals in minutes\nIntegrated Financing - Supports real-time financing options\nCloud-Based Platform - Access from anywhere\nUser-Friendly Interface - Simplified workflow for solar professionals"
  },
  {
    id: "h2-2", 
    type: "h2",
    content: "Benefits for Solar Installers"
  },
  {
    id: "section-2",
    type: "paragraph", 
    content: "Solar installers benefit significantly from Solo's streamlined approach. The platform reduces proposal generation time from hours to minutes, allowing installers to focus on customer relationships and project execution rather than administrative tasks."
  },
  {
    id: "image-1",
    type: "image",
    imageUrl: "https://example.com/solar-dashboard.jpg",
    alt: "Solo solar software dashboard interface"
  }
];

console.log('🧪 Testing Elementor Service...\n');

// Test 1: Convert content blocks to Elementor JSON
console.log('📋 Test 1: Converting content blocks to Elementor JSON');
const elementorJSON = elementorService.convertToElementorJSON(sampleContentBlocks, 'solo solar software');

console.log(`✅ Generated ${elementorJSON.length} Elementor sections`);
console.log('📄 First section structure:');
console.log(JSON.stringify(elementorJSON[0], null, 2));

// Test 2: Generate complete meta data
console.log('\n📋 Test 2: Generating complete Elementor meta data');
const metaData = elementorService.generateElementorMetaData(sampleContentBlocks, 'solo solar software');

console.log(`✅ Generated ${Object.keys(metaData).length} meta fields:`);
Object.keys(metaData).forEach(key => {
  if (key === '_elementor_data') {
    console.log(`  ${key}: [JSON data - ${metaData[key].length} characters]`);
  } else {
    console.log(`  ${key}: ${metaData[key]}`);
  }
});

// Test 3: Verify JSON structure
console.log('\n📋 Test 3: Verifying JSON structure');
try {
  const parsedData = JSON.parse(metaData._elementor_data);
  console.log(`✅ Valid JSON structure with ${parsedData.length} sections`);
  
  // Count widgets
  let widgetCount = 0;
  parsedData.forEach(section => {
    section.elements.forEach(column => {
      widgetCount += column.elements.length;
    });
  });
  console.log(`✅ Total widgets: ${widgetCount}`);
  
} catch (error) {
  console.error('❌ Invalid JSON structure:', error.message);
}

// Test 4: Test individual widget conversion
console.log('\n📋 Test 4: Testing individual widget conversion');
const testBlocks = [
  { type: 'h1', content: 'Main Heading' },
  { type: 'h2', content: 'Sub Heading' },
  { type: 'paragraph', content: 'This is a paragraph with some content.' },
  { type: 'list', content: 'Item 1\nItem 2\nItem 3' }
];

testBlocks.forEach(block => {
  const widget = elementorService.convertBlockToWidget(block, 'test keyword');
  console.log(`✅ ${block.type} -> ${widget.widgetType} widget`);
});

console.log('\n🎉 All tests completed successfully!');
console.log('\n📝 Sample WordPress API call:');
console.log(`
const postData = {
  title: "Your Blog Title",
  content: "<!-- Elementor content managed via _elementor_data meta field -->",
  status: "draft",
  meta: ${JSON.stringify(metaData, null, 2)}
};

// Send to WordPress
axios.post('https://your-site.com/wp-json/wp/v2/posts', postData, {
  headers: {
    'Authorization': 'Basic YOUR_AUTH',
    'Content-Type': 'application/json'
  }
});
`);
