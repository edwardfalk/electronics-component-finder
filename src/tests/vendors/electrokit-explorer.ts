import { BrowserManager } from '@mcp-server/browser-manager';

// Handle graceful shutdown
let browser: BrowserManager | null = null;
const shutdown = async (signal?: string) => {
  if (browser) {
    console.log(`\n${signal ? `Received ${signal}. ` : ''}Shutting down gracefully...`);
    try {
      await browser.close();
      await browser.cleanup();
    } catch (error) {
      console.error('Shutdown error:', error);
    }
  }
  process.exit(0);
};

// Register signal handlers
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      // Increase delay for next attempt
      delayMs *= 2;
    }
  }
  throw new Error('Should not reach here');
};

const exploreElektrokit = async () => {
  console.log('Starting Electrokit exploration...');
  
  browser = new BrowserManager({
    headless: true,
    timeout: 30000,
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });

  try {
    // Initialize browser with retry
    await retryOperation(async () => {
      console.log('Initializing browser...');
      await browser!.initialize();
      console.log('Browser initialized successfully');
    });

    // 1. Explore main page structure
    console.log('\nExploring main page...');
    const mainPage = await retryOperation(async () => {
      const result = await browser!.navigate('https://www.electrokit.com/en/');
      console.log('Main page loaded successfully');
      return result;
    });
    console.log('Main page metadata:', JSON.stringify(mainPage.metadata, null, 2));

    // 2. Extract category structure
    console.log('\nExtracting categories...');
    const categories = await retryOperation(async () => {
      await browser!.waitForSelector('#menu-huvudmeny');
      return await browser!.evaluateScript<Array<{ name: string; url: string }>>(`
        Array.from(document.querySelectorAll('#menu-huvudmeny li a')).map(a => ({
          name: a.textContent?.trim() || '',
          url: a.getAttribute('href') || ''
        })).filter(cat => cat.name && cat.url)
      `);
    });
    console.log('Categories found:', categories.length);
    console.log('Category list:', JSON.stringify(categories, null, 2));

    // 3. Explore a sample product category
    console.log('\nExploring Resistors category...');
    await retryOperation(async () => {
      await browser!.navigate('https://www.electrokit.com/en/product-category/components/resistors/');
      await browser!.waitForSelector('.products');
    });

    const productGrid = await retryOperation(async () => {
      return await browser!.evaluateScript<{
        products: Array<{
          name: string;
          sku: string;
          price: string;
          stock: string;
        }>;
        pagination: {
          currentPage: number;
          totalPages: number;
        };
      }>(`
        ({
          products: Array.from(document.querySelectorAll('.product')).map(el => ({
            name: el.querySelector('.woocommerce-loop-product__title')?.textContent?.trim() || '',
            sku: el.querySelector('.sku')?.textContent?.trim() || '',
            price: el.querySelector('.price')?.textContent?.trim() || '',
            stock: el.querySelector('.stock')?.textContent?.trim() || ''
          })),
          pagination: {
            currentPage: parseInt(document.querySelector('.page-numbers.current')?.textContent || '1'),
            totalPages: Math.max(...Array.from(document.querySelectorAll('.page-numbers'))
              .map(el => parseInt(el.textContent || '0'))
              .filter(n => !isNaN(n)))
          }
        })
      `);
    });
    console.log('Product grid information:', JSON.stringify(productGrid, null, 2));

    // 4. Explore search functionality
    console.log('\nTesting search functionality...');
    await retryOperation(async () => {
      await browser!.navigate('https://www.electrokit.com/en/search/?s=resistor+10k');
      await browser!.waitForSelector('.products');
    });

    const searchResults = await retryOperation(async () => {
      return await browser!.evaluateScript<{
        totalResults: number;
        products: Array<{
          name: string;
          url: string;
        }>;
      }>(`
        ({
          totalResults: parseInt(document.querySelector('.woocommerce-result-count')?.textContent?.match(/\\d+/)?.[0] || '0'),
          products: Array.from(document.querySelectorAll('.product')).map(el => ({
            name: el.querySelector('.woocommerce-loop-product__title')?.textContent?.trim() || '',
            url: el.querySelector('a.woocommerce-LoopProduct-link')?.getAttribute('href') || ''
          }))
        })
      `);
    });
    console.log('Search results:', JSON.stringify(searchResults, null, 2));

    // 5. Explore product details page
    if (searchResults.products.length > 0) {
      console.log('\nExploring product details...');
      const productUrl = searchResults.products[0].url;
      
      await retryOperation(async () => {
        await browser!.navigate(productUrl);
        await browser!.waitForSelector('.product');
      });

      const productDetails = await retryOperation(async () => {
        return await browser!.evaluateScript<{
          name: string;
          sku: string;
          price: string;
          stock: string;
          specifications: Record<string, string>;
          variations: Array<{
            attributes: Record<string, string>;
            price: string;
            stock: string;
          }>;
        }>(`
          ({
            name: document.querySelector('.product_title')?.textContent?.trim() || '',
            sku: document.querySelector('.sku')?.textContent?.trim() || '',
            price: document.querySelector('.price')?.textContent?.trim() || '',
            stock: document.querySelector('.stock')?.textContent?.trim() || '',
            specifications: Object.fromEntries(
              Array.from(document.querySelectorAll('.woocommerce-product-attributes tr')).map(row => [
                row.querySelector('th')?.textContent?.trim() || '',
                row.querySelector('td')?.textContent?.trim() || ''
              ])
            ),
            variations: Array.from(document.querySelectorAll('.variations_form')).map(form => ({
              attributes: Object.fromEntries(
                Array.from(form.querySelectorAll('select')).map(select => [
                  select.getAttribute('name') || '',
                  select.value
                ])
              ),
              price: form.querySelector('.price')?.textContent?.trim() || '',
              stock: form.querySelector('.stock')?.textContent?.trim() || ''
            }))
          })
        `);
      });
      console.log('Product details:', JSON.stringify(productDetails, null, 2));
    }

  } catch (error) {
    console.error('Exploration error:', error);
    // Take a screenshot on error if browser is still available
    if (browser) {
      try {
        await browser.evaluateScript(`
          console.error('State at error:', {
            url: window.location.href,
            html: document.body.innerHTML
          });
        `);
      } catch (screenshotError) {
        console.error('Failed to capture error state:', screenshotError);
      }
    }
  } finally {
    // Enhanced cleanup
    if (browser) {
      console.log('\nStarting cleanup...');
      try {
        await browser.close();
        console.log('Browser closed successfully');
        await browser.cleanup();
        console.log('Cleanup completed successfully');
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
    console.log('\nExploration completed');
  }
};

// Run the exploration with global error handling
exploreElektrokit().catch(error => {
  console.error('Fatal error:', error);
  // Ensure we cleanup even on fatal errors
  shutdown();
}); 