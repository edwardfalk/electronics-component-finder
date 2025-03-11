import { BrowserManager, BrowserManagerOptions } from './BrowserManager';
import { VendorError } from '../../types.js';

export interface ScraperOptions extends BrowserManagerOptions {
  retries?: number;
}

export abstract class BaseScraper {
  protected browserManager: BrowserManager;
  protected options: ScraperOptions;
  protected logger: Console;

  constructor(options: ScraperOptions = {}) {
    this.options = {
      timeout: 30000,
      headless: true,
      retries: 3,
      ...options
    };
    this.browserManager = new BrowserManager(options);
    this.logger = console;
  }

  async initialize(): Promise<void> {
    await this.browserManager.initialize();
  }

  async close(): Promise<void> {
    await this.browserManager.close();
  }

  protected createError(
    message: string,
    type: 'PARSING' | 'NETWORK' | 'TIMEOUT' | 'UNKNOWN',
    shouldRetry: boolean,
    originalError?: Error
  ): Error {
    const error = new Error(message);
    (error as any).type = type;
    (error as any).shouldRetry = shouldRetry;
    (error as any).originalError = originalError;
    return error;
  }

  protected async takeScreenshot(isError: boolean = false): Promise<void> {
    // Implementation for taking screenshots during scraping
    // This would be useful for debugging
  }

  protected async navigateToPage(url: string): Promise<void> {
    try {
      await this.browserManager.navigate(url);
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to navigate to page: ${typedError.message}`);
      throw typedError;
    }
  }

  protected async extractText(selector: string): Promise<string | null> {
    try {
      const content = await this.browserManager.evaluateScript<string | null>(`
        const element = document.querySelector('${selector}');
        return element ? element.textContent : null;
      `);
      return content;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to extract text from ${selector}: ${typedError.message}`);
      throw typedError;
    }
  }

  protected async extractAttribute(selector: string, attribute: string): Promise<string | null> {
    try {
      const value = await this.browserManager.evaluateScript<string | null>(`
        const element = document.querySelector('${selector}');
        return element ? element.getAttribute('${attribute}') : null;
      `);
      return value;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to extract attribute ${attribute} from ${selector}: ${typedError.message}`);
      throw typedError;
    }
  }

  protected async waitForSelector(selector: string): Promise<void> {
    try {
      await this.browserManager.waitForSelector(selector);
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to wait for selector: ${typedError.message}`);
      throw typedError;
    }
  }

  protected async click(selector: string): Promise<void> {
    try {
      const element = await this.browserManager.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      await element.click();
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to click element: ${typedError.message}`);
      throw typedError;
    }
  }

  protected async type(selector: string, text: string): Promise<void> {
    try {
      const element = await this.browserManager.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      await this.browserManager.evaluateScript(`
        const element = document.querySelector('${selector}');
        if (element) {
          element.value = '${text}';
          element.dispatchEvent(new Event('input'));
          element.dispatchEvent(new Event('change'));
        }
      `);
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to type text: ${typedError.message}`);
      throw typedError;
    }
  }

  protected async getPageContent(): Promise<string> {
    try {
      const content = await this.browserManager.evaluateScript<string>(`
        document.documentElement.outerHTML
      `);
      return content;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to get page content: ${typedError.message}`);
      throw typedError;
    }
  }
} 