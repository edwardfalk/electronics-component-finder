import { BaseScraper, ScraperOptions } from '../../lib/scrapers/base/BaseScraper';
import { BaseVendor } from '../../lib/base/BaseVendor';
import { Component, ComponentPrice, SearchOptions, StockInfo } from '../../types';

export class ElektrokitScraper extends BaseScraper {
  private readonly searchUrl = 'https://www.electrokit.com/en/search/';

  constructor(options?: ScraperOptions) {
    super({
      ...options,
      timeout: options?.timeout || 60000,
      headless: true,
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    });
  }

  private async getMetadata(): Promise<Record<string, string>> {
    const metadata: Record<string, string> = {};

    // Extract metadata from HTML
    const metaTags = await this.page?.evaluate(() => {
      return Array.from(document.querySelectorAll('meta')).map(meta => ({
        name: meta.getAttribute('name') || meta.getAttribute('property') || '',
        content: meta.getAttribute('content') || ''
      })).filter(meta => meta.name && meta.content);
    }) || [];

    for (const meta of metaTags) {
      metadata[meta.name] = meta.content;
    }

    return metadata;
  }

  async searchProducts(query: string): Promise<Component[]> {
    try {
      if (!this.page) {
        throw new Error('Browser not initialized');
      }

      // Update search URL structure
      const searchUrl = `https://www.electrokit.com/en/search/?s=${encodeURIComponent(query)}`;
      console.log('Navigating to:', searchUrl);
      
      await this.page.goto(searchUrl, { waitUntil: 'networkidle0' });
      console.log('Current URL:', await this.page.url());
      
      // Wait for either products or no-results message
      const content = await this.page.content();
      console.log('Page content length:', content.length);
      console.log('Page title:', await this.page.title());

      // Wait for product grid or no results message
      await Promise.race([
        this.page.waitForSelector('.product-grid', { timeout: 30000 }),
        this.page.waitForSelector('.no-results', { timeout: 30000 })
      ]);

      // Check if we have any results
      const noResults = await this.page.$('.no-results');
      if (noResults) {
        return [];
      }

      // Extract product data
      const products = await this.page.$$('.product-grid .product-item');
      console.log('Found product elements:', products.length);

      const components: Component[] = [];
      
      for (const product of products) {
        try {
          const name = await product.$eval('.product-title', el => el.textContent?.trim() || '');
          const url = await product.$eval('.product-link', (el: any) => el.href);
          const imageUrl = await product.$eval('.product-image img', (el: any) => el.src);
          const priceText = await product.$eval('.product-price', el => el.textContent?.trim() || '');
          const stockText = await product.$eval('.stock-status', el => el.textContent?.trim() || '');
          
          // Extract numeric price
          const price = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.'));
          
          // Parse stock status
          const inStock = stockText.toLowerCase().includes('in stock');

          // Generate a part number from the URL
          const urlParts = url.split('/');
          const partNumber = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];

          components.push({
            partNumber,
            name,
            url,
            imageUrl,
            price,
            currency: 'SEK',
            inStock,
            category: '', // We'll extract this from product details later
            specifications: {}, // We'll extract this from product details later
            manufacturer: 'Unknown' // We'll extract this from product details later
          });
        } catch (error) {
          console.error('Error extracting product data:', error);
        }
      }

      return components;
    } catch (error: any) {
      console.error('Error in searchProducts:', error);
      const screenshot = await this.page?.screenshot({ path: 'search-error.png' });
      throw new Error('No products found');
    }
  }

  private async scrapeProductDetails(url: string): Promise<Component | null> {
    await this.navigateToPage(url);
    
    try {
      // Wait for product details and extract metadata
      await this.waitForSelector('.product');
      const metadata = await this.getMetadata();

      // Extract basic information
      const name = await this.extractText('.product_title');
      const description = await this.extractText('.woocommerce-product-details__short-description') || undefined;
      const sku = await this.extractText('.sku');
      
      // Extract specifications
      const specs = await this.page?.evaluate(() => {
        const specs: Record<string, string> = {};
        document.querySelectorAll('.woocommerce-product-attributes tr').forEach(row => {
          const label = row.querySelector('th')?.textContent?.trim();
          const value = row.querySelector('td')?.textContent?.trim();
          if (label && value) {
            specs[label] = value;
          }
        });
        return specs;
      }) || {};

      // Extract price information
      const priceText = await this.extractText('.price');
      const priceDetails = await this.extractPriceDetails(priceText);

      // Extract stock information
      const stockInfo = await this.extractStockInfo();

      // Extract datasheet URL if available
      const datasheet = await this.extractAttribute('a[href$=".pdf"]', 'href');

      // Extract all product images
      const images = await this.page?.evaluate(() => {
        return Array.from(document.querySelectorAll('.woocommerce-product-gallery__image img')).map(img => ({
          url: img.getAttribute('src') || '',
          alt: img.getAttribute('alt') || ''
        }));
      }) || [];

      if (!name || !sku) {
        return null;
      }

      // Create component with enhanced metadata
      return {
        partNumber: sku,
        name,
        description,
        category: this.determineCategory(specs),
        specifications: {
          ...this.normalizeSpecifications(specs),
          page_title: metadata['title'] || '',
          meta_description: metadata['description'] || '',
          meta_keywords: metadata['keywords']?.split(',').map((k: string) => k.trim()).join(',') || '',
          last_updated: new Date().toISOString()
        },
        datasheet: datasheet || undefined,
        imageUrl: images.length > 0 ? images[0].url : undefined,
        manufacturer: specs['Manufacturer'] || undefined,
        url,
        price: priceDetails.price,
        currency: priceDetails.currency,
        inStock: stockInfo.inStock
      };
    } catch (error: any) {
      // Take a screenshot on error
      await this.takeScreenshot(true);

      throw new Error(`Failed to extract product details: ${error.message || 'Unknown error'}`);
    }
  }

  protected async extractText(selector: string): Promise<string | null> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const element = await this.page.$(selector);
    if (!element) {
      return null;
    }

    return await this.page.evaluate(el => el.textContent?.trim() || null, element);
  }

  protected async extractAttribute(selector: string, attribute: string): Promise<string | null> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const element = await this.page.$(selector);
    if (!element) {
      return null;
    }

    return await this.page.evaluate(
      (el, attr) => el.getAttribute(attr),
      element,
      attribute
    );
  }

  protected async extractPriceDetails(priceText: string | null): Promise<ComponentPrice> {
    if (!priceText) {
      return { price: 0, currency: 'SEK' };
    }

    // Extract base price
    const price = this.parsePriceText(priceText);
    if (price === null) {
      return { price: 0, currency: 'SEK' };
    }

    // Extract quantity breaks
    const breakPoints = await this.page?.evaluate(() => {
      return Array.from(document.querySelectorAll('.quantity-break-table tr:not(:first-child)')).map(row => {
        const cells = row.querySelectorAll('td');
        return {
          quantity: parseInt(cells[0].textContent?.trim().replace(/[^0-9]/g, '') || '0', 10),
          price: parseFloat(cells[1].textContent?.trim().replace(/[^0-9.,]/g, '').replace(',', '.') || '0')
        };
      }).filter(bp => !isNaN(bp.quantity) && !isNaN(bp.price))
    }) || [];

    return {
      price,
      currency: 'SEK',
      breakPoints: breakPoints.length > 0 ? breakPoints : undefined
    };
  }

  private parsePriceText(priceText: string): number | null {
    const cleaned = priceText.replace(/[^0-9.,]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);
    return isNaN(price) ? null : price;
  }

  private determineCategory(specs: Record<string, string>): string {
    const categoryMap: Record<string, string> = {
      'Motstånd': 'resistor',
      'Kondensator': 'capacitor',
      'Transistor': 'transistor',
      'IC': 'integrated_circuit',
      'LED': 'led',
      'Diod': 'diode',
      'Sensor': 'sensor',
      'Mikrocontroller': 'microcontroller',
      'Display': 'display',
      'Batteri': 'battery',
      'Kontakt': 'connector',
      'Kabel': 'cable',
      'Verktyg': 'tool'
    };

    const category = specs['Category'] || '';
    return categoryMap[category] || 'other';
  }

  private normalizeSpecifications(specs: Record<string, string>): Record<string, string | number | boolean> {
    const normalized: Record<string, string | number | boolean> = {};

    for (const [key, value] of Object.entries(specs)) {
      // Convert numeric values with units
      const numericMatch = value.match(/^([\d.,]+)\s*(k|M|µ|m|p|n)?(Ω|F|H|V|A|W|Hz|m)?$/);
      if (numericMatch) {
        let [, num, prefix, unit] = numericMatch;
        let multiplier = 1;
        
        // Handle SI prefixes
        if (prefix) {
          const prefixMap: Record<string, number> = {
            'p': 1e-12, 'n': 1e-9, 'µ': 1e-6, 'm': 1e-3,
            'k': 1e3, 'M': 1e6
          };
          multiplier = prefixMap[prefix] || 1;
        }

        const baseValue = parseFloat(num.replace(',', '.')) * multiplier;
        normalized[key] = baseValue;
        if (unit) {
          normalized[`${key}_unit`] = unit;
        }
      }
      // Convert boolean values
      else if (['yes', 'no', 'true', 'false'].includes(value.toLowerCase())) {
        normalized[key] = ['yes', 'true'].includes(value.toLowerCase());
      }
      // Keep string values as is
      else {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  private async extractStockInfo(): Promise<StockInfo> {
    const stockText = await this.extractText('.stock');
    const inStock = stockText ? /in stock/i.test(stockText) : false;

    return {
      inStock,
      quantity: undefined,
      deliveryDays: undefined
    };
  }
}

export class ElektrokitVendor extends BaseVendor {
  private scraper: ElektrokitScraper;

  constructor() {
    super('Electrokit', 'https://www.electrokit.com', 2); // Max 2 requests per second
    this.scraper = new ElektrokitScraper();
  }

  async search(query: string, options?: SearchOptions): Promise<Component[]> {
    return this.retryOperation(async () => {
      return await this.scraper.searchProducts(query, options);
    });
  }

  async getPrice(partNumber: string): Promise<ComponentPrice> {
    return this.retryOperation(async () => {
      const products = await this.scraper.searchProducts(partNumber, { limit: 1 });
      if (!products.length) {
        throw new Error(`Product not found: ${partNumber}`);
      }

      // Navigate to product page
      await this.scraper['navigateToPage'](products[0].url || '');
      await this.scraper['waitForSelector']('.price');

      // Extract price information
      const priceText = await this.scraper['extractText']('.price');
      const priceDetails = await this.scraper['extractPriceDetails'](priceText);

      // Extract stock information
      const stockText = await this.scraper['extractText']('.stock');
      const inStock = stockText ? !stockText.toLowerCase().includes('out of stock') : false;
      const stockMatch = stockText?.match(/(\d+)\s*i\s*lager/i);
      const stockQuantity = stockMatch ? parseInt(stockMatch[1], 10) : undefined;

      // Extract delivery time
      const deliveryText = await this.scraper['extractText']('.delivery-time');
      const deliveryMatch = deliveryText?.match(/(\d+)(?:-(\d+))?\s*(?:dag(?:ar)?|week(?:s)?)/i);
      const deliveryDays = deliveryMatch 
        ? deliveryMatch[2] 
          ? Math.ceil((parseInt(deliveryMatch[1]) + parseInt(deliveryMatch[2])) / 2)
          : parseInt(deliveryMatch[1])
        : undefined;

      return {
        ...priceDetails,
        quantity: 1,
        inStock,
        stockQuantity,
        deliveryDays,
        lastUpdated: new Date()
      };
    });
  }

  async checkStock(partNumber: string): Promise<StockInfo> {
    return this.retryOperation(async () => {
      const products = await this.scraper.searchProducts(partNumber, { limit: 1 });
      if (!products.length) {
        throw new Error(`Product not found: ${partNumber}`);
      }

      await this.scraper['navigateToPage'](products[0].url || '');

      // Extract stock information
      const stockText = await this.scraper['extractText']('.stock');
      if (!stockText) {
        throw new Error(`Stock information not found for part number ${partNumber}`);
      }

      const inStock = !stockText.toLowerCase().includes('out of stock');
      const stockMatch = stockText.match(/(\d+)\s*i\s*lager/i);
      const quantity = stockMatch ? parseInt(stockMatch[1], 10) : undefined;

      // Extract delivery time
      const deliveryText = await this.scraper['extractText']('.delivery-time');
      const deliveryMatch = deliveryText?.match(/(\d+)(?:-(\d+))?\s*(?:dag(?:ar)?|week(?:s)?)/i);
      const deliveryDays = deliveryMatch 
        ? deliveryMatch[2] 
          ? Math.ceil((parseInt(deliveryMatch[1]) + parseInt(deliveryMatch[2])) / 2)
          : parseInt(deliveryMatch[1])
        : undefined;

      return {
        inStock,
        quantity,
        deliveryDays,
        lastChecked: new Date()
      };
    });
  }

  async getDetails(partNumber: string): Promise<Component> {
    return this.retryOperation(async () => {
      const products = await this.scraper.searchProducts(partNumber, { limit: 1 });
      if (!products.length) {
        throw new Error(`Product not found: ${partNumber}`);
      }
      return products[0];
    });
  }
}