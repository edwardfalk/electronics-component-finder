import { ElektrokitScraper } from '../vendors/electrokit/ElektrokitScraper';
import { Component, ComponentPrice, StockInfo } from '../vendors/types';
import { db } from '../db/client';
import { logger } from '../utils/logger';
import { BrowserManager } from '../vendors/scrapers/base/BrowserManager';

export class ScraperService {
  private readonly scrapers: Map<string, ElektrokitScraper>;
  private isRunning: boolean;

  constructor() {
    this.scrapers = new Map();
    this.isRunning = false;
  }

  async initialize() {
    try {
      const elektrokitScraper = new ElektrokitScraper({
        timeout: 60000,
        headless: true,
        retries: 3,
        viewport: { width: 1920, height: 1080 }
      });
      this.scrapers.set('electrokit', elektrokitScraper);
      logger.info('Scraper service initialized');
    } catch (error) {
      logger.error('Failed to initialize scraper service:', error);
      throw error;
    }
  }

  async scrapeAndStore(query: string, options?: { limit?: number }): Promise<Component[]> {
    if (this.isRunning) {
      throw new Error('Scraping already in progress');
    }

    this.isRunning = true;
    const components: Component[] = [];

    try {
      for (const [vendor, scraper] of this.scrapers) {
        logger.info(`Starting scrape for ${vendor} with query: ${query}`);
        
        try {
          const results = await scraper.searchProducts(query, options);
          
          for (const component of results) {
            try {
              // Normalize and validate component data
              const validatedComponent = this.validateComponent(component);
              
              // Store in database
              await this.storeComponent(validatedComponent, vendor);
              
              components.push(validatedComponent);
              logger.info(`Stored component: ${component.name} from ${vendor}`);
            } catch (componentError) {
              logger.error(`Failed to process component ${component.name}:`, componentError);
              // Continue with next component
            }
          }
        } catch (vendorError) {
          logger.error(`Failed to scrape ${vendor}:`, vendorError);
          // Continue with next vendor
        }
      }

      return components;
    } finally {
      this.isRunning = false;
    }
  }

  private validateComponent(component: Component): Component {
    // Validate required fields
    if (!component.name || !component.partNumber) {
      throw new Error('Component missing required fields');
    }

    // Normalize prices
    if (component.price !== undefined && typeof component.price !== 'number') {
      component.price = parseFloat(String(component.price));
    }

    // Ensure all dates are in ISO format
    if (component.lastUpdated) {
      component.lastUpdated = new Date(component.lastUpdated).toISOString();
    }

    return component;
  }

  private async storeComponent(component: Component, vendor: string): Promise<void> {
    const existingComponent = await db.component.findFirst({
      where: {
        partNumber: component.partNumber,
        vendor: vendor
      }
    });

    const componentData = {
      name: component.name,
      description: component.description,
      price: component.price || 0, // Default to 0 if price is undefined
      inStock: component.inStock || false,
      lastUpdated: new Date(),
      specifications: component.specifications,
      imageUrl: component.imageUrl,
      datasheet: component.datasheet
    };

    if (existingComponent) {
      // Update existing component
      await db.component.update({
        where: { id: existingComponent.id },
        data: componentData
      });
    } else {
      // Create new component
      await db.component.create({
        data: {
          partNumber: component.partNumber,
          name: component.name,
          description: component.description,
          category: component.category,
          vendor: vendor,
          price: component.price || 0, // Default to 0 if price is undefined
          currency: component.currency || 'SEK',
          inStock: component.inStock || false,
          url: component.url,
          imageUrl: component.imageUrl,
          datasheet: component.datasheet,
          manufacturer: component.manufacturer,
          specifications: component.specifications,
          lastUpdated: new Date()
        }
      });
    }
  }

  async cleanup() {
    for (const scraper of this.scrapers.values()) {
      try {
        await scraper.close();
      } catch (error) {
        logger.error('Error during scraper cleanup:', error);
      }
    }
    this.scrapers.clear();
  }
}

// Export singleton instance
export const scraperService = new ScraperService(); 