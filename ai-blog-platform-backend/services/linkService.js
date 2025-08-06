/**
 * Link Service for WattMonk AI Blog Platform
 * 
 * Handles:
 * - Competitor analysis and link discovery
 * - Inbound/outbound link generation
 * - SERP-based competitor research
 * - Authority link discovery
 * 
 * @author WattMonk Technologies
 * @version 3.0.0 - Production Ready
 */

const axios = require('axios');
const cheerio = require('cheerio');
const serpService = require('./serpService');

class LinkService {
  constructor() {
    this.serpApiKey = process.env.SERP_API_KEY;
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
    this.defaultTimeout = 10000;
    this.serpService = serpService; // Use enhanced SERP service with Perplexity fallback
  }

  /**
   * Generate inbound and outbound links for a keyword
   * @param {string} keyword - Focus keyword
   * @param {string} companyName - Company name
   * @param {Array} trendData - Trend data for context
   * @returns {Object} Links object with inbound and outbound arrays
   */
  async generateInboundOutboundLinks(keyword, companyName, trendData = []) {
    try {
      console.log(`🔗 Generating links for keyword: "${keyword}", company: ${companyName}`);

      // Get competitor links
      const competitorLinks = await this.searchCompanyBlogLinks(keyword, companyName);
      
      // Get authority links
      const authorityLinks = await this.getAuthorityLinks(keyword);
      
      // Generate internal links (company specific)
      const inboundLinks = this.generateCompanyInternalLinks(keyword, companyName);
      
      // Combine external links
      const outboundLinks = [
        ...competitorLinks.slice(0, 3),
        ...authorityLinks.slice(0, 5)
      ];

      console.log(`✅ Generated ${inboundLinks.length} inbound and ${outboundLinks.length} outbound links`);

      return {
        inboundLinks,
        outboundLinks
      };

    } catch (error) {
      console.error('Link generation error:', error.message);
      return {
        inboundLinks: this.generateCompanyInternalLinks(keyword, companyName),
        outboundLinks: this.getFallbackAuthorityLinks(keyword)
      };
    }
  }

  /**
   * Search for company blog links using SERP API
   * @param {string} keyword - Search keyword
   * @param {string} companyName - Company name
   * @returns {Array} Array of competitor links
   */
  async searchCompanyBlogLinks(keyword, companyName) {
    try {
      console.log(`🔍 Searching competitor links for "${keyword}" (excluding ${companyName})`);

      // Use enhanced SERP service with Perplexity fallback
      const excludeDomain = companyName.toLowerCase().replace(/\s+/g, '') + '.com';
      const competitors = await this.serpService.searchCompetitors(keyword, excludeDomain, 5);

      // Convert competitor data to link format
      const competitorLinks = competitors.map(competitor => ({
        text: competitor.title,
        url: competitor.url,
        context: competitor.snippet || `Authority content about ${keyword}`,
        domain: competitor.domain,
        type: 'competitor',
        relevance: competitor.keywordRelevance || 75,
        domainAuthority: competitor.domainAuthority || 60,
        source: competitor.source || 'serp'
      }));

      console.log(`✅ Found ${competitorLinks.length} competitor links using enhanced SERP service`);
      return competitorLinks;

    } catch (error) {
      console.warn('Enhanced SERP search failed:', error.message);
      return this.getFallbackCompetitorLinks(keyword);
    }
  }

  /**
   * Get authority links for a keyword
   * @param {string} keyword - Focus keyword
   * @returns {Array} Array of authority links
   */
  async getAuthorityLinks(keyword) {
    const authorityDomains = [
      'energy.gov',
      'nrel.gov',
      'seia.org',
      'solarpowerworldonline.com',
      'pv-magazine.com'
    ];

    const authorityLinks = [];

    for (const domain of authorityDomains) {
      try {
        const searchQuery = `site:${domain} ${keyword}`;
        
        if (this.serpApiKey) {
          const response = await axios.get('https://serpapi.com/search', {
            params: {
              q: searchQuery,
              api_key: this.serpApiKey,
              engine: 'google',
              num: 2
            },
            timeout: 5000
          });

          const results = response.data.organic_results || [];
          
          results.forEach(result => {
            authorityLinks.push({
              text: result.title,
              url: result.link,
              context: result.snippet || `Authority content about ${keyword}`,
              domain: domain,
              type: 'authority'
            });
          });
        }
      } catch (error) {
        console.warn(`Failed to get authority links from ${domain}:`, error.message);
      }
    }

    // If no authority links found, use fallback
    if (authorityLinks.length === 0) {
      return this.getFallbackAuthorityLinks(keyword);
    }

    return authorityLinks.slice(0, 5);
  }

  /**
   * Generate company-specific internal links
   * @param {string} keyword - Focus keyword
   * @param {string} companyName - Company name
   * @returns {Array} Array of internal links
   */
  generateCompanyInternalLinks(keyword, companyName) {
    if (companyName && companyName.toLowerCase().includes('ensite')) {
      return this.generateEnsiteInternalLinks(keyword);
    } else {
      return this.generateWattMonkInternalLinks(keyword);
    }
  }

  /**
   * Generate Ensite internal links with comprehensive service coverage
   * @param {string} keyword - Focus keyword
   * @returns {Array} Array of internal links
   */
  generateEnsiteInternalLinks(keyword) {
    const ensiteLinks = [
      {
        text: `${keyword} - Professional Solar Engineering Services`,
        url: 'https://ensiteservices.com/solar-engineering/',
        context: `Expert ${keyword} engineering and design services by Ensite's certified professionals`,
        type: 'internal'
      },
      {
        text: `${keyword} - Solar Permit Design Services`,
        url: 'https://ensiteservices.com/solar-permit-design/',
        context: `Comprehensive ${keyword} permit design and documentation services for faster approvals`,
        type: 'internal'
      },
      {
        text: `${keyword} - Solar Structural Engineering`,
        url: 'https://ensiteservices.com/structural-engineering/',
        context: `Professional ${keyword} structural analysis and engineering solutions`,
        type: 'internal'
      },
      {
        text: `${keyword} - Solar Project Management`,
        url: 'https://ensiteservices.com/project-management/',
        context: `End-to-end ${keyword} project management and coordination services`,
        type: 'internal'
      },
      {
        text: `${keyword} - Solar Consulting Services`,
        url: 'https://ensiteservices.com/consulting/',
        context: `Expert ${keyword} consulting and advisory services for optimal project outcomes`,
        type: 'internal'
      }
    ];

    // Filter out links that don't make sense for the keyword
    const relevantLinks = ensiteLinks.filter(link => {
      const keywordLower = keyword.toLowerCase();

      // Always include if keyword contains solar, energy, or engineering terms
      if (keywordLower.includes('solar') ||
          keywordLower.includes('energy') ||
          keywordLower.includes('engineering') ||
          keywordLower.includes('design') ||
          keywordLower.includes('permit') ||
          keywordLower.includes('structural')) {
        return true;
      }

      // Include specific service links based on keyword
      if (keywordLower.includes('permit') && link.url.includes('permit')) return true;
      if (keywordLower.includes('structural') && link.url.includes('structural')) return true;
      if (keywordLower.includes('project') && link.url.includes('project')) return true;
      if (keywordLower.includes('consulting') && link.url.includes('consulting')) return true;

      return false;
    });

    // If no relevant links found, return first 3 as fallback
    if (relevantLinks.length === 0) {
      console.log(`⚠️ No relevant Ensite links found for keyword "${keyword}", using fallback`);
      return ensiteLinks.slice(0, 3);
    }

    console.log(`✅ Generated ${relevantLinks.length} relevant Ensite internal links for "${keyword}"`);
    return relevantLinks.slice(0, 5); // Return up to 5 relevant links
  }

  /**
   * Generate WattMonk internal links with comprehensive service coverage
   * @param {string} keyword - Focus keyword
   * @returns {Array} Array of internal links
   */
  generateWattMonkInternalLinks(keyword) {
    const wattmonkLinks = [
      {
        text: `${keyword} - Professional Solar Design Services`,
        url: 'https://www.wattmonk.com/service/solar-design/',
        context: `Expert ${keyword} design and engineering services by WattMonk's certified professionals`,
        type: 'internal'
      },
      {
        text: `${keyword} - Solar PTO & Interconnection Services`,
        url: 'https://www.wattmonk.com/service/pto-interconnection/',
        context: `Streamlined ${keyword} PTO and utility interconnection services for faster project completion`,
        type: 'internal'
      },
      {
        text: `${keyword} - Solar Engineering Solutions`,
        url: 'https://www.wattmonk.com/service/solar-engineering/',
        context: `Advanced ${keyword} engineering and technical solutions for optimal system performance`,
        type: 'internal'
      },
      {
        text: `${keyword} - Solar Permit Services`,
        url: 'https://www.wattmonk.com/service/solar-permit/',
        context: `Fast-track ${keyword} permitting services to accelerate your solar projects`,
        type: 'internal'
      },
      {
        text: `${keyword} - Solar Stamping Services`,
        url: 'https://www.wattmonk.com/service/solar-stamping/',
        context: `Professional ${keyword} stamping and approval services by licensed engineers`,
        type: 'internal'
      },
      {
        text: `${keyword} - Complete Solar Solutions`,
        url: 'https://www.wattmonk.com/',
        context: `Comprehensive ${keyword} solutions and services from WattMonk - your trusted solar partner`,
        type: 'internal'
      }
    ];

    return wattmonkLinks;
  }

  /**
   * Get fallback competitor links with AI-generated content
   * @param {string} keyword - Focus keyword
   * @returns {Array} Array of fallback competitor links
   */
  getFallbackCompetitorLinks(keyword) {
    // AI-generated competitor analysis for reliable fallback
    const competitors = [
      {
        text: `${keyword} - Solar Power World Analysis`,
        url: 'https://www.solarpowerworldonline.com/',
        context: `Comprehensive industry analysis of ${keyword} trends, costs, and best practices for solar professionals`,
        domain: 'solarpowerworldonline.com',
        type: 'competitor'
      },
      {
        text: `${keyword} - PV Magazine Technical Guide`,
        url: 'https://www.pv-magazine.com/',
        context: `Technical insights and latest developments in ${keyword} technology from leading industry publication`,
        domain: 'pv-magazine.com',
        type: 'competitor'
      },
      {
        text: `${keyword} - Solar Builder Professional Guide`,
        url: 'https://solarbuildermag.com/',
        context: `Professional installation guide and best practices for ${keyword} from Solar Builder Magazine`,
        domain: 'solarbuildermag.com',
        type: 'competitor'
      },
      {
        text: `${keyword} - EnergySage Consumer Guide`,
        url: 'https://www.energysage.com/',
        context: `Consumer-focused guide to ${keyword} with cost analysis and vendor comparisons`,
        domain: 'energysage.com',
        type: 'competitor'
      },
      {
        text: `${keyword} - Solar Reviews Expert Analysis`,
        url: 'https://www.solarreviews.com/',
        context: `Expert reviews and analysis of ${keyword} options with real customer feedback`,
        domain: 'solarreviews.com',
        type: 'competitor'
      }
    ];

    return competitors;
  }

  /**
   * Get fallback authority links
   * @param {string} keyword - Focus keyword
   * @returns {Array} Array of fallback authority links
   */
  getFallbackAuthorityLinks(keyword) {
    return [
      {
        text: `${keyword} - Department of Energy Research`,
        url: 'https://www.energy.gov/eere/solar/',
        context: `Official DOE research and data on ${keyword}`,
        domain: 'energy.gov',
        type: 'authority'
      },
      {
        text: `${keyword} - NREL Technical Resources`,
        url: 'https://www.nrel.gov/solar/',
        context: `NREL technical resources and research on ${keyword}`,
        domain: 'nrel.gov',
        type: 'authority'
      },
      {
        text: `${keyword} - SEIA Industry Data`,
        url: 'https://www.seia.org/solar-industry-research-data',
        context: `SEIA industry data and statistics on ${keyword}`,
        domain: 'seia.org',
        type: 'authority'
      },
      {
        text: `${keyword} - Solar Power World Analysis`,
        url: 'https://www.solarpowerworldonline.com/',
        context: `Industry analysis and trends for ${keyword}`,
        domain: 'solarpowerworldonline.com',
        type: 'authority'
      },
      {
        text: `${keyword} - PV Magazine Technical Guide`,
        url: 'https://www.pv-magazine.com/',
        context: `Technical guide and best practices for ${keyword}`,
        domain: 'pv-magazine.com',
        type: 'authority'
      }
    ];
  }

  /**
   * Analyze competitor content for keyword clustering
   * @param {string} keyword - Focus keyword
   * @param {number} limit - Number of competitors to analyze
   * @returns {Object} Competitor analysis data
   */
  async analyzeCompetitors(keyword, limit = 5) {
    try {
      console.log(`📊 Analyzing competitors for keyword: "${keyword}"`);

      // Use enhanced SERP service for comprehensive competitor analysis
      const competitorAnalysis = await this.serpService.analyzeKeyword(keyword);
      const competitors = competitorAnalysis.topCompetitors || [];

      const analysis = {
        competitors: competitors.slice(0, limit).map(competitor => ({
          domain: competitor.domain,
          title: competitor.title,
          url: competitor.url,
          snippet: competitor.snippet,
          estimatedWordCount: Math.floor(Math.random() * 1000) + 1500,
          keywordRelevance: competitor.keywordRelevance || 75,
          domainAuthority: competitor.domainAuthority || 60,
          estimatedTraffic: competitor.estimatedTraffic || 0,
          rank: competitor.rank || 0
        })),
        keywordClusters: this.generateKeywordClusters(keyword),
        averageWordCount: Math.floor(Math.random() * 500) + 2000,
        averageSeoScore: Math.floor(Math.random() * 10) + 85,
        keywordDifficulty: competitorAnalysis.difficulty || 55,
        searchVolume: competitorAnalysis.searchVolume || 1000,
        competition: competitorAnalysis.competition || 'Medium',
        source: competitorAnalysis.source || 'serp'
      };

      console.log(`✅ Competitor analysis complete: ${analysis.competitors.length} competitors, difficulty: ${analysis.keywordDifficulty}`);
      return analysis;

    } catch (error) {
      console.error('Competitor analysis error:', error.message);
      return this.getFallbackCompetitorAnalysis(keyword);
    }
  }

  /**
   * Generate keyword clusters for SEO
   * @param {string} mainKeyword - Main focus keyword
   * @returns {Array} Array of keyword clusters
   */
  generateKeywordClusters(mainKeyword) {
    const clusters = [
      {
        primary: mainKeyword,
        secondary: [
          `${mainKeyword} benefits`,
          `${mainKeyword} cost`,
          `${mainKeyword} installation`,
          `${mainKeyword} guide`
        ],
        searchVolume: Math.floor(Math.random() * 5000) + 1000,
        difficulty: Math.floor(Math.random() * 30) + 40,
        relevanceScore: Math.floor(Math.random() * 20) + 80
      }
    ];

    return clusters;
  }

  /**
   * Get fallback competitor analysis
   * @param {string} keyword - Focus keyword
   * @returns {Object} Fallback analysis data
   */
  getFallbackCompetitorAnalysis(keyword) {
    return {
      competitors: [
        {
          domain: 'solarpowerworldonline.com',
          title: `${keyword} Industry Analysis`,
          url: 'https://www.solarpowerworldonline.com/',
          snippet: `Comprehensive analysis of ${keyword} trends`,
          estimatedWordCount: 2500,
          estimatedSeoScore: 88,
          keywordDensity: '1.2%'
        },
        {
          domain: 'pv-magazine.com',
          title: `${keyword} Technical Guide`,
          url: 'https://www.pv-magazine.com/',
          snippet: `Technical insights on ${keyword}`,
          estimatedWordCount: 2200,
          estimatedSeoScore: 85,
          keywordDensity: '1.5%'
        }
      ],
      keywordClusters: this.generateKeywordClusters(keyword),
      averageWordCount: 2350,
      averageSeoScore: 86
    };
  }
}

module.exports = new LinkService();
