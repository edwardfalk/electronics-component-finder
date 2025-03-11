import { ElektrokitScraper } from '../ElektrokitScraper';
import { SearchOptions } from '../../../types';
import { HTTPRequest } from 'puppeteer';

// Set to true to test against the real website
const USE_REAL_REQUESTS = process.env.USE_REAL_REQUESTS === 'true';

describe('ElektrokitScraper', () => {
  let scraper: ElektrokitScraper;

  beforeEach(async () => {
    scraper = new ElektrokitScraper({
      timeout: 30000,
      headless: true
    });
    await scraper.initialize();
    
    if (!USE_REAL_REQUESTS) {
      // Enable request interception only for mock mode
      const page = (scraper as any).page;
      await page.setRequestInterception(true);

      // Mock network requests
      page.on('request', (request: HTTPRequest) => {
        if (request.url().includes('electrokit.com')) {
          if (request.url().includes('search')) {
            request.respond({
              status: 200,
              contentType: 'text/html',
              body: `
                <html>
                  <body>
                    <div class="products">
                      <div class="product">
                        <h2 class="woocommerce-loop-product__title">Arduino Nano</h2>
                        <a class="woocommerce-LoopProduct-link" href="https://www.electrokit.com/en/product/arduino-nano">
                          <img src="arduino-nano.jpg" alt="Arduino Nano">
                        </a>
                        <span class="price">199 kr</span>
                      </div>
                    </div>
                  </body>
                </html>
              `
            });
          } else if (request.url().includes('product')) {
            request.respond({
              status: 200,
              contentType: 'text/html',
              body: `
                <html>
                  <body>
                    <div class="product">
                      <h1 class="product_title">Arduino Nano</h1>
                      <div class="woocommerce-product-details__short-description">
                        A compact Arduino board
                      </div>
                      <span class="sku">ARD-NANO</span>
                      <span class="price">199 kr</span>
                      <p class="stock">In stock</p>
                      <table class="woocommerce-product-attributes">
                        <tr>
                          <th>Manufacturer</th>
                          <td>Arduino</td>
                        </tr>
                        <tr>
                          <th>Category</th>
                          <td>Mikrocontroller</td>
                        </tr>
                      </table>
                    </div>
                  </body>
                </html>
              `
            });
          } else {
            request.continue();
          }
        } else {
          request.continue();
        }
      });
    }
  });

  afterEach(async () => {
    await scraper.close();
  });

  describe(USE_REAL_REQUESTS ? 'Real Website Tests' : 'Mock Tests', () => {
    it('should search for products', async () => {
      const query = 'arduino nano';
      const options: SearchOptions = { limit: 2 };

      const results = await scraper.searchProducts(query, options);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(2);

      if (results.length > 0) {
        const firstProduct = results[0];
        expect(firstProduct).toHaveProperty('partNumber');
        expect(firstProduct).toHaveProperty('name');
        expect(firstProduct).toHaveProperty('price');
        expect(firstProduct).toHaveProperty('currency', 'SEK');
        expect(firstProduct).toHaveProperty('url');
        expect(firstProduct.url).toContain('electrokit.com');

        // Log real product details when testing against the real website
        if (USE_REAL_REQUESTS) {
          console.log('Found product:', {
            name: firstProduct.name,
            partNumber: firstProduct.partNumber,
            price: firstProduct.price,
            category: firstProduct.category,
            manufacturer: firstProduct.manufacturer
          });
        }
      }
    }, 60000);

    it('should extract product details', async () => {
      const query = USE_REAL_REQUESTS ? 'arduino nano' : 'arduino nano';
      const options: SearchOptions = { limit: 1 };

      const results = await scraper.searchProducts(query, options);
      expect(results.length).toBeGreaterThan(0);

      const product = results[0];
      expect(product).toBeDefined();
      expect(product.specifications).toBeDefined();
      expect(product.inStock).toBeDefined();
      expect(typeof product.price).toBe('number');
      expect(product.currency).toBe('SEK');

      // Log real product details when testing against the real website
      if (USE_REAL_REQUESTS) {
        console.log('Product details:', {
          name: product.name,
          partNumber: product.partNumber,
          price: product.price,
          category: product.category,
          manufacturer: product.manufacturer,
          specifications: product.specifications
        });
      }
    }, 60000);

    it('should handle invalid searches gracefully', async () => {
      const query = 'thisisaninvalidproductthatdoesnotexist12345';
      const options: SearchOptions = { limit: 1 };

      const results = await scraper.searchProducts(query, options);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    }, 60000);
  });
}); 