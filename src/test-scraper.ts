import { ElektrokitVendor } from './vendors/electrokit/ElektrokitScraper.js';

async function testScraper() {
    console.log('Starting Electrokit scraper test...');
    
    const vendor = new ElektrokitVendor();
    try {
        // Initialize
        console.log('Initializing vendor...');
        await vendor['scraper'].initialize();
        
        // Search for Arduino
        console.log('\nSearching for "Arduino Uno"...');
        const results = await vendor.search('Arduino Uno', { limit: 3 });
        
        console.log(`\nFound ${results.length} results:`);
        for (const result of results) {
            console.log('\n-------------------');
            console.log('Name:', result.name);
            console.log('Part Number:', result.partNumber);
            console.log('Category:', result.category);
            console.log('URL:', result.url);
            if (result.imageUrl) {
                console.log('Image:', result.imageUrl);
            }
            console.log('Specifications:', JSON.stringify(result.specifications, null, 2));
        }
        
        // If we found any results, get more details about the first one
        if (results.length > 0) {
            const firstResult = results[0];
            console.log('\nGetting price information for', firstResult.name);
            
            const priceInfo = await vendor.getPrice(firstResult.partNumber);
            console.log('\nPrice Information:');
            console.log('- Price:', priceInfo.price, priceInfo.currency);
            console.log('- In Stock:', priceInfo.inStock);
            if (priceInfo.stockQuantity) {
                console.log('- Stock Quantity:', priceInfo.stockQuantity);
            }
            if (priceInfo.deliveryDays) {
                console.log('- Delivery Days:', priceInfo.deliveryDays);
            }
            if (priceInfo.breakPoints) {
                console.log('\nQuantity Breaks:');
                for (const bp of priceInfo.breakPoints) {
                    console.log(`- Qty ${bp.quantity}: ${bp.price} ${priceInfo.currency}`);
                }
            }
        }
        
    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        // Cleanup
        console.log('\nCleaning up...');
        await vendor['scraper'].close();
        console.log('Done!');
    }
}

testScraper().catch(console.error); 