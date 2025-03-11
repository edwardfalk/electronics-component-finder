import { ElektrokitVendor } from '../../src/vendors/electrokit/ElektrokitScraper.js';
import { Component, ComponentPrice, StockInfo } from '../../src/vendors/types.js';

describe('ElektrokitVendor', () => {
  let vendor: ElektrokitVendor;
  const TEST_TIMEOUT = 60000; // Match Jest config timeout

  // Set up vendor once for all tests
  beforeAll(async () => {
    vendor = new ElektrokitVendor();
    // Initialize browser once
    await vendor['scraper'].initialize();
  });

  // Clean up at the end
  afterAll(async () => {
    try {
      if (vendor['scraper']['browserManager']) {
        await vendor['scraper'].close();
      }
    } catch (error) {
      console.error('Error cleaning up browser:', error);
    }
  });

  describe('search', () => {
    it('should return components for a valid search query', async () => {
      const results = await vendor.search('resistor 10k');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      const component = results[0];
      expect(component).toMatchObject({
        partNumber: expect.any(String),
        name: expect.any(String),
        category: expect.any(String),
        specifications: expect.any(Object)
      });

      // Check enhanced metadata
      expect(component.specifications).toMatchObject({
        search_query: 'resistor 10k',
        search_position: 1,
        page_title: expect.any(String),
        meta_description: expect.any(String),
        last_updated: expect.any(String)
      });

      // Validate URL format
      if (component.url) {
        expect(component.url).toMatch(/^https:\/\/www\.electrokit\.com\/en\/product\//);
      }
    }, TEST_TIMEOUT);

    it('should handle empty search results', async () => {
      const results = await vendor.search('xxxxxxxxxxx');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    }, TEST_TIMEOUT);

    it('should respect the limit option', async () => {
      const limit = 3;
      const results = await vendor.search('resistor', { limit });
      expect(results.length).toBeLessThanOrEqual(limit);
    }, TEST_TIMEOUT);

    it('should handle category filtering', async () => {
      const results = await vendor.search('10k', { category: 'resistor' });
      expect(results.every(c => c.category === 'resistor')).toBe(true);
    }, TEST_TIMEOUT);

    it('should include normalized specifications', async () => {
      const results = await vendor.search('resistor 10k', { limit: 1 });
      expect(results.length).toBe(1);

      const specs = results[0].specifications;
      expect(specs).toBeDefined();

      // Check for normalized values
      if ('Resistance' in specs) {
        expect(typeof specs['Resistance']).toBe('number');
        expect('Resistance_unit' in specs).toBe(true);
        expect(specs['Resistance_unit']).toBe('Ω');
      }
    }, TEST_TIMEOUT);
  });

  describe('getPrice', () => {
    it('should return price information for a valid part number', async () => {
      // First search for a component to get a valid part number
      const searchResults = await vendor.search('resistor 10k', { limit: 1 });
      expect(searchResults.length).toBeGreaterThan(0);

      const partNumber = searchResults[0].partNumber;
      const priceInfo = await vendor.getPrice(partNumber);

      expect(priceInfo).toMatchObject({
        price: expect.any(Number),
        currency: 'SEK',
        quantity: expect.any(Number),
        inStock: expect.any(Boolean),
        lastUpdated: expect.any(Date)
      });

      // Validate quantity breaks if present
      if (priceInfo.breakPoints) {
        expect(Array.isArray(priceInfo.breakPoints)).toBe(true);
        priceInfo.breakPoints.forEach(bp => {
          expect(bp).toMatchObject({
            quantity: expect.any(Number),
            price: expect.any(Number)
          });
          expect(bp.quantity).toBeGreaterThan(0);
          expect(bp.price).toBeGreaterThan(0);
        });
      }
    }, TEST_TIMEOUT);

    it('should throw error for invalid part number', async () => {
      await expect(vendor.getPrice('invalid-part-number'))
        .rejects
        .toThrow('Product not found');
    }, TEST_TIMEOUT);
  });

  describe('checkStock', () => {
    it('should return stock information for a valid part number', async () => {
      // First search for a component to get a valid part number
      const searchResults = await vendor.search('resistor 10k', { limit: 1 });
      expect(searchResults.length).toBeGreaterThan(0);

      const partNumber = searchResults[0].partNumber;
      const stockInfo = await vendor.checkStock(partNumber);

      expect(stockInfo).toMatchObject({
        inStock: expect.any(Boolean),
        lastChecked: expect.any(Date)
      });

      if (stockInfo.quantity !== undefined) {
        expect(typeof stockInfo.quantity).toBe('number');
        expect(stockInfo.quantity).toBeGreaterThanOrEqual(0);
      }

      if (stockInfo.deliveryDays !== undefined) {
        expect(typeof stockInfo.deliveryDays).toBe('number');
        expect(stockInfo.deliveryDays).toBeGreaterThan(0);
      }
    }, TEST_TIMEOUT);

    it('should throw error for invalid part number', async () => {
      await expect(vendor.checkStock('invalid-part-number'))
        .rejects
        .toThrow('Product not found');
    }, TEST_TIMEOUT);
  });

  describe('getDetails', () => {
    it('should return component details for a valid part number', async () => {
      // First search for a component to get a valid part number
      const searchResults = await vendor.search('resistor 10k', { limit: 1 });
      expect(searchResults.length).toBeGreaterThan(0);

      const partNumber = searchResults[0].partNumber;
      const component = await vendor.getDetails(partNumber);

      expect(component).toBeDefined();
      expect(component.partNumber).toBe(partNumber);
      expect(component.name).toBeDefined();
      expect(component.category).toBeDefined();
      expect(component.specifications).toBeDefined();

      // Check for enhanced metadata
      expect(component.specifications).toMatchObject({
        page_title: expect.any(String),
        meta_description: expect.any(String),
        last_updated: expect.any(String)
      });

      // Check for optional fields
      if (component.datasheet) {
        expect(component.datasheet).toMatch(/\.pdf$/);
      }

      if (component.imageUrl) {
        expect(component.imageUrl).toMatch(/^https?:\/\//);
      }

      if (component.manufacturer) {
        expect(typeof component.manufacturer).toBe('string');
        expect(component.manufacturer.length).toBeGreaterThan(0);
      }
    }, TEST_TIMEOUT);

    it('should throw error for invalid part number', async () => {
      await expect(vendor.getDetails('invalid-part-number'))
        .rejects
        .toThrow('Product not found');
    }, TEST_TIMEOUT);
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      // Create a vendor with an invalid base URL
      const badVendor = new ElektrokitVendor();
      Object.defineProperty(badVendor, 'baseUrl', {
        value: 'https://invalid.electrokit.com',
        writable: true
      });

      await expect(badVendor.search('resistor'))
        .rejects
        .toThrow();
    }, TEST_TIMEOUT);

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests
      const promises = Array(5).fill(0).map(() => 
        vendor.search('resistor', { limit: 1 })
      );

      // Should not throw rate limit errors
      await expect(Promise.all(promises)).resolves.toBeDefined();
    }, TEST_TIMEOUT * 2); // Double timeout for multiple requests

    it('should retry failed requests', async () => {
      // Mock a failing request that succeeds on retry
      const originalSearch = vendor['scraper'].searchProducts.bind(vendor['scraper']);
      let attempts = 0;
      
      vendor['scraper'].searchProducts = async (...args) => {
        attempts++;
        if (attempts === 1) {
          throw new Error('Temporary failure');
        }
        return originalSearch(...args);
      };

      try {
        const results = await vendor.search('resistor', { limit: 1 });
        expect(results.length).toBeGreaterThan(0);
        expect(attempts).toBeGreaterThan(1);
      } finally {
        // Restore original method
        vendor['scraper'].searchProducts = originalSearch;
      }
    }, TEST_TIMEOUT);
  });
}); 