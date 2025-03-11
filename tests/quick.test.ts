import { ElektrokitVendor } from '../src/vendors/electrokit/ElektrokitScraper.js';

jest.setTimeout(120000); // Set global timeout to 120 seconds

describe('Quick Electrokit Test', () => {
  let vendor: ElektrokitVendor;

  beforeAll(async () => {
    vendor = new ElektrokitVendor();
    try {
      await vendor['scraper'].initialize();
    } catch (error) {
      console.error('Error initializing scraper:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      if (vendor['scraper']) {
        await vendor['scraper'].close();
      }
    } catch (error) {
      console.error('Error closing scraper:', error);
    }
  });

  it('should search and retrieve component information', async () => {
    try {
      // Search for a component
      const searchResults = await vendor.search('resistor 10k', { limit: 1 });
      console.log(`Found ${searchResults.length} results`);
      
      expect(searchResults.length).toBeGreaterThan(0);
      
      const component = searchResults[0];
      console.log('\nComponent details:');
      console.log('- Part Number:', component.partNumber);
      console.log('- Name:', component.name);
      console.log('- Category:', component.category);
      
      // Get price information
      const priceInfo = await vendor.getPrice(component.partNumber);
      console.log('\nPrice information:');
      console.log('- Price:', priceInfo.price, priceInfo.currency);
      console.log('- In Stock:', priceInfo.inStock);
      
      expect(priceInfo.price).toBeGreaterThan(0);
      expect(priceInfo.currency).toBe('SEK');
      
      // Get stock information
      const stockInfo = await vendor.checkStock(component.partNumber);
      console.log('\nStock information:');
      console.log('- Stock Status:', stockInfo.inStock ? 'In Stock' : 'Out of Stock');
      if (stockInfo.quantity !== undefined) {
        console.log('- Quantity:', stockInfo.quantity);
      }
      
      expect(stockInfo.inStock !== undefined).toBe(true);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });
}); 