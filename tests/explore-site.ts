import { BrowserManager } from '@mcp-server/browser-manager';

async function exploreSite() {
  const browser = new BrowserManager({ 
    headless: true,
    timeout: 60000,
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  });

  try {
    await browser.initialize();
    console.log('Exploring Electrokit site...');
    
    // Go directly to a known product page first
    console.log('\nNavigating to a known product page...');
    await browser.navigate('https://www.electrokit.com/en/product/resistor-0-25w-1-10k/', {
      waitUntil: 'networkidle0'
    });

    // Wait for product content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get product page structure
    const productStructure = await browser.evaluateScript<{
      selectors: Record<string, boolean>,
      content: Record<string, string | null>
    }>(`
      const selectors = {
        title: !!document.querySelector('.product_title'),
        sku: !!document.querySelector('.sku'),
        price: !!document.querySelector('.price'),
        stock: !!document.querySelector('.stock'),
        description: !!document.querySelector('.woocommerce-product-details__short-description'),
        specifications: !!document.querySelector('.woocommerce-product-attributes'),
        images: !!document.querySelector('.woocommerce-product-gallery__image'),
        addToCart: !!document.querySelector('.single_add_to_cart_button'),
        quantity: !!document.querySelector('.quantity input'),
        breadcrumbs: !!document.querySelector('.woocommerce-breadcrumb'),
        categories: !!document.querySelector('.posted_in'),
        tabs: !!document.querySelector('.woocommerce-tabs')
      };

      const content = {
        title: document.querySelector('.product_title')?.textContent?.trim() || null,
        sku: document.querySelector('.sku')?.textContent?.trim() || null,
        price: document.querySelector('.price')?.textContent?.trim() || null,
        stock: document.querySelector('.stock')?.textContent?.trim() || null,
        description: document.querySelector('.woocommerce-product-details__short-description')?.textContent?.trim() || null,
        categories: document.querySelector('.posted_in')?.textContent?.trim() || null,
        breadcrumbs: document.querySelector('.woocommerce-breadcrumb')?.textContent?.trim() || null
      };

      return { selectors, content };
    `);

    console.log('\nProduct Page Structure:');
    console.log('Available Selectors:', JSON.stringify(productStructure.selectors, null, 2));
    console.log('Content Sample:', JSON.stringify(productStructure.content, null, 2));

    // Get specifications table structure
    const specifications = await browser.evaluateScript<Array<{
      label: string,
      value: string
    }>>(`
      Array.from(document.querySelectorAll('.woocommerce-product-attributes tr')).map(row => ({
        label: row.querySelector('th')?.textContent?.trim() || '',
        value: row.querySelector('td')?.textContent?.trim() || ''
      }));
    `);

    console.log('\nSpecifications Structure:');
    console.log(JSON.stringify(specifications, null, 2));

    // Now try the search functionality
    console.log('\nTesting search functionality...');
    await browser.navigate('https://www.electrokit.com/en/search/?s=resistor+10k', {
      waitUntil: 'networkidle0'
    });

    // Wait for search results
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get search page structure
    const searchStructure = await browser.evaluateScript<{
      selectors: Record<string, boolean>,
      results: Array<{
        title: string,
        price: string,
        url: string,
        category?: string
      }>
    }>(`
      const selectors = {
        searchResults: !!document.querySelector('.products'),
        pagination: !!document.querySelector('.woocommerce-pagination'),
        sorting: !!document.querySelector('.woocommerce-ordering'),
        resultCount: !!document.querySelector('.woocommerce-result-count'),
        filters: !!document.querySelector('.widget-area')
      };

      const results = Array.from(document.querySelectorAll('.products .product')).map(el => ({
        title: el.querySelector('.woocommerce-loop-product__title')?.textContent?.trim() || '',
        price: el.querySelector('.price')?.textContent?.trim() || '',
        url: el.querySelector('a.woocommerce-LoopProduct-link')?.href || '',
        category: el.querySelector('.posted_in')?.textContent?.trim()
      }));

      return { selectors, results };
    `);

    console.log('\nSearch Page Structure:');
    console.log('Available Selectors:', JSON.stringify(searchStructure.selectors, null, 2));
    console.log('Sample Results:', JSON.stringify(searchStructure.results.slice(0, 2), null, 2));

  } catch (error) {
    console.error('Error during exploration:', error);
  } finally {
    await browser.close();
  }
}

// Run the exploration
exploreSite().catch(console.error); 