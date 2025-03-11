import { ElektrokitVendor } from './src/vendors/electrokit/ElektrokitScraper.js';

// Get search term from command line arguments
const searchTerm = process.argv[2] || 'Arduino Uno';

async function searchProducts(query) {
    console.log(`Searching for "${query}"...`);
    
    const vendor = new ElektrokitVendor();
    try {
        // Initialize
        console.log('Initializing vendor...');
        await vendor['scraper'].initialize();
        
        // Search for products
        console.log('\nPerforming search...');
        const results = await vendor.search(query, { limit: 5 });
        
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
            
            // Get price information
            const priceInfo = await vendor.getPrice(result.partNumber);
            console.log('\nPrice:', priceInfo.price, priceInfo.currency);
            console.log('In Stock:', priceInfo.inStock ? 'Yes' : 'No');
            if (priceInfo.stockQuantity) {
                console.log('Stock Quantity:', priceInfo.stockQuantity);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Cleanup
        await vendor['scraper'].close();
    }
}

// Run the search
searchProducts(searchTerm); 