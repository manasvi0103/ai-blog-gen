// services/geminiService.js
const axios = require('axios');
require('dotenv').config();

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    // Use multiple models for fallback when one is overloaded
    this.textModels = [
      'gemini-2.0-flash-exp', // Latest Gemini 2.0 Flash (PRIMARY - most efficient)
      'gemini-1.5-pro-002',   // High quality fallback
      'gemini-1.5-flash-002', // Faster fallback
      'gemini-pro'            // Final fallback model
    ];
    this.currentModelIndex = 0;
    this.imageModel = 'imagen-3.0-generate-001'; // Imagen 3.0 for image generation
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async generateContent(prompt, companyContext = {}) {
    // Validate company context to ensure content is always company-specific
    const validatedContext = this.validateCompanyContext(companyContext);

    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      console.warn('⚠️ Gemini API key not configured, using high-quality fallback content');
      return this.generateHighQualityFallback(prompt, validatedContext);
    }

    // Try multiple models in case one is overloaded
    for (let i = 0; i < this.textModels.length; i++) {
      const model = this.textModels[i];
      try {
        console.log(`🤖 Trying Gemini model: ${model}`);
        console.log('🔑 Gemini API Key in service:', this.apiKey ? 'SET' : 'NOT SET');

        const contextualPrompt = this.buildContextualPrompt(prompt, validatedContext);

        const response = await axios.post(
          `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`,
          {
            contents: [{
              parts: [{
                text: contextualPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
              candidateCount: 1,
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000 // 30 second timeout
          }
        );

        const generatedText = response.data.candidates[0].content.parts[0].text;
        console.log(`✅ Successfully generated content with ${model}`);
        console.log(`🔍 Generated content preview: "${generatedText.substring(0, 200)}..."`);
        console.log(`🏢 Company mentioned in content: ${generatedText.includes(validatedContext.name || 'WattMonk') ? 'YES' : 'NO'}`);

        return {
          content: generatedText,
          keywords: this.extractKeywords(generatedText),
          wordCount: generatedText.split(' ').length
        };

      } catch (error) {
        console.error(`❌ Model ${model} failed:`, error.response?.data?.error?.message || error.message);

        // If this is the last model, use high-quality fallback
        if (i === this.textModels.length - 1) {
          console.warn('🔄 All Gemini models failed, using high-quality fallback content');
          return this.generateHighQualityFallback(prompt, companyContext);
        }

        // Try next model
        continue;
      }
    }
  }

  /**
   * Validate and ensure company context is properly set for company-specific content
   * @param {Object} companyContext - Company context object
   * @returns {Object} Validated company context with required fields
   */
  validateCompanyContext(companyContext = {}) {
    const validated = { ...companyContext };

    // Ensure required company fields are present
    if (!validated.name) {
      console.warn('⚠️ Company name missing in context, defaulting to WattMonk');
      validated.name = 'WattMonk';
    }

    if (!validated.servicesOffered) {
      console.warn('⚠️ Company services missing in context, using default');
      validated.servicesOffered = 'Solar Design, Engineering, Permitting, Installation Support';
    }

    if (!validated.serviceOverview) {
      console.warn('⚠️ Company service overview missing in context, using default');
      validated.serviceOverview = 'Professional solar design, engineering, permitting, and installation support services';
    }

    if (!validated.aboutTheCompany) {
      console.warn('⚠️ Company description missing in context, using default');
      validated.aboutTheCompany = 'WattMonk is a technology-driven solar services company providing end-to-end solar solutions.';
    }

    console.log(`✅ Company context validated for: ${validated.name}`);
    return validated;
  }

  generateHighQualityFallback(prompt, companyContext = {}) {
    console.log('🎯 Generating high-quality fallback content for prompt:', prompt.substring(0, 100) + '...');
    console.log('🏢 Company context in fallback:', companyContext.name || 'NOT SET');

    const keyword = companyContext.keyword || this.extractKeywordFromPrompt(prompt);
    const companyName = companyContext.name || 'WattMonk';

    // Detect what type of content is being requested
    if (prompt.toLowerCase().includes('meta title') || prompt.toLowerCase().includes('metatitle')) {
      return {
        content: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Solutions | ${companyName} Expert Guide`,
        keywords: [keyword, 'solutions', 'guide'],
        wordCount: 8
      };
    }

    if (prompt.toLowerCase().includes('meta description') || prompt.toLowerCase().includes('metadescription')) {
      return {
        content: `Discover comprehensive ${keyword} solutions with ${companyName}. Expert insights, practical tips, and proven strategies for solar professionals and homeowners.`,
        keywords: [keyword, 'solutions', 'expert', 'solar'],
        wordCount: 22
      };
    }

    if (prompt.toLowerCase().includes('h1') || prompt.toLowerCase().includes('title') || prompt.toLowerCase().includes('heading')) {
      const h1Options = [
        `Complete ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Guide for Solar Professionals`,
        `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: Expert Solutions and Best Practices`,
        `Professional ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Implementation Guide`,
        `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Mastery: From Basics to Advanced Strategies`
      ];
      const selectedH1 = h1Options[Math.floor(Math.random() * h1Options.length)];

      return {
        content: selectedH1,
        keywords: [keyword, 'guide', 'professional', 'solar'],
        wordCount: selectedH1.split(' ').length
      };
    }

    // For longer content (paragraphs, sections, etc.)
    const contentTemplates = this.getContentTemplates(keyword, companyName, companyContext);
    const selectedTemplate = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];

    return {
      content: selectedTemplate,
      keywords: this.extractKeywords(selectedTemplate),
      wordCount: selectedTemplate.split(' ').length
    };
  }

  extractKeywordFromPrompt(prompt) {
    // Try to extract keyword from common prompt patterns
    const patterns = [
      /for (?:the )?(?:keyword |focus keyword )?["']([^"']+)["']/i,
      /about ["']([^"']+)["']/i,
      /regarding ["']([^"']+)["']/i,
      /on ["']([^"']+)["']/i,
      /titled? ["']([^"']+)["']/i
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) {
        return match[1].toLowerCase();
      }
    }

    // Default fallback
    return 'solar energy solutions';
  }

  /**
   * Enhance content with company-specific information and links
   * @param {string} content - Generated content
   * @param {Object} companyContext - Company information
   * @param {string} keyword - Focus keyword
   * @returns {string} Enhanced content with company info and links
   */
  enhanceContentWithCompanyInfo(content, companyContext, keyword) {
    if (!content || !companyContext.name) return content;

    console.log(`🏢 Enhancing content with ${companyContext.name} information`);
    console.log(`🔍 Content type: ${typeof content}, Content preview: "${String(content).substring(0, 100)}..."`);

    // Ensure content is a string
    if (typeof content !== 'string') {
      console.log(`⚠️ Content is not a string! Type: ${typeof content}, Converting...`);
      content = String(content);
    }

    // Clean any JSON objects that might have been inserted into content
    content = this.cleanJSONFromContent(content);

    let enhancedContent = content;

    // Ensure company mentions are present (MANDATORY for company-specific content)
    const companyMentions = (enhancedContent.match(new RegExp(companyContext.name, 'gi')) || []).length;
    console.log(`🏢 Company mentions found: ${companyMentions} for ${companyContext.name}`);

    if (companyMentions === 0) {
      console.log(`⚠️ No company mentions found! Adding ${companyContext.name} to content...`);
      // Add company mention in first paragraph
      const firstParagraph = enhancedContent.split('\n')[0];
      if (firstParagraph && firstParagraph.length > 20) {
        const enhancedFirstParagraph = firstParagraph.replace(
          /\. /,
          `. At ${companyContext.name}, our expertise in ${companyContext.servicesOffered || 'solar services'} helps clients optimize their ${keyword} strategies. `
        );
        enhancedContent = enhancedContent.replace(firstParagraph, enhancedFirstParagraph);
      } else {
        // If first paragraph is too short, add at the beginning
        enhancedContent = `At ${companyContext.name}, we specialize in ${companyContext.servicesOffered || 'solar services'} and understand the importance of ${keyword}. ${enhancedContent}`;
      }
    }

    // Ensure minimum company mentions (at least 2)
    if (companyMentions < 2) {
      console.log(`⚠️ Only ${companyMentions} company mentions found! Adding more references to ${companyContext.name}...`);
      // Add company mention in conclusion if content is long enough
      if (enhancedContent.length > 500) {
        enhancedContent += `\n\n${companyContext.name}'s team of experts is ready to help you with your ${keyword} needs. Contact us to learn more about our ${companyContext.servicesOffered || 'solar services'}.`;
      }
    }

    // Add relevant links
    const linkPatterns = [
      {
        trigger: /solar panel/i,
        link: 'https://www.nrel.gov/solar/',
        text: 'NREL solar research'
      },
      {
        trigger: /installation/i,
        link: 'https://www.seia.org/solar-industry-research-data',
        text: 'SEIA installation data'
      },
      {
        trigger: /energy/i,
        link: 'https://www.energy.gov/eere/solar',
        text: 'Department of Energy solar information'
      }
    ];

    linkPatterns.forEach(pattern => {
      if (pattern.trigger.test(enhancedContent) && !enhancedContent.includes(pattern.link)) {
        enhancedContent = enhancedContent.replace(
          pattern.trigger,
          `$& (according to ${pattern.text} at ${pattern.link})`
        );
      }
    });

    // Add WattMonk service links where relevant
    if (companyContext.name === 'WattMonk' && !enhancedContent.includes('wattmonk.com')) {
      enhancedContent += `\n\nFor professional ${keyword} solutions, visit WattMonk's services at https://www.wattmonk.com/service/ to learn more about our ${companyContext.servicesOffered || 'solar services'}.`;
    }

    return enhancedContent;
  }

  /**
   * Clean JSON objects and database references from content
   * @param {string} content - Content that might contain JSON objects
   * @returns {string} Cleaned content without JSON objects
   */
  cleanJSONFromContent(content) {
    if (!content || typeof content !== 'string') return content;

    console.log('🧹 Cleaning JSON objects from content...');

    // Remove JSON objects like { name: 'Solar Sales Proposal', description: '', _id: new ObjectId("...") }
    const jsonObjectRegex = /\{\s*[^}]*(?:name|_id|description|ObjectId)[^}]*\}/g;
    let cleanedContent = content.replace(jsonObjectRegex, '');

    // Remove MongoDB ObjectId references
    const objectIdRegex = /new ObjectId\([^)]*\)/g;
    cleanedContent = cleanedContent.replace(objectIdRegex, '');

    // Remove standalone object references like { name: '...', ... }
    const standaloneObjectRegex = /\{\s*[^}]*:\s*[^}]*\}/g;
    cleanedContent = cleanedContent.replace(standaloneObjectRegex, '');

    // Clean up extra spaces and line breaks
    cleanedContent = cleanedContent
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*,/g, ',')
      .replace(/\s*\.\s*\./g, '.')
      .trim();

    if (content !== cleanedContent) {
      console.log('🧹 Removed JSON objects from content');
      console.log('📝 Before:', content.substring(0, 200) + '...');
      console.log('✅ After:', cleanedContent.substring(0, 200) + '...');
    }

    return cleanedContent;
  }

  getContentTemplates(keyword, companyName, companyContext = {}) {
    const services = companyContext.servicesOffered || 'solar services';
    const about = companyContext.aboutTheCompany || 'professional solar company';
    const overview = companyContext.serviceOverview || 'solar solutions';

    return [
      `Understanding **${keyword}** is essential for modern solar professionals and homeowners looking to maximize their energy efficiency. At **${companyName}**, our expertise in *${services}* has helped thousands of clients optimize their ${keyword} strategies.

According to [NREL research](https://www.nrel.gov/solar/), proper ${keyword} implementation can significantly improve system performance. ${about} Our comprehensive approach combines industry best practices with cutting-edge technology to deliver exceptional results for every ${keyword} project.

> **Key Benefits:**
> - Enhanced system performance through proper implementation
> - Cost-effective solutions tailored to your needs
> - Industry-leading expertise and support

Furthermore, our team provides:
- **Professional consultation** and system analysis
- **Custom design solutions** for residential and commercial projects
- **Ongoing support** and maintenance services`,

      `The solar industry continues to evolve rapidly, and **${keyword}** represents a significant opportunity for both residential and commercial applications. **${companyName}** specializes in *${services}*, providing clients with cutting-edge ${keyword} solutions that are both cost-effective and environmentally sustainable.

Our team's experience with ${overview} ensures that every ${keyword} implementation meets the highest industry standards. Professional installers and energy consultants trust **${companyName}** to stay current with the latest developments in ${keyword}.

## Key Advantages of Our Approach

| Feature | Benefit | Impact |
|---------|---------|---------|
| **Expert Design** | Optimized system performance | Up to 25% efficiency gain |
| **Quality Components** | Long-term reliability | 25+ year lifespan |
| **Professional Installation** | Code compliance | Worry-free operation |

Additionally, we provide:
1. **Comprehensive site assessment** and feasibility studies
2. **Custom engineering solutions** for complex installations
3. **Permit assistance** and regulatory compliance support`,

      `When it comes to **${keyword}**, proper planning and execution are crucial for success. **${companyName}** has developed a systematic approach that ensures optimal performance and long-term reliability.

Our expertise in *${services}* spans multiple applications, from small residential projects to large-scale commercial installations. According to [SEIA data](https://www.seia.org/solar-industry-research-data), projects with proper ${keyword} planning show **25% better performance**. This makes **${companyName}** the trusted choice for solar professionals nationwide.

### Our Proven Process:

1. **Initial Assessment** - Comprehensive site evaluation and energy analysis
2. **Custom Design** - Tailored solutions using advanced modeling software
3. **Professional Installation** - Certified technicians ensure quality workmanship
4. **System Commissioning** - Thorough testing and performance verification

> *"Proper ${keyword} implementation is the foundation of any successful solar project. Our systematic approach ensures every detail is optimized for maximum performance."* - ${companyName} Engineering Team`,

      `**${keyword.charAt(0).toUpperCase() + keyword.slice(1)}** technology has revolutionized the way we approach solar energy systems. **${companyName}** leverages advanced ${keyword} techniques through our *${services}* to optimize system performance and reduce installation costs.

${about} Our team of certified professionals brings years of experience in ${keyword} implementation, ensuring that every project meets the highest standards of quality and efficiency.

## Why Choose ${companyName}?

- ✅ **Industry Expertise** - Over 1000+ successful installations
- ✅ **Advanced Technology** - Latest tools and software for optimal design
- ✅ **Quality Assurance** - Rigorous testing and validation processes
- ✅ **Customer Support** - Dedicated team for ongoing assistance

### Technical Specifications:
- **System Efficiency**: Up to 22% module efficiency
- **Warranty Coverage**: 25-year performance guarantee
- **Installation Time**: Typically 1-3 days for residential projects

Visit [WattMonk Services](https://www.wattmonk.com/service/) to learn more about our comprehensive ${keyword} solutions and how we can help optimize your solar project.`
    ];
  }

  buildContextualPrompt(prompt, companyContext) {
    let contextualPrompt = '';

    console.log('🔍 Building contextual prompt with company context:', JSON.stringify(companyContext, null, 2));

    // Ensure all company context values are strings, not objects
    const cleanContext = {};
    for (const [key, value] of Object.entries(companyContext || {})) {
      if (typeof value === 'object' && value !== null) {
        console.log(`⚠️ Found object in companyContext.${key}:`, value);
        // Extract meaningful string from object
        if (value.name) {
          cleanContext[key] = value.name;
        } else if (value.title) {
          cleanContext[key] = value.title;
        } else if (value.description) {
          cleanContext[key] = value.description;
        } else if (Array.isArray(value)) {
          // Handle arrays by joining them
          cleanContext[key] = value.join(', ');
        } else {
          // For other objects, try to extract meaningful text or skip
          console.warn(`⚠️ Skipping object in companyContext.${key} - cannot extract meaningful text`);
          cleanContext[key] = ''; // Set to empty string instead of stringifying object
        }
      } else {
        cleanContext[key] = value || '';
      }
    }

    if (cleanContext.name) {
      contextualPrompt += `Company: ${cleanContext.name}\n`;
    }
    if (cleanContext.tone) {
      contextualPrompt += `Tone: ${cleanContext.tone}\n`;
    }
    if (cleanContext.brandVoice) {
      contextualPrompt += `Brand Voice: ${cleanContext.brandVoice}\n`;
    }
    if (cleanContext.serviceOverview) {
      contextualPrompt += `Services: ${cleanContext.serviceOverview}\n`;
    }
    if (cleanContext.targetAudience) {
      contextualPrompt += `Target Audience: ${cleanContext.targetAudience}\n`;
    }

    // Add WattMonk styling instructions for blog content
    contextualPrompt += `\nSTYLING REQUIREMENTS:
- Use professional formatting with clear section organization
- Structure content with bullet points and numbered lists where appropriate
- Follow WattMonk blog template structure with proper spacing
- Ensure content is well-organized with clear headings and subheadings
- Use professional tone suitable for solar industry professionals
- Include relevant technical details while maintaining readability

CONTENT REQUIREMENTS (CRITICAL):
- NEVER use placeholders like [Company Name], [Solar Company Name], or [Number]
- ALWAYS use the actual company name: "${cleanContext.name || 'WattMonk'}"
- ALWAYS reference specific services: "${cleanContext.servicesOffered || 'Solar Design, Engineering, Permitting, Installation Support'}"
- ALWAYS include actual company expertise and background
- ALWAYS write as if you are an expert from ${cleanContext.name || 'WattMonk'}

RANKMATH CONTENT STRUCTURE REQUIREMENTS (CRITICAL FOR SEO):
- Use proper paragraph structure (3-5 sentences per paragraph)
- Start each paragraph with strong topic sentences
- Use transition words between paragraphs (Furthermore, Additionally, Moreover, However, Therefore, In addition)
- Include bullet points or numbered lists for better readability (at least 2-3 per section)
- Use short sentences (under 25 words) mixed with medium sentences (25-35 words)
- Ensure proper heading hierarchy (H1 > H2 > H3)
- Include specific examples, statistics, and actionable insights
- End sections with clear transitions or conclusions
- Use active voice whenever possible
- Include relevant keywords naturally throughout the content

MARKDOWN FORMATTING REQUIREMENTS (CRITICAL FOR READABILITY):
- Use **bold text** for important terms and key concepts (minimum 5-8 per section)
- Use *italic text* for emphasis and technical terms (minimum 2-3 per section)
- Use proper markdown headings (## for H2, ### for H3) with clear hierarchy
- Format bullet points with proper markdown (- or *) for lists and benefits
- Format numbered lists with proper markdown (1. 2. 3.) for processes and steps
- Use tables with proper markdown formatting when presenting data or comparisons
- Use > blockquotes for important quotes, statistics, or key insights
- Use code formatting for technical specifications, measurements, and numbers
- Use [link text](URL) format for all external links
- Ensure proper line breaks and spacing between sections (double line breaks)
- Use horizontal rules (---) to separate major sections when appropriate
- Include checkmarks (✅) for benefits and advantages lists
- Use proper table formatting with | separators and alignment
- ALWAYS use specific, actionable information rather than vague statements
- ALWAYS start content with company introduction like "At ${cleanContext.name || 'WattMonk'}, we..."

CONTENT FORMATTING EXAMPLES (FOLLOW THESE PATTERNS):
- **Bold for key terms**: "Understanding **solar PTO interconnection** is essential..."
- *Italic for emphasis*: "At *WattMonk*, our expertise in solar design..."
- Tables for data: | Feature | Benefit | Impact |
- Blockquotes for stats: > "Projects show 25% better performance with proper planning"
- Lists with checkmarks: ✅ **Industry Expertise** - Over 1000+ installations
- Code for specs: System efficiency up to 22% module efficiency
- Proper links: [NREL research](https://www.nrel.gov/solar/)
- Line spacing: Use double line breaks between sections for readability

COMPANY INTEGRATION REQUIREMENTS (MANDATORY):
- MUST mention "${cleanContext.name || 'WattMonk'}" by name at least 2-3 times in content
- MUST reference specific services: "${cleanContext.servicesOffered || 'Solar Design, Engineering, Permitting, Installation Support'}"
- MUST include company background: "${cleanContext.aboutTheCompany || 'WattMonk is a technology-driven solar services company providing end-to-end solar solutions'}"
- MUST write as if you are representing ${cleanContext.name || 'WattMonk'} directly
- MUST show how ${cleanContext.name || 'WattMonk'}'s expertise applies to the topic
- MUST include real examples from ${cleanContext.name || 'WattMonk'}'s experience
- NEVER use generic terms like "solar company" or "the company" - always use "${cleanContext.name || 'WattMonk'}"
- Do NOT mention competitors or other companies unless specifically comparing ${cleanContext.name || 'WattMonk'}'s advantages
- ALL examples, case studies, and references must be related to ${cleanContext.name || 'WattMonk'}'s services and expertise

LINK INTEGRATION REQUIREMENTS:
- Include 1-2 relevant industry links naturally in content
- Use authoritative sources: NREL, SEIA, Energy.gov, IRENA
- Format links naturally: "According to NREL research (https://www.nrel.gov/solar/), solar installations..."
- Include WattMonk service links where relevant: https://www.wattmonk.com/service/
- Make links contextual and valuable to readers\n`;

    contextualPrompt += `\n${prompt}`;
    return contextualPrompt;
  }

  extractKeywords(text) {
    // Simple keyword extraction - can be enhanced with NLP libraries
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const frequency = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  async generateKeywordSuggestions(focusKeyword, companyContext) {
    const prompt = `Generate 15 related keywords and long-tail keywords for the focus keyword "${focusKeyword}". 
    Consider SEO best practices and search intent. Format as a comma-separated list.`;
    
    try {
      const result = await this.generateContent(prompt, companyContext);
      const keywords = result.content
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      
      return keywords;
    } catch (error) {
      console.error('Keyword generation error:', error);
      return [];
    }
  }

  async generateMetaContent(title, companyContext) {
    const prompt = `Generate SEO-optimized meta title (max 60 characters) and meta description (max 160 characters) for the article title: "${title}". 
    Format as JSON: {"metaTitle": "...", "metaDescription": "..."}`;
    
    try {
      const result = await this.generateContent(prompt, companyContext);
      return JSON.parse(result.content.replace(/```json|```/g, ''));
    } catch (error) {
      console.error('Meta content generation error:', error);
      return {
        metaTitle: title.substring(0, 60),
        metaDescription: `Learn more about ${title.toLowerCase()}`
      };
    }
  }

  async generateH1Alternatives(focusKeyword, articleFormat, companyContext) {
    const prompt = `Generate 5 different H1 title alternatives for a ${articleFormat} article about "${focusKeyword}".
    Make them engaging, SEO-friendly, and include the focus keyword. Format as JSON array.`;

    try {
      const result = await this.generateContent(prompt, companyContext);
      const titles = JSON.parse(result.content.replace(/```json|```/g, ''));
      return Array.isArray(titles) ? titles : [titles];
    } catch (error) {
      console.error('H1 generation error:', error);
      return [`Complete Guide to ${focusKeyword}`];
    }
  }

  async generateStructuredBlogContent(draftData, trendData = []) {
    const { selectedKeyword, selectedH1, selectedMetaTitle, selectedMetaDescription, companyName, companyContext, targetWordCount = 2500, strictKeywordFocus, generateAllBlocks } = draftData;

    console.log(`🎯 GENERATING SEO-OPTIMIZED CONTENT FOR KEYWORD: "${selectedKeyword}"`);
    console.log(`📝 SELECTED H1: ${selectedH1}`);
    console.log(`📝 SELECTED Meta Title: ${selectedMetaTitle}`);
    console.log(`📝 SELECTED Meta Description: ${selectedMetaDescription}`);
    console.log(`🏢 Company: ${companyName}`);
    console.log(`📊 Target Word Count: ${targetWordCount}`);
    console.log(`🔒 Strict Keyword Focus: ${strictKeywordFocus}`);
    console.log(`📦 Generate All Blocks: ${generateAllBlocks}`);

    // Generate keyword-specific links using the link service
    const linkService = require('./linkService');
    const linkData = await linkService.generateInboundOutboundLinks(selectedKeyword, companyName, trendData);

    console.log(`🔗 Generated ${linkData.inboundLinks.length} inbound and ${linkData.outboundLinks.length} outbound links for "${selectedKeyword}"`);

    // Calculate dynamic word counts based on target
    const introWords = Math.round(targetWordCount * 0.08); // 8% for intro (150-200 words for 2500 target)
    const sectionWords = Math.round(targetWordCount * 0.18); // 18% per section (450 words for 2500 target)
    const conclusionWords = Math.round(targetWordCount * 0.10); // 10% for conclusion (250 words for 2500 target)

    console.log(`📊 Dynamic word distribution for ${targetWordCount} total words:`);
    console.log(`   Introduction: ${introWords} words`);
    console.log(`   Each section: ${sectionWords} words`);
    console.log(`   Conclusion: ${conclusionWords} words`);

    const expertPrompt = `You are a professional solar industry content writer. Create a comprehensive blog article about "${selectedKeyword}" for ${companyName}.

CRITICAL REQUIREMENTS:
- Total word count: ${targetWordCount} words
- Write naturally like a human expert
- Focus exclusively on "${selectedKeyword}"
- Include ${companyName} naturally throughout
- NO AI phrases or robotic language
- Create engaging, actionable content

RESPOND WITH VALID JSON ONLY (no extra text):
{
  "title": "${selectedH1}",
  "metaTitle": "${selectedMetaTitle}",
  "metaDescription": "${selectedMetaDescription}",
  "content": "Write a complete ${targetWordCount}-word blog article about ${selectedKeyword}. Structure it with:

  1. Engaging introduction paragraph (${introWords} words) that hooks readers about ${selectedKeyword}

  2. Main content with 4-5 natural sections covering:
     - What ${selectedKeyword} is and why it matters
     - Key benefits and advantages of ${selectedKeyword}
     - How ${selectedKeyword} works in practice
     - Cost considerations and ROI for ${selectedKeyword}
     - Choosing the right ${selectedKeyword} solution

  3. Strong conclusion (${conclusionWords} words) with ${companyName} call-to-action

  Format with proper HTML:
  - Use <h2 style='color: #FBD46F; font-family: Roboto; font-weight: 600;'> for section headings
  - Use <p> tags for paragraphs
  - Include <strong> for emphasis
  - Add <ul> and <li> for bullet points where appropriate
  - Naturally mention ${companyName} 3-4 times throughout
  - Use ${selectedKeyword} 8-10 times total
  - Write engaging, professional content that provides real value"
}`;

    try {
      const result = await this.generateContent(expertPrompt, {
        name: companyName,
        targetAudience: 'Solar industry professionals',
        tone: 'Professional, empathetic, conversational'
      });

      // Clean and parse JSON response
      let cleanContent = result.content.replace(/```json|```/g, '').trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.substring(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.substring(0, cleanContent.length - 3);
      }

      const parsedContent = JSON.parse(cleanContent);

      // Clean the content and ensure proper formatting
      if (parsedContent.content) {
        // Clean any markdown and ensure proper HTML formatting
        parsedContent.content = this.cleanMarkdown(parsedContent.content);

        // Ensure H2 tags have the correct styling
        parsedContent.content = parsedContent.content.replace(
          /<h2[^>]*>/g,
          "<h2 style='color: #FBD46F; font-family: Roboto; font-weight: 600;'>"
        );
      }

      // Calculate actual word count
      const actualWordCount = this.countWords(parsedContent.content || '');

      console.log(`📊 Word Count Analysis for "${selectedKeyword}":`);
      console.log(`   Target: ${targetWordCount} words`);
      console.log(`   Actual: ${actualWordCount} words`);
      console.log(`   Accuracy: ${Math.round((actualWordCount / targetWordCount) * 100)}%`);

      return {
        success: true,
        content: {
          title: parsedContent.title,
          metaTitle: parsedContent.metaTitle,
          metaDescription: parsedContent.metaDescription,
          content: parsedContent.content,
          internalLinks: linkData.inboundLinks || [],
          externalLinks: linkData.outboundLinks || []
        },
        wordCount: actualWordCount,
        seoScore: this.calculateSEOScore(parsedContent.content, selectedKeyword, parsedContent.metaTitle, parsedContent.metaDescription),
        message: `Professional blog content generated (${actualWordCount} words)`
      };
    } catch (error) {
      console.error('Structured content generation error:', error);
      // Return fallback structure
      return this.generateFallbackContent(selectedKeyword, selectedH1, linkData, companyContext);
    }
  }

  generateFallbackContent(keyword, h1Title, linkData = { inboundLinks: [], outboundLinks: [] }, companyContext = {}) {
    console.log(`🎯 Generating comprehensive fallback content for keyword: "${keyword}"`);

    // Generate much more detailed and realistic content
    const sections = this.generateDetailedSections(keyword, companyContext);
    const introduction = this.generateDetailedIntroduction(keyword, companyContext);
    const conclusion = this.generateDetailedConclusion(keyword, companyContext);

    return {
      title: h1Title,
      introduction: introduction,
      sections: sections,
      conclusion: conclusion,
      inboundLinks: linkData.inboundLinks || [],
      outboundLinks: linkData.outboundLinks || [],
      totalWordCount: this.calculateTotalWordCount(introduction, sections, conclusion)
    };
  }

  generateDetailedIntroduction(keyword, companyContext = {}) {
    const companyName = companyContext.name || 'WattMonk';
    const services = companyContext.servicesOffered || 'Solar Design, Engineering, Permitting, Installation Support';

    const intros = [
      `Are you ready to unlock the full potential of ${keyword}? At ${companyName}, we understand that a successful solar project goes beyond simply installing panels. It requires meticulous planning, innovative design, and precise engineering. That's where our ${services} come in. We transform sunlight into sustainable power, tailored to your unique needs. Forget cookie-cutter solutions. We delve deep, analyzing your site, energy consumption, and financial goals. Our team of experienced engineers and designers utilizes cutting-edge technology to create optimized solar solutions. We maximize energy production and minimize costs.`,

      `The solar industry is experiencing unprecedented growth, and ${keyword} has emerged as a critical component for both residential and commercial applications. At ${companyName}, our expertise in ${services} has helped thousands of clients navigate this evolving landscape. As energy costs continue to rise and environmental concerns become more pressing, understanding ${keyword} is essential for homeowners, business owners, and solar professionals alike. This comprehensive guide explores the fundamental principles, practical applications, and long-term benefits of ${keyword}, providing you with the knowledge needed to make informed decisions about your solar energy investments.`,

      `As the solar industry continues to mature and technology advances at an unprecedented pace, ${keyword} has become increasingly important for achieving optimal system performance and return on investment. At ${companyName}, our ${services} are designed to provide solar professionals, homeowners, and business decision-makers with the essential knowledge needed to navigate the complexities of ${keyword}. From initial planning and system design to installation best practices and long-term maintenance, we'll explore every aspect of ${keyword} to help you achieve your energy goals.`
    ];

    return intros[Math.floor(Math.random() * intros.length)];
  }

  generateDetailedSections(keyword, companyContext = {}) {
    const companyName = companyContext.name || 'WattMonk';
    const services = companyContext.servicesOffered || 'Solar Design, Engineering, Permitting, Installation Support';

    return [
      {
        h2: `Understanding ${keyword}: Fundamentals and Core Concepts`,
        content: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} encompasses a range of technologies, methodologies, and best practices that are essential for modern solar energy systems. At ${companyName}, our ${services} demonstrate how ${keyword} involves the strategic integration of advanced solar technologies with proven installation techniques to maximize energy production and system efficiency. Professional solar installers and energy consultants rely on ${keyword} principles to design systems that not only meet current energy needs but also provide long-term value and reliability. The key components of ${keyword} include proper system sizing, optimal panel placement, efficient inverter selection, and comprehensive monitoring solutions that ensure peak performance throughout the system's lifespan.`,
        includesKeyword: true
      },
      {
        h2: `Benefits and Advantages of ${keyword} Implementation`,
        content: `Implementing ${keyword} solutions offers numerous advantages for both residential and commercial applications. At ${companyName}, our experience with ${services} shows that cost savings represent one of the most significant benefits, with properly designed ${keyword} systems typically reducing energy bills by 70-90% or more. Environmental impact is another crucial consideration, as ${keyword} systems significantly reduce carbon emissions and contribute to a more sustainable energy future. Additionally, ${keyword} implementations often increase property values, provide energy independence, and offer protection against rising utility costs. For businesses, ${keyword} solutions can also provide tax incentives, improve corporate sustainability profiles, and demonstrate environmental responsibility to customers and stakeholders.`,
        includesKeyword: true
      },
      {
        h2: `${keyword} Installation Process and Best Practices`,
        content: `The successful implementation of ${keyword} requires careful planning, professional expertise, and adherence to industry best practices. At ${companyName}, our ${services} begin with a comprehensive site assessment to evaluate factors such as roof condition, shading, orientation, and local building codes. Professional installers then design a customized ${keyword} system that maximizes energy production while ensuring compliance with all safety and regulatory requirements. Installation involves precise mounting of solar panels, proper electrical connections, inverter setup, and integration with existing electrical systems. Quality ${keyword} installations also include comprehensive testing, system commissioning, and detailed documentation to ensure optimal performance and warranty compliance.`,
        includesKeyword: true
      },
      {
        h2: `Maintenance and Long-term Performance of ${keyword} Systems`,
        content: `Proper maintenance is essential for ensuring the long-term performance and reliability of ${keyword} systems. At ${companyName}, our ${services} include regular maintenance activities such as visual inspections, performance monitoring, cleaning when necessary, and periodic electrical testing to identify potential issues before they impact system performance. Most ${keyword} systems are designed to operate efficiently for 25-30 years with minimal maintenance requirements. However, proactive maintenance can extend system life, optimize energy production, and protect warranty coverage. Professional maintenance services typically include annual inspections, performance analysis, and preventive maintenance to ensure that ${keyword} systems continue to deliver maximum value throughout their operational lifespan.`,
        includesKeyword: true
      }
    ];
  }

  generateDetailedConclusion(keyword, companyContext = {}) {
    const companyName = companyContext.name || 'WattMonk';
    const services = companyContext.servicesOffered || 'Solar Design, Engineering, Permitting, Installation Support';

    const conclusions = [
      `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} represents a transformative opportunity for anyone looking to harness the power of solar energy effectively. At ${companyName}, our expertise in ${services} has helped thousands of clients achieve their energy goals through effective ${keyword} implementation. As technology continues to advance and costs continue to decline, ${keyword} solutions are becoming increasingly accessible and attractive for both residential and commercial applications. By understanding the fundamental principles, benefits, and implementation strategies outlined in this guide, you'll be well-equipped to make informed decisions about ${keyword} and achieve your energy goals. Partner with ${companyName} and harness the sun's power with confidence.`,

      `The future of solar energy is bright, and ${keyword} will continue to play a crucial role in driving innovation and adoption across all market segments. At ${companyName}, our ${services} demonstrate how ${keyword} offers significant benefits in terms of cost savings, environmental impact, and energy independence. For solar professionals, mastering ${keyword} principles and best practices is essential for delivering exceptional value to clients and staying competitive in a rapidly evolving market. For homeowners and business owners, understanding ${keyword} enables informed decision-making and helps ensure that solar investments deliver maximum returns for years to come.`
    ];

    return conclusions[Math.floor(Math.random() * conclusions.length)];
  }

  calculateTotalWordCount(introduction, sections, conclusion) {
    let totalWords = introduction.split(' ').length + conclusion.split(' ').length;
    sections.forEach(section => {
      totalWords += section.content.split(' ').length;
    });
    return totalWords;
  }

  calculateSEOScore(content, keyword, metaTitle, metaDescription) {
    let score = 0;
    const maxScore = 100;

    if (!content || !keyword) return 0;

    const keywordLower = keyword.toLowerCase();
    const wordCount = this.countWords(content);

    // Keyword in title (15 points)
    if (metaTitle && metaTitle.toLowerCase().includes(keywordLower)) {
      score += 15;
    }

    // Keyword in meta description (10 points)
    if (metaDescription && metaDescription.toLowerCase().includes(keywordLower)) {
      score += 10;
    }

    // Content length (20 points) - 1102+ words for optimal score
    if (wordCount >= 1102) {
      score += 20;
    } else if (wordCount >= 800) {
      score += 15;
    } else if (wordCount >= 500) {
      score += 10;
    }

    // Keyword density (15 points) - 0.5% to 2.5% is optimal
    const keywordCount = (content.match(new RegExp(keywordLower, 'gi')) || []).length;
    const density = (keywordCount / wordCount) * 100;
    if (density >= 0.5 && density <= 2.5) {
      score += 15;
    } else if (density >= 0.3 && density <= 3.0) {
      score += 10;
    }

    // Keyword in first 10% of content (15 points)
    const first10Percent = content.substring(0, Math.floor(content.length * 0.1));
    if (first10Percent.toLowerCase().includes(keywordLower)) {
      score += 15;
    }

    // Meta description length (10 points) - 140-160 chars optimal
    if (metaDescription) {
      const metaLength = metaDescription.length;
      if (metaLength >= 140 && metaLength <= 160) {
        score += 10;
      } else if (metaLength >= 120 && metaLength <= 180) {
        score += 7;
      }
    }

    // Title length (10 points) - under 60 chars
    if (metaTitle && metaTitle.length <= 60) {
      score += 10;
    } else if (metaTitle && metaTitle.length <= 70) {
      score += 7;
    }

    // Content structure (5 points) - has H2 headings
    if (content.includes('<h2')) {
      score += 5;
    }

    return Math.min(score, maxScore);
  }

  cleanMarkdown(text) {
    if (!text) return text;

    return text
      // Remove JSON wrapper if present
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '')
      // Remove any JSON structure markers
      .replace(/^\s*{\s*"content":\s*"/, '')
      .replace(/"\s*}\s*$/, '')
      // Remove bold markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      // Remove italic markdown
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remove heading markers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove list markers
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove escaped quotes
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      // Remove any remaining backslashes
      .replace(/\\\\/g, '')
      // Clean up extra whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();
  }

  countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}

module.exports = new GeminiService();
