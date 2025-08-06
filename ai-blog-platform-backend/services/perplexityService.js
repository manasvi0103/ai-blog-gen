/**
 * Perplexity Service for WattMonk AI Blog Platform
 * 
 * Handles:
 * - Real-time search and research using Perplexity API
 * - Competitor analysis fallback
 * - Keyword research and trends
 * - Content research and insights
 * 
 * @author WattMonk Technologies
 * @version 1.0.0 - Fallback Service
 */

const axios = require('axios');

class PerplexityService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseUrl = 'https://api.perplexity.ai/chat/completions';
    this.defaultTimeout = 30000;
    this.model = 'llama-3.1-sonar-small-128k-online'; // Real-time search model
  }

  /**
   * Search for competitor analysis using Perplexity
   * @param {string} keyword - Search keyword
   * @param {string} excludeDomain - Domain to exclude from results
   * @param {number} limit - Number of results to return
   * @returns {Array} Array of competitor results
   */
  async searchCompetitors(keyword, excludeDomain = '', limit = 10) {
    try {
      console.log(`🔍 [Perplexity] Searching competitors for keyword: "${keyword}"`);

      if (!this.apiKey) {
        console.warn('Perplexity API key not configured, using basic fallback');
        return this.getBasicFallbackCompetitors(keyword, limit);
      }

      const searchQuery = excludeDomain 
        ? `Find top ${limit} companies and websites ranking for "${keyword}" solar industry, exclude ${excludeDomain}. Include their domain, title, and brief description.`
        : `Find top ${limit} companies and websites ranking for "${keyword}" in solar industry. Include their domain, title, and brief description.`;

      const response = await axios.post(this.baseUrl, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a SEO research assistant. Provide accurate, up-to-date information about companies and websites in the solar industry. Format your response as structured data.'
          },
          {
            role: 'user',
            content: searchQuery
          }
        ],
        max_tokens: 2000,
        temperature: 0.2
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.defaultTimeout
      });

      const content = response.data.choices[0].message.content;
      const competitors = this.parseCompetitorResponse(content, keyword, limit);

      console.log(`✅ [Perplexity] Found ${competitors.length} competitors for "${keyword}"`);
      return competitors;

    } catch (error) {
      console.error('Perplexity search error:', error.message);
      return this.getBasicFallbackCompetitors(keyword, limit);
    }
  }

  /**
   * Get keyword analysis using Perplexity real-time search
   * @param {string} keyword - Keyword to analyze
   * @returns {Object} Keyword analysis data
   */
  async analyzeKeyword(keyword) {
    try {
      console.log(`📊 [Perplexity] Analyzing keyword: "${keyword}"`);

      if (!this.apiKey) {
        return this.getBasicKeywordAnalysis(keyword);
      }

      const analysisQuery = `Analyze the keyword "${keyword}" in the solar industry. Provide:
      1. Estimated search volume and trends
      2. Competition level and difficulty
      3. Search intent (informational, commercial, navigational)
      4. Related keywords and variations
      5. Current market trends and seasonality
      6. Top competing companies
      
      Focus on recent data and current market conditions.`;

      const response = await axios.post(this.baseUrl, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a SEO and keyword research expert specializing in the solar industry. Provide accurate, data-driven insights.'
          },
          {
            role: 'user',
            content: analysisQuery
          }
        ],
        max_tokens: 2500,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.defaultTimeout
      });

      const content = response.data.choices[0].message.content;
      const analysis = this.parseKeywordAnalysis(content, keyword);

      console.log(`✅ [Perplexity] Keyword analysis complete for "${keyword}"`);
      return analysis;

    } catch (error) {
      console.error('Perplexity keyword analysis error:', error.message);
      return this.getBasicKeywordAnalysis(keyword);
    }
  }

  /**
   * Get current trends and insights for a topic
   * @param {string} topic - Topic to research
   * @returns {Object} Trend data and insights
   */
  async getTrendInsights(topic) {
    try {
      console.log(`📈 [Perplexity] Getting trend insights for: "${topic}"`);

      if (!this.apiKey) {
        return this.getBasicTrendInsights(topic);
      }

      const trendQuery = `Research current trends, news, and developments related to "${topic}" in the solar industry. Include:
      1. Recent market developments and news
      2. Technology advancements
      3. Policy changes and regulations
      4. Market growth and statistics
      5. Consumer behavior trends
      6. Industry forecasts
      
      Focus on information from the last 6 months.`;

      const response = await axios.post(this.baseUrl, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a solar industry analyst providing current market insights and trends.'
          },
          {
            role: 'user',
            content: trendQuery
          }
        ],
        max_tokens: 2000,
        temperature: 0.4
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.defaultTimeout
      });

      const content = response.data.choices[0].message.content;
      const insights = this.parseTrendInsights(content, topic);

      console.log(`✅ [Perplexity] Trend insights gathered for "${topic}"`);
      return insights;

    } catch (error) {
      console.error('Perplexity trend analysis error:', error.message);
      return this.getBasicTrendInsights(topic);
    }
  }

  /**
   * Parse competitor response from Perplexity
   * @param {string} content - Raw response content
   * @param {string} keyword - Original keyword
   * @param {number} limit - Number of results to return
   * @returns {Array} Parsed competitor data
   */
  parseCompetitorResponse(content, keyword, limit) {
    const competitors = [];
    
    // Try to extract structured data from the response
    const lines = content.split('\n').filter(line => line.trim());
    let rank = 1;

    for (const line of lines) {
      if (rank > limit) break;
      
      // Look for patterns like "1. Company Name - domain.com"
      const match = line.match(/(\d+\.?\s*)?([^-]+)\s*-\s*([^\s]+\.[^\s]+)/);
      if (match) {
        const [, , title, domain] = match;
        
        competitors.push({
          rank: rank,
          title: title.trim(),
          url: `https://${domain.trim()}`,
          snippet: `Leading provider of ${keyword} solutions and services`,
          domain: domain.trim(),
          estimatedTraffic: this.estimateTraffic(rank),
          domainAuthority: this.estimateDomainAuthority(domain),
          keywordRelevance: this.calculateKeywordRelevance(title + ' ' + keyword, keyword),
          source: 'perplexity'
        });
        
        rank++;
      }
    }

    // If parsing failed, generate some competitors based on the content
    if (competitors.length === 0) {
      return this.generateCompetitorsFromContent(content, keyword, limit);
    }

    return competitors;
  }

  /**
   * Parse keyword analysis from Perplexity response
   * @param {string} content - Raw response content
   * @param {string} keyword - Original keyword
   * @returns {Object} Parsed keyword analysis
   */
  parseKeywordAnalysis(content, keyword) {
    // Extract insights from the response
    const searchVolume = this.extractSearchVolume(content) || this.estimateSearchVolume(keyword);
    const difficulty = this.extractDifficulty(content) || this.estimateKeywordDifficulty([]);
    const intent = this.extractSearchIntent(content) || this.determineSearchIntent(keyword);
    const relatedKeywords = this.extractRelatedKeywords(content) || this.generateRelatedKeywords(keyword);

    return {
      keyword: keyword,
      searchVolume: searchVolume,
      difficulty: difficulty,
      cpc: this.estimateCPC(keyword),
      competition: difficulty > 70 ? 'High' : difficulty > 40 ? 'Medium' : 'Low',
      topCompetitors: [],
      relatedKeywords: relatedKeywords,
      searchIntent: intent,
      seasonality: this.analyzeSeasonality(keyword),
      insights: content,
      source: 'perplexity'
    };
  }

  /**
   * Parse trend insights from Perplexity response
   * @param {string} content - Raw response content
   * @param {string} topic - Original topic
   * @returns {Object} Parsed trend insights
   */
  parseTrendInsights(content, topic) {
    return {
      topic: topic,
      insights: content,
      trends: this.extractTrends(content),
      marketData: this.extractMarketData(content),
      forecasts: this.extractForecasts(content),
      lastUpdated: new Date().toISOString(),
      source: 'perplexity'
    };
  }

  // Helper methods for parsing and estimation
  extractSearchVolume(content) {
    const volumeMatch = content.match(/(\d+,?\d*)\s*(searches?|volume)/i);
    return volumeMatch ? parseInt(volumeMatch[1].replace(',', '')) : null;
  }

  extractDifficulty(content) {
    const difficultyMatch = content.match(/(difficulty|competition).*?(\d+)/i);
    return difficultyMatch ? parseInt(difficultyMatch[2]) : null;
  }

  extractSearchIntent(content) {
    if (content.toLowerCase().includes('informational')) return 'Informational';
    if (content.toLowerCase().includes('commercial')) return 'Commercial';
    if (content.toLowerCase().includes('navigational')) return 'Navigational';
    return 'Informational';
  }

  extractRelatedKeywords(content) {
    // Simple extraction of quoted keywords or bullet points
    const keywords = [];
    const matches = content.match(/"([^"]+)"/g);
    if (matches) {
      matches.forEach(match => {
        const keyword = match.replace(/"/g, '');
        if (keyword.length > 3 && keyword.length < 50) {
          keywords.push(keyword);
        }
      });
    }
    return keywords.slice(0, 10);
  }

  extractTrends(content) {
    const trends = [];
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('trend') || line.includes('growth') || line.includes('increase')) {
        trends.push(line.trim());
      }
    });
    return trends.slice(0, 5);
  }

  extractMarketData(content) {
    const data = [];
    const percentageMatches = content.match(/\d+%/g);
    const dollarMatches = content.match(/\$[\d,]+/g);
    
    if (percentageMatches) data.push(...percentageMatches.slice(0, 3));
    if (dollarMatches) data.push(...dollarMatches.slice(0, 3));
    
    return data;
  }

  extractForecasts(content) {
    const forecasts = [];
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('forecast') || line.includes('expect') || line.includes('predict')) {
        forecasts.push(line.trim());
      }
    });
    return forecasts.slice(0, 3);
  }

  // Reuse estimation methods from SERP service
  estimateTraffic(position) {
    const ctrRates = { 1: 0.28, 2: 0.15, 3: 0.11, 4: 0.08, 5: 0.06 };
    const baseCtr = ctrRates[position] || 0.02;
    const estimatedSearchVolume = Math.floor(Math.random() * 5000) + 1000;
    return Math.floor(estimatedSearchVolume * baseCtr);
  }

  estimateDomainAuthority(domain) {
    const highAuthority = ['energy.gov', 'nrel.gov', 'seia.org'];
    const mediumAuthority = ['solarpowerworldonline.com', 'pv-magazine.com'];
    
    if (highAuthority.some(d => domain.includes(d))) return Math.floor(Math.random() * 10) + 90;
    if (mediumAuthority.some(d => domain.includes(d))) return Math.floor(Math.random() * 20) + 70;
    
    return Math.floor(Math.random() * 40) + 40;
  }

  calculateKeywordRelevance(content, keyword) {
    if (!content || !keyword) return 0;
    
    const contentLower = content.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    const keywordWords = keywordLower.split(' ');
    
    let score = 0;
    if (contentLower.includes(keywordLower)) score += 40;
    
    keywordWords.forEach(word => {
      if (contentLower.includes(word)) score += 15;
    });
    
    return Math.min(100, score);
  }

  estimateSearchVolume(keyword) {
    const keywordLength = keyword.split(' ').length;
    const baseVolume = keywordLength === 1 ? 5000 : 
                     keywordLength === 2 ? 2000 : 
                     keywordLength === 3 ? 800 : 300;
    
    return Math.floor(Math.random() * baseVolume) + Math.floor(baseVolume * 0.5);
  }

  estimateKeywordDifficulty(competitors) {
    return Math.floor(Math.random() * 30) + 40; // Default range 40-70
  }

  estimateCPC(keyword) {
    const solarKeywords = ['solar', 'panel', 'energy', 'installation'];
    const isHighValue = solarKeywords.some(k => keyword.toLowerCase().includes(k));
    
    if (isHighValue) {
      return parseFloat((Math.random() * 3 + 2).toFixed(2)); // $2-5 for solar keywords
    }
    
    return parseFloat((Math.random() * 1.5 + 0.5).toFixed(2)); // $0.5-2 for others
  }

  determineSearchIntent(keyword) {
    const keywordLower = keyword.toLowerCase();
    
    if (keywordLower.includes('how to') || keywordLower.includes('guide') || keywordLower.includes('tips')) {
      return 'Informational';
    }
    
    if (keywordLower.includes('buy') || keywordLower.includes('cost') || keywordLower.includes('price')) {
      return 'Commercial';
    }
    
    return 'Informational';
  }

  generateRelatedKeywords(keyword) {
    const modifiers = ['best', 'top', 'how to', 'guide', 'tips', 'cost', 'benefits'];
    const suffixes = ['2024', 'guide', 'cost', 'benefits', 'installation', 'companies'];
    
    const related = [];
    
    modifiers.forEach(modifier => {
      related.push(`${modifier} ${keyword}`);
    });
    
    suffixes.forEach(suffix => {
      related.push(`${keyword} ${suffix}`);
    });
    
    return related.slice(0, 8);
  }

  analyzeSeasonality(keyword) {
    const solarKeywords = ['solar', 'panel', 'energy'];
    const isSolar = solarKeywords.some(k => keyword.toLowerCase().includes(k));
    
    if (isSolar) {
      return {
        peak: 'Summer',
        low: 'Winter',
        trend: 'Seasonal',
        peakMonths: ['April', 'May', 'June', 'July', 'August']
      };
    }
    
    return {
      peak: 'Stable',
      low: 'Stable',
      trend: 'Consistent',
      peakMonths: []
    };
  }

  // Fallback methods
  getBasicFallbackCompetitors(keyword, limit) {
    return [
      {
        rank: 1,
        title: `${keyword} - Solar Industry Leader`,
        url: 'https://www.example-solar.com/',
        snippet: `Comprehensive ${keyword} solutions and services`,
        domain: 'example-solar.com',
        estimatedTraffic: 15000,
        domainAuthority: 75,
        keywordRelevance: 85,
        source: 'fallback'
      }
    ].slice(0, limit);
  }

  getBasicKeywordAnalysis(keyword) {
    return {
      keyword: keyword,
      searchVolume: this.estimateSearchVolume(keyword),
      difficulty: 55,
      cpc: this.estimateCPC(keyword),
      competition: 'Medium',
      topCompetitors: [],
      relatedKeywords: this.generateRelatedKeywords(keyword),
      searchIntent: this.determineSearchIntent(keyword),
      seasonality: this.analyzeSeasonality(keyword),
      source: 'fallback'
    };
  }

  getBasicTrendInsights(topic) {
    return {
      topic: topic,
      insights: `Current trends in ${topic} show continued growth in the solar industry.`,
      trends: [`Growing demand for ${topic}`, 'Increased adoption rates', 'Technology improvements'],
      marketData: ['15% growth', '$2.5B market'],
      forecasts: [`${topic} expected to grow 20% next year`],
      lastUpdated: new Date().toISOString(),
      source: 'fallback'
    };
  }

  generateCompetitorsFromContent(content, keyword, limit) {
    // Extract company names or domains mentioned in content
    const competitors = [];
    const domainMatches = content.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/g);
    
    if (domainMatches) {
      domainMatches.slice(0, limit).forEach((domain, index) => {
        competitors.push({
          rank: index + 1,
          title: `${keyword} - ${domain}`,
          url: `https://${domain}`,
          snippet: `Provider of ${keyword} solutions`,
          domain: domain,
          estimatedTraffic: this.estimateTraffic(index + 1),
          domainAuthority: this.estimateDomainAuthority(domain),
          keywordRelevance: 75,
          source: 'perplexity-parsed'
        });
      });
    }
    
    return competitors.length > 0 ? competitors : this.getBasicFallbackCompetitors(keyword, limit);
  }
}

module.exports = new PerplexityService();
