// @ts-check
import { ElektrokitVendor } from '../src/vendors/electrokit/ElektrokitScraper.js';

const quickTest = async () => {
  console.log('Starting quick test of Electrokit scraper...');
  
  const vendor = new ElektrokitVendor();
  try {
    // Initialize the scraper
    console.log('Initializing scraper...');
    await vendor['scraper'].initialize();
    console.log('Scraper initialized successfully');

    // Test getting details for a known product
    const testPartNumber = '41010510';  // Part number for a 10k resistor
    console.log(`\nTesting product details for part number: ${testPartNumber}`);
    
    try {
      const details = await vendor.getDetails(testPartNumber);
      console.log('\nProduct details:');
      console.log('- Part Number:', details.partNumber);
      console.log('- Name:', details.name);
      console.log('- Category:', details.category);
      console.log('- Specifications:', JSON.stringify(details.specifications, null, 2));
      
      // Get price information
      console.log('\nFetching price information...');
      const priceInfo = await vendor.getPrice(testPartNumber);
      console.log('- Price:', priceInfo.price, priceInfo.currency);
      console.log('- In Stock:', priceInfo.inStock);
      
      // Get stock information
      console.log('\nFetching stock information...');
      const stockInfo = await vendor.checkStock(testPartNumber);
      console.log('- Stock Status:', stockInfo.inStock ? 'In Stock' : 'Out of Stock');
      if (stockInfo.quantity !== undefined) {
        console.log('- Quantity:', stockInfo.quantity);
      }
    } catch (error) {
      console.error('Error getting product details:', error);
    }

    // Now try the search
    console.log('\nTesting search functionality...');
    try {
      const searchResults = await vendor.search('resistor 10k', { limit: 1 });
      console.log(`Found ${searchResults.length} results`);
      
      if (searchResults.length > 0) {
        const component = searchResults[0];
        console.log('\nFirst search result:');
        console.log('- Part Number:', component.partNumber);
        console.log('- Name:', component.name);
        console.log('- Category:', component.category);
        console.log('- Specifications:', JSON.stringify(component.specifications, null, 2));
      }
    } catch (error) {
      console.error('Error during search:', error);
    }
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Clean up
    console.log('\nCleaning up...');
    try {
      await vendor['scraper'].close();
      console.log('Cleanup successful');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
    // Exit after cleanup
    process.exit(0);
  }
}

// Run the test and handle any unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

quickTest(); 