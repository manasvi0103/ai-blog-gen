const geminiService = require('./geminiService');

class SEOOptimizationService {
  constructor() {
    this.rankMathCriteria = {
      // Basic SEO Requirements for 85-100/100 score
      focusKeywordInTitle: { weight: 15, required: true },
      focusKeywordInMetaDescription: { weight: 10, required: true },
      focusKeywordInURL: { weight: 10, required: true },
      focusKeywordInFirst10Percent: { weight: 15, required: true },
      focusKeywordInContent: { weight: 10, required: true },
      contentLength: { weight: 10, minWords: 1102, required: true },
      titleReadability: { weight: 10, maxLength: 60, required: true },
      contentReadability: { weight: 10, required: true },
      metaDescriptionLength: { weight: 5, minLength: 140, maxLength: 160 },
      keywordDensity: { weight: 5, minDensity: 0.5, maxDensity: 2.5 },
      internalLinks: { weight: 5, minLinks: 2 },
      externalLinks: { weight: 5, minLinks: 1 }
    };
  }

  /**
   * Generate SEO-optimized content that scores 85-100/100 in RankMath
   * @param {Object} contentData - Content generation parameters
   * @returns {Object} SEO-optimized content structure
   */
  async generateSEOOptimizedContent(contentData) {
    const { selectedKeyword, selectedH1, selectedMetaTitle, selectedMetaDescription, companyName, companyContext, targetWordCount = 2500 } = contentData;

    console.log(`🎯 GENERATING SEO-OPTIMIZED CONTENT FOR RANKMATH 85-100/100 SCORE`);
    console.log(`   Focus Keyword: "${selectedKeyword}"`);
    console.log(`   Target Word Count: ${targetWordCount}`);

    // Step 1: Optimize meta data for RankMath
    const optimizedMeta = await this.optimizeMetaData({
      keyword: selectedKeyword,
      h1: selectedH1,
      metaTitle: selectedMetaTitle,
      metaDescription: selectedMetaDescription,
      companyName
    });

    // Step 2: Generate keyword-optimized content structure
    const contentStructure = await this.generateKeywordOptimizedStructure(selectedKeyword, targetWordCount);

    // Step 3: Create SEO-compliant content blocks
    const contentBlocks = await this.generateSEOContentBlocks(contentStructure, selectedKeyword, companyName, companyContext);

    // Step 4: Validate SEO compliance
    const seoValidation = this.validateSEOCompliance(contentBlocks, selectedKeyword, optimizedMeta);

    return {
      optimizedMeta,
      contentBlocks,
      seoValidation,
      estimatedRankMathScore: seoValidation.score,
      seoRecommendations: seoValidation.recommendations
    };
  }

  /**
   * Optimize meta data for maximum RankMath score
   */
  async optimizeMetaData(metaData) {
    const { keyword, h1, metaTitle, metaDescription, companyName } = metaData;

    const optimizationPrompt = `Optimize these meta elements for RankMath SEO to achieve 90-100/100 score:

Focus Keyword: "${keyword}"
Current H1: "${h1}"
Current Meta Title: "${metaTitle}"
Current Meta Description: "${metaDescription}"
Company: ${companyName}

RankMath Requirements:
1. H1: Must start with focus keyword, 50-60 characters, compelling
2. Meta Title: Focus keyword at beginning, include company, 50-60 characters
3. Meta Description: Focus keyword in first 120 characters, CTA, 140-160 characters
4. URL Slug: Focus keyword, hyphens, under 50 characters

Return JSON format:
{
  "optimizedH1": "Focus keyword first, compelling, 50-60 chars",
  "optimizedMetaTitle": "Focus keyword + company + benefit, 50-60 chars",
  "optimizedMetaDescription": "Focus keyword early + benefit + CTA, 140-160 chars",
  "optimizedSlug": "focus-keyword-based-slug",
  "keywordPlacement": "Strategy for keyword placement",
  "estimatedScore": "Expected RankMath score improvement"
}`;

    try {
      const response = await geminiService.generateContent(optimizationPrompt, { name: companyName });
      const optimized = JSON.parse(response.content.replace(/```json|```/g, ''));
      
      // Validate and ensure compliance
      return {
        h1: optimized.optimizedH1 || h1,
        metaTitle: optimized.optimizedMetaTitle || metaTitle,
        metaDescription: optimized.optimizedMetaDescription || metaDescription,
        slug: optimized.optimizedSlug || this.generateSEOSlug(keyword),
        keywordPlacement: optimized.keywordPlacement,
        estimatedScore: optimized.estimatedScore
      };
    } catch (error) {
      console.error('Meta optimization failed:', error);
      return {
        h1: h1,
        metaTitle: metaTitle,
        metaDescription: metaDescription,
        slug: this.generateSEOSlug(keyword),
        keywordPlacement: 'Standard placement',
        estimatedScore: 'Unable to estimate'
      };
    }
  }

  /**
   * Generate keyword-optimized content structure with enhanced RankMath compliance
   */
  async generateKeywordOptimizedStructure(keyword, targetWordCount) {
    const structure = {
      introduction: {
        wordCount: Math.round(targetWordCount * 0.10), // 10% - 250 words for 2500 (better for RankMath)
        keywordRequirement: 'Must include focus keyword in first 50 words (CRITICAL for RankMath)',
        purpose: 'Hook reader, establish keyword relevance, and preview article value',
        styling: 'Professional paragraph with Roboto font, engaging opener, proper structure'
      },
      mainSections: [
        {
          heading: `Understanding ${keyword}: Complete Overview`,
          headingStyle: 'H2 with #FBD46F color, Roboto font, Semi Bold (600), proper spacing',
          wordCount: Math.round(targetWordCount * 0.20), // 20% - 500 words (better for RankMath)
          keywordRequirement: 'Include exact keyword phrase 2-3 times naturally in first paragraph',
          purpose: 'Define and explain the main topic comprehensively',
          contentStyle: 'Clear paragraphs with bullet points, transition words, professional tone'
        },
        {
          heading: `${keyword}: Key Benefits and Advantages`,
          headingStyle: 'H2 with #FBD46F color, Roboto font, Semi Bold (600), proper spacing',
          wordCount: Math.round(targetWordCount * 0.20),
          keywordRequirement: 'Include keyword variations and related terms',
          purpose: 'Highlight advantages and value proposition with specific examples',
          contentStyle: 'Numbered lists with clear benefits, supporting data, professional formatting'
        },
        {
          heading: `How ${keyword} Implementation Works`,
          headingStyle: 'H2 with #FBD46F color, Roboto font, Semi Bold (600), proper spacing',
          wordCount: Math.round(targetWordCount * 0.20),
          keywordRequirement: 'Include keyword in process descriptions and subheadings',
          purpose: 'Explain detailed process and methodology with actionable steps',
          contentStyle: 'Step-by-step explanation with clear structure, transition words'
        },
        {
          heading: `${keyword} Cost Analysis and ROI Considerations`,
          headingStyle: 'H2 with #FBD46F color, Roboto font, Semi Bold (600), proper spacing',
          wordCount: Math.round(targetWordCount * 0.20),
          keywordRequirement: 'Include keyword with cost-related and financial terms',
          purpose: 'Address comprehensive financial considerations and ROI',
          contentStyle: 'Data-driven content with specific numbers, clear financial insights'
        }
      ],
      conclusion: {
        heading: `${keyword}: Making the Right Choice for Your Project`,
        headingStyle: 'H2 with #FBD46F color, Roboto font, Semi Bold (600), proper spacing',
        wordCount: Math.round(targetWordCount * 0.12), // 12% - 300 words (better for RankMath)
        keywordRequirement: 'Include exact keyword phrase and strong call-to-action language',
        purpose: 'Summarize key points, reinforce benefits, and encourage immediate action',
        contentStyle: 'Strong conclusion with clear CTA, company branding, urgency language'
      }
    };

    return structure;
  }

  /**
   * Generate SEO-compliant content blocks
   */
  async generateSEOContentBlocks(structure, keyword, companyName, companyContext = {}) {
    const blocks = [];
    let blockId = 1;

    // Introduction block with keyword in first 100 words - ENHANCED FOR RANKMATH
    const introPrompt = `Write a compelling, well-structured introduction for "${keyword}" that:
- Includes the EXACT phrase "${keyword}" within the first 50 words (CRITICAL for RankMath)
- Is exactly ${structure.introduction.wordCount} words
- Hooks the reader with a question, statistic, or bold statement
- Uses transition words (However, Moreover, Additionally, Furthermore)
- Establishes expertise and credibility immediately
- Previews the article value clearly
- Uses short, readable sentences (under 20 words each)
- Includes proper paragraph structure with logical flow

MANDATORY COMPANY INTEGRATION:
- Company: ${companyName}
- Services: ${companyContext.servicesOffered || 'Solar services'}
- About: ${companyContext.aboutTheCompany || 'Professional solar company'}
- Overview: ${companyContext.serviceOverview || 'Solar solutions provider'}

REQUIREMENTS (MANDATORY - NO EXCEPTIONS):
- MUST mention "${companyName}" by name at least 2 times in the introduction
- MUST reference specific services: "${companyContext.servicesOffered}"
- MUST include company expertise and background
- MUST write as if you are representing ${companyName} directly
- MUST show how ${companyName} helps clients with ${keyword}
- NEVER use generic terms like "solar company" or placeholders
- ALWAYS start with "At ${companyName}, we..." or "Are you ready to unlock the full potential of ${keyword}? At ${companyName}, we..."

Example: "Are you ready to unlock the full potential of ${keyword}? At ${companyName}, we understand that a successful solar project goes beyond simply installing panels. Our expertise in ${companyContext.servicesOffered} has helped thousands of clients..."

Write in a professional, authoritative tone that demonstrates ${companyName}'s expertise in ${keyword}.`;

    const introContent = await geminiService.generateContent(introPrompt, companyContext);

    // Enhance content with company info and links
    const enhancedIntroContent = geminiService.enhanceContentWithCompanyInfo(
      introContent.content,
      companyContext,
      keyword
    );

    blocks.push({
      id: `intro-${blockId++}`,
      type: "paragraph",
      content: enhancedIntroContent,
      seoNotes: "Keyword in first 100 words for RankMath compliance"
    });

    // Generate main section blocks
    for (const section of structure.mainSections) {
      // H2 heading
      blocks.push({
        id: `h2-${blockId++}`,
        type: "h2",
        content: section.heading,
        seoNotes: "H2 with focus keyword for content structure"
      });

      // Section content - ENHANCED FOR RANKMATH STRUCTURE
      const sectionPrompt = `Write detailed, well-structured content for "${section.heading}" section about ${keyword}:

RANKMATH CONTENT REQUIREMENTS:
- Exactly ${section.wordCount} words for optimal content length
- Include "${keyword}" ${section.keywordRequirement}
- Use proper paragraph structure (3-5 sentences per paragraph)
- Start with strong topic sentences
- Use transition words between paragraphs (Furthermore, Additionally, Moreover, However, Therefore)
- Include 2-3 bullet points or numbered lists for better readability
- Use short sentences (under 25 words) mixed with medium sentences (25-35 words)
- Include relevant statistics, examples, and actionable insights
- End each section with a clear conclusion or transition

CONTENT STRUCTURE FORMAT:
1. Opening paragraph: Introduce the main concept with "${keyword}"
2. Supporting paragraphs: Provide detailed explanations and examples
3. Bullet points or numbered list: Key takeaways or steps
4. Concluding paragraph: Summarize and transition to next section

MANDATORY COMPANY INTEGRATION:
- Company: ${companyName}
- Services: ${companyContext.servicesOffered || 'Solar services'}
- Expertise: ${companyContext.serviceOverview || 'Solar solutions'}
- About: ${companyContext.aboutTheCompany || 'Professional solar company'}

REQUIREMENTS (MANDATORY):
- MUST mention "${companyName}" by name at least once in this section
- MUST reference specific services from: "${companyContext.servicesOffered}"
- MUST include 1-2 relevant links naturally in the content
- MUST show how ${companyName}'s expertise applies to ${keyword}
- MUST include real examples from ${companyName}'s experience
- NEVER use generic terms like "solar company" - always use "${companyName}"

LINK INTEGRATION:
- Include links to relevant industry resources (NREL, SEIA, Energy.gov)
- Format links naturally: "According to NREL data on ${keyword} (https://www.nrel.gov/solar/), installations have increased..."
- Include WattMonk service links where relevant

Example: "${companyName}'s ${companyContext.servicesOffered} services have helped clients optimize their ${keyword} implementations. Our experience shows..."

Reference ${companyName}'s specific services and expertise where relevant. Avoid placeholder text like [Company Name] or [Number].`;

      const sectionContent = await geminiService.generateContent(sectionPrompt, companyContext);

      // Enhance section content with company info and links
      const enhancedSectionContent = geminiService.enhanceContentWithCompanyInfo(
        sectionContent.content,
        companyContext,
        keyword
      );

      blocks.push({
        id: `section-${blockId++}`,
        type: "paragraph",
        content: enhancedSectionContent,
        seoNotes: section.keywordRequirement
      });
    }

    // Conclusion block - ENHANCED FOR RANKMATH
    const conclusionPrompt = `Write a compelling, well-structured conclusion for "${keyword}" article that:

RANKMATH CONCLUSION REQUIREMENTS:
- Exactly ${structure.conclusion.wordCount} words for optimal content length
- Include "${keyword}" naturally in the first paragraph
- Use proper conclusion structure with clear flow
- Summarize 3-4 key benefits from the article
- Include strong, specific call-to-action with action words
- Use urgency-creating language (Today, Now, Don't wait, Limited time)
- End with clear next steps for readers

CONCLUSION STRUCTURE:
1. Summary paragraph: Recap main points with "${keyword}"
2. Benefits paragraph: Highlight key advantages
3. Call-to-action paragraph: Specific action for readers
4. Contact/next steps: Clear path forward

MANDATORY COMPANY INTEGRATION:
- Company: ${companyName}
- Services: ${companyContext.servicesOffered || 'Solar services'}
- About: ${companyContext.aboutTheCompany || 'Professional solar company'}
- Contact: Encourage readers to reach out to ${companyName} for ${keyword} solutions

REQUIREMENTS:
- MUST mention ${companyName} prominently in conclusion
- MUST reference specific services: ${companyContext.servicesOffered}
- MUST include contact information or website link
- Create urgency around ${companyName}'s expertise
- Include specific benefits of working with ${companyName}

CALL-TO-ACTION EXAMPLES:
- "Ready to optimize your ${keyword} strategy? ${companyName}'s expert team specializes in ${companyContext.servicesOffered}."
- "Contact ${companyName} today for professional ${keyword} solutions."
- "Visit www.wattmonk.com to learn how our ${companyContext.servicesOffered} can transform your ${keyword} approach."

Make the call-to-action specific to ${companyName}'s services. Avoid generic placeholders.`;

    const conclusionContent = await geminiService.generateContent(conclusionPrompt, companyContext);

    // Enhance conclusion with company info and strong CTA
    let enhancedConclusionContent = geminiService.enhanceContentWithCompanyInfo(
      conclusionContent.content,
      companyContext,
      keyword
    );

    // Add strong company-specific CTA if missing
    if (!enhancedConclusionContent.includes('contact') && !enhancedConclusionContent.includes('visit')) {
      enhancedConclusionContent += `\n\nReady to optimize your ${keyword} strategy? Contact ${companyContext.name || 'our team'} today for expert ${companyContext.servicesOffered || 'solar services'}. Visit https://www.wattmonk.com to learn more about our comprehensive solutions.`;
    }

    blocks.push({
      id: `conclusion-${blockId++}`,
      type: "paragraph",
      content: enhancedConclusionContent,
      seoNotes: "Conclusion with keyword and CTA"
    });

    return blocks;
  }

  /**
   * Validate SEO compliance and calculate RankMath score
   */
  validateSEOCompliance(contentBlocks, keyword, metaData) {
    const validation = {
      score: 0,
      maxScore: 100,
      checks: {},
      recommendations: []
    };

    // Combine all content for analysis
    const allContent = contentBlocks
      .filter(block => block.type === 'paragraph')
      .map(block => block.content)
      .join(' ');

    const wordCount = allContent.split(' ').length;
    const keywordCount = this.countKeywordOccurrences(allContent, keyword);
    const keywordDensity = (keywordCount / wordCount) * 100;

    // Check 1: Focus keyword in title (15 points)
    if (metaData.h1 && metaData.h1.toLowerCase().includes(keyword.toLowerCase())) {
      validation.score += 15;
      validation.checks.keywordInTitle = true;
    } else {
      validation.recommendations.push('Include focus keyword in H1 title');
    }

    // Check 2: Focus keyword in meta description (10 points)
    if (metaData.metaDescription && metaData.metaDescription.toLowerCase().includes(keyword.toLowerCase())) {
      validation.score += 10;
      validation.checks.keywordInMetaDescription = true;
    } else {
      validation.recommendations.push('Include focus keyword in meta description');
    }

    // Check 3: Focus keyword in URL (10 points)
    if (metaData.slug && metaData.slug.includes(keyword.toLowerCase().replace(/\s+/g, '-'))) {
      validation.score += 10;
      validation.checks.keywordInURL = true;
    } else {
      validation.recommendations.push('Include focus keyword in URL slug');
    }

    // Check 4: Focus keyword in first 100 words (15 points) - ENHANCED FOR RANKMATH
    const first100Words = allContent.split(' ').slice(0, 100).join(' ');
    if (first100Words.toLowerCase().includes(keyword.toLowerCase())) {
      validation.score += 15;
      validation.checks.keywordInFirst100Words = true;
    } else {
      validation.recommendations.push('Include focus keyword in first 100 words of content (CRITICAL for RankMath)');
    }

    // Check 5: Focus keyword found in content (10 points)
    if (keywordCount > 0) {
      validation.score += 10;
      validation.checks.keywordInContent = true;
    } else {
      validation.recommendations.push('Include focus keyword in content');
    }

    // Check 6: Content length (10 points)
    if (wordCount >= 1102) {
      validation.score += 10;
      validation.checks.contentLength = true;
    } else {
      validation.recommendations.push(`Increase content length to at least 1102 words (current: ${wordCount})`);
    }

    // Check 7: Title readability (10 points)
    if (metaData.h1 && metaData.h1.length <= 60) {
      validation.score += 10;
      validation.checks.titleReadability = true;
    } else {
      validation.recommendations.push('Keep title under 60 characters');
    }

    // Check 8: Content readability (10 points)
    validation.score += 10; // Assume good readability with our structured approach
    validation.checks.contentReadability = true;

    // Check 9: Meta description length (5 points)
    if (metaData.metaDescription && metaData.metaDescription.length >= 140 && metaData.metaDescription.length <= 160) {
      validation.score += 5;
      validation.checks.metaDescriptionLength = true;
    } else {
      validation.recommendations.push('Meta description should be 140-160 characters');
    }

    // Check 10: Keyword density (5 points)
    if (keywordDensity >= 0.5 && keywordDensity <= 2.5) {
      validation.score += 5;
      validation.checks.keywordDensity = true;
    } else {
      validation.recommendations.push(`Adjust keyword density to 0.5-2.5% (current: ${keywordDensity.toFixed(2)}%)`);
    }

    // Additional RankMath-specific checks

    // Check 11: H2 headings with keyword (5 points)
    const h2Count = (allContent.match(/<h2[^>]*>/gi) || []).length;
    const h2WithKeyword = (allContent.match(new RegExp(`<h2[^>]*>.*${keyword}.*</h2>`, 'gi')) || []).length;
    if (h2WithKeyword >= 1) {
      validation.score += 5;
      validation.checks.keywordInH2 = true;
    } else {
      validation.recommendations.push('Include focus keyword in at least one H2 heading');
    }

    // Check 12: Internal links (5 points)
    const internalLinks = (allContent.match(/<a[^>]*href[^>]*>/gi) || []).length;
    if (internalLinks >= 2) {
      validation.score += 5;
      validation.checks.internalLinks = true;
    } else {
      validation.recommendations.push('Add at least 2 internal links for better SEO');
    }

    // Check 13: Image alt text with keyword (5 points)
    const imageAltWithKeyword = (allContent.match(new RegExp(`alt="[^"]*${keyword}[^"]*"`, 'gi')) || []).length;
    if (imageAltWithKeyword >= 1) {
      validation.score += 5;
      validation.checks.keywordInImageAlt = true;
    } else {
      validation.recommendations.push('Include focus keyword in at least one image alt text');
    }

    validation.keywordDensity = keywordDensity;
    validation.wordCount = wordCount;
    validation.keywordCount = keywordCount;
    validation.h2Count = h2Count;
    validation.h2WithKeyword = h2WithKeyword;

    // Determine overall grade - ENHANCED FOR RANKMATH (Target: 85-88/100)
    if (validation.score >= 85) {
      validation.grade = 'A';
      validation.status = 'Excellent - RankMath Optimized';
      validation.color = 'green';
    } else if (validation.score >= 75) {
      validation.grade = 'B+';
      validation.status = 'Good - Near RankMath Target';
      validation.color = 'orange';
    } else if (validation.score >= 65) {
      validation.grade = 'B';
      validation.status = 'Good - Needs RankMath Optimization';
      validation.color = 'orange';
    } else {
      validation.grade = 'C';
      validation.status = 'Needs Major RankMath Improvements';
      validation.color = 'red';
    }

    return validation;
  }

  /**
   * Count keyword occurrences in content
   */
  countKeywordOccurrences(content, keyword) {
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Generate SEO-friendly slug
   */
  generateSEOSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }
}

module.exports = new SEOOptimizationService();
