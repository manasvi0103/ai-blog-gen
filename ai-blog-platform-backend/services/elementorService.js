const crypto = require('crypto');

class ElementorService {
  constructor() {
    this.wattmonkStyles = {
      primaryFont: "'Roboto', 'Arial', sans-serif",
      headingColor: "#1A202C",
      h2Color: "#FBD46F", // Golden yellow for H2 headings
      textColor: "#4A5568",
      accentColor: "#FBD46F",
      secondaryAccent: "#FF8C00",
      linkColor: "#3182CE",
      backgroundColor: "#FFF8E1",
      fontWeight: "600" // Semi Bold
    };
  }

  /**
   * Generate unique Elementor ID
   * @returns {string} Unique ID for Elementor elements
   */
  generateElementorId() {
    return crypto.randomBytes(4).toString('hex');
  }

  /**
   * Convert content blocks to Elementor JSON format
   * @param {Array} contentBlocks - Array of content blocks
   * @param {string} focusKeyword - SEO focus keyword
   * @returns {Array} Elementor JSON structure
   */
  convertToElementorJSON(contentBlocks, focusKeyword = '') {
    console.log(`🎨 Converting ${contentBlocks.length} blocks to Elementor JSON format`);

    const elementorData = [];
    let currentSection = null;
    let currentColumn = null;

    for (const block of contentBlocks) {
      // Create new section if needed
      if (!currentSection) {
        currentSection = this.createSection();
        currentColumn = this.createColumn();
        currentSection.elements.push(currentColumn);
        elementorData.push(currentSection);
      }

      // Convert block to Elementor widget
      const widget = this.convertBlockToWidget(block, focusKeyword);
      if (widget) {
        currentColumn.elements.push(widget);
      }

      // Create new section for certain block types (like images or major headings)
      if (block.type === 'image' || (block.type === 'h2' && currentColumn.elements.length > 3)) {
        currentSection = null; // Force new section creation
      }
    }

    // Add "You May Also Like" section
    const relatedSection = this.createRelatedArticlesSection();
    elementorData.push(relatedSection);

    console.log(`✅ Generated Elementor JSON with ${elementorData.length} sections`);
    return elementorData;
  }

  /**
   * Create Elementor section structure
   * @returns {Object} Elementor section object
   */
  createSection() {
    return {
      id: this.generateElementorId(),
      elType: "section",
      settings: {
        structure: "20",
        gap: "default"
      },
      elements: []
    };
  }

  /**
   * Create Elementor column structure
   * @returns {Object} Elementor column object
   */
  createColumn() {
    return {
      id: this.generateElementorId(),
      elType: "column",
      settings: {
        _column_size: 100,
        _inline_size: null
      },
      elements: []
    };
  }

  /**
   * Convert content block to Elementor widget
   * @param {Object} block - Content block
   * @param {string} focusKeyword - SEO focus keyword
   * @returns {Object} Elementor widget object
   */
  convertBlockToWidget(block, focusKeyword) {
    const baseWidget = {
      id: this.generateElementorId(),
      elType: "widget",
      settings: {}
    };

    switch (block.type) {
      case 'h1':
      case 'title':
        return {
          ...baseWidget,
          widgetType: "heading",
          settings: {
            title: block.content,
            header_size: "h1",
            color: this.wattmonkStyles.headingColor,
            typography_typography: "custom",
            typography_font_family: this.wattmonkStyles.primaryFont,
            typography_font_weight: "800",
            typography_font_size: {
              unit: "px",
              size: 42
            },
            typography_line_height: {
              unit: "em",
              size: 1.2
            }
          }
        };

      case 'h2':
        return {
          ...baseWidget,
          widgetType: "heading",
          settings: {
            title: block.content,
            header_size: "h2",
            color: this.wattmonkStyles.h2Color,
            typography_typography: "custom",
            typography_font_family: this.wattmonkStyles.primaryFont,
            typography_font_weight: this.wattmonkStyles.fontWeight,
            typography_font_size: {
              unit: "px",
              size: 28
            },
            typography_line_height: {
              unit: "em",
              size: 1.3
            }
          }
        };

      case 'h3':
        return {
          ...baseWidget,
          widgetType: "heading",
          settings: {
            title: block.content,
            header_size: "h3",
            color: this.wattmonkStyles.headingColor,
            typography_typography: "custom",
            typography_font_family: this.wattmonkStyles.primaryFont,
            typography_font_weight: "700",
            typography_font_size: {
              unit: "px",
              size: 24
            }
          }
        };

      case 'paragraph':
      case 'introduction':
      case 'section':
        return {
          ...baseWidget,
          widgetType: "text-editor",
          settings: {
            editor: this.formatTextContent(block.content),
            typography_typography: "custom",
            typography_font_family: this.wattmonkStyles.primaryFont,
            typography_font_size: {
              unit: "px",
              size: 16
            },
            typography_line_height: {
              unit: "em",
              size: 1.7
            },
            text_color: this.wattmonkStyles.textColor
          }
        };

      case 'list':
        return {
          ...baseWidget,
          widgetType: "text-editor",
          settings: {
            editor: this.formatListContent(block.content),
            typography_typography: "custom",
            typography_font_family: this.wattmonkStyles.primaryFont,
            typography_font_size: {
              unit: "px",
              size: 16
            },
            text_color: this.wattmonkStyles.textColor
          }
        };

      case 'image':
        return {
          ...baseWidget,
          widgetType: "image",
          settings: {
            image: {
              url: block.imageUrl || block.src || "https://via.placeholder.com/800x400",
              id: ""
            },
            image_size: "large",
            caption: block.alt || block.altText || "",
            align: "center"
          }
        };

      case 'quote':
        return {
          ...baseWidget,
          widgetType: "blockquote",
          settings: {
            blockquote_content: block.content,
            typography_typography: "custom",
            typography_font_family: this.wattmonkStyles.primaryFont,
            typography_font_style: "italic",
            blockquote_skin: "border"
          }
        };

      default:
        // Default to text editor for unknown types
        return {
          ...baseWidget,
          widgetType: "text-editor",
          settings: {
            editor: block.content || "",
            typography_typography: "custom",
            typography_font_family: this.wattmonkStyles.primaryFont
          }
        };
    }
  }

  /**
   * Format text content for Elementor
   * @param {string} content - Raw text content
   * @returns {string} Formatted HTML content
   */
  formatTextContent(content) {
    if (!content) return '';
    
    // Ensure content is wrapped in paragraphs if not already
    if (!content.includes('<p>') && !content.includes('<ul>') && !content.includes('<ol>')) {
      return `<p>${content}</p>`;
    }
    
    return content;
  }

  /**
   * Format list content for Elementor
   * @param {string} content - List content
   * @returns {string} Formatted HTML list
   */
  formatListContent(content) {
    if (!content) return '';
    
    // If content is already formatted as HTML list, return as is
    if (content.includes('<ul>') || content.includes('<ol>')) {
      return content;
    }
    
    // Convert plain text to HTML list
    const items = content.split('\n').filter(item => item.trim());
    const listItems = items.map(item => `<li>${item.replace(/^[-*•]\s*/, '')}</li>`).join('');
    return `<ul>${listItems}</ul>`;
  }

  /**
   * Create "You May Also Like" related articles section
   * @returns {Object} Elementor section for related articles
   */
  createRelatedArticlesSection() {
    const section = this.createSection();
    const column = this.createColumn();
    
    // Related articles heading
    const headingWidget = {
      id: this.generateElementorId(),
      elType: "widget",
      widgetType: "heading",
      settings: {
        title: "⚡ You May Also Like",
        header_size: "h3",
        align: "center",
        color: this.wattmonkStyles.headingColor,
        typography_typography: "custom",
        typography_font_family: this.wattmonkStyles.primaryFont,
        typography_font_weight: "700",
        typography_font_size: {
          unit: "px",
          size: 28
        }
      }
    };

    // Related articles content
    const relatedContent = `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="margin-bottom: 16px; padding: 20px; background: ${this.wattmonkStyles.backgroundColor}; border-radius: 12px; border-left: 5px solid ${this.wattmonkStyles.accentColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <a href="https://www.wattmonk.com/solar-pto-process-to-accelerate-approval/" target="_blank" style="color: ${this.wattmonkStyles.headingColor}; text-decoration: none; font-weight: 600; display: block;">📋 Solar PTO Guide: Avoid Delays & Speed Up Approvals</a>
        <span style="color: #666; font-size: 14px; margin-top: 5px; display: block;">Complete guide to streamline your solar PTO process</span>
      </div>
      <div style="margin-bottom: 16px; padding: 20px; background: ${this.wattmonkStyles.backgroundColor}; border-radius: 12px; border-left: 5px solid ${this.wattmonkStyles.accentColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <a href="https://www.wattmonk.com/service/pto-interconnection/" target="_blank" style="color: ${this.wattmonkStyles.headingColor}; text-decoration: none; font-weight: 600; display: block;">⚡ Solar PTO Interconnection Made Easy</a>
        <span style="color: #666; font-size: 14px; margin-top: 5px; display: block;">Professional interconnection services for solar projects</span>
      </div>
      <div style="margin-bottom: 16px; padding: 20px; background: ${this.wattmonkStyles.backgroundColor}; border-radius: 12px; border-left: 5px solid ${this.wattmonkStyles.accentColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <a href="https://www.wattmonk.com/utility-interconnection/" target="_blank" style="color: ${this.wattmonkStyles.headingColor}; text-decoration: none; font-weight: 600; display: block;">🔌 Utility Interconnection Services</a>
        <span style="color: #666; font-size: 14px; margin-top: 5px; display: block;">Expert utility interconnection solutions</span>
      </div>
      <div style="margin-bottom: 16px; padding: 20px; background: ${this.wattmonkStyles.backgroundColor}; border-radius: 12px; border-left: 5px solid ${this.wattmonkStyles.accentColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <a href="https://www.wattmonk.com/solar-pv-agrivoltaic-guide/" target="_blank" style="color: ${this.wattmonkStyles.headingColor}; text-decoration: none; font-weight: 600; display: block;">🌱 Solar PV Agrivoltaic Complete Guide</a>
        <span style="color: #666; font-size: 14px; margin-top: 5px; display: block;">Comprehensive guide to agrivoltaic solar systems</span>
      </div>
    </div>`;

    const contentWidget = {
      id: this.generateElementorId(),
      elType: "widget",
      widgetType: "text-editor",
      settings: {
        editor: relatedContent,
        typography_typography: "custom",
        typography_font_family: this.wattmonkStyles.primaryFont
      }
    };

    column.elements.push(headingWidget);
    column.elements.push(contentWidget);
    section.elements.push(column);

    return section;
  }

  /**
   * Generate complete Elementor meta data for WordPress
   * @param {Array} contentBlocks - Content blocks
   * @param {string} focusKeyword - SEO focus keyword
   * @returns {Object} Complete Elementor meta data
   */
  generateElementorMetaData(contentBlocks, focusKeyword = '') {
    const elementorData = this.convertToElementorJSON(contentBlocks, focusKeyword);
    
    return {
      _elementor_edit_mode: "builder",
      _elementor_template_type: "wp-post",
      _elementor_version: "3.15.0",
      _elementor_pro_version: "3.15.0",
      _elementor_data: JSON.stringify(elementorData),
      _elementor_page_settings: JSON.stringify({
        custom_css: `
          .wattmonk-h2 { color: ${this.wattmonkStyles.h2Color} !important; }
          .wattmonk-text { font-family: ${this.wattmonkStyles.primaryFont} !important; }
        `
      })
    };
  }
}

module.exports = new ElementorService();
