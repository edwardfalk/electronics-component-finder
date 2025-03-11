import { scraperService } from '../services/scraperService';
import { logger } from '../utils/logger';

async function testScraperIntegration() {
  try {
    // Initialize the scraper service
    await scraperService.initialize();
    logger.info('Scraper service initialized');

    // Test scraping with a simple query
    const components = await scraperService.scrapeAndStore('Arduino', { limit: 5 });
    
    logger.info(`Successfully scraped ${components.length} components`);
    components.forEach(component => {
      logger.info(`- ${component.name} (${component.partNumber})`);
    });

  } catch (error) {
    logger.error('Error during scraper test:', error);
  } finally {
    await scraperService.cleanup();
    logger.info('Scraper service cleaned up');
    process.exit(0);
  }
}

testScraperIntegration(); 