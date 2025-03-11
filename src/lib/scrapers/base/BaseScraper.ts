import { Browser, Page, LaunchOptions } from 'puppeteer';
import * as puppeteer from 'puppeteer';

export interface ScraperOptions {
  timeout?: number;
  headless?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
}

export class BaseScraper {
  protected browser: Browser | null = null;
  protected page: Page | null = null;
  protected initialized = false;
  protected options: Required<ScraperOptions>;

  constructor(options?: ScraperOptions) {
    this.options = {
      timeout: options?.timeout || 30000,
      headless: options?.headless ?? true,
      viewport: options?.viewport || { width: 1920, height: 1080 },
      userAgent: options?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      proxy: options?.proxy || {
        server: '',
        username: undefined,
        password: undefined
      }
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      if (!this.browser) {
        const launchOptions: LaunchOptions = {
          headless: this.options.headless,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        };

        if (this.options.proxy.server) {
          launchOptions.args?.push(`--proxy-server=${this.options.proxy.server}`);
        }

        this.browser = await puppeteer.launch(launchOptions);
        this.page = await this.browser.newPage();

        if (this.page) {
          await this.page.setDefaultNavigationTimeout(this.options.timeout);

          if (this.options.viewport) {
            await this.page.setViewport(this.options.viewport);
          }

          if (this.options.userAgent) {
            await this.page.setUserAgent(this.options.userAgent);
          }

          if (this.options.proxy.username && this.options.proxy.password) {
            await this.page.authenticate({
              username: this.options.proxy.username,
              password: this.options.proxy.password
            });
          }
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing browser:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.initialized = false;
    }
  }

  protected async navigateToPage(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    await this.page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: this.options.timeout
    });
  }

  protected async waitForSelector(selector: string, timeout?: number): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    await this.page.waitForSelector(selector, {
      timeout: timeout || this.options.timeout
    });
  }

  protected async getPageContent(): Promise<string> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    return await this.page.content();
  }

  protected async takeScreenshot(isError = false): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const prefix = isError ? 'error' : 'screenshot';
    await this.page.screenshot({
      path: `${prefix}-${timestamp}.png`,
      fullPage: true
    });
  }

  protected createError(message: string, type: 'PARSING' | 'NETWORK' | 'OTHER', retryable: boolean, originalError?: Error): Error {
    const error = new Error(message);
    (error as any).type = type;
    (error as any).retryable = retryable;
    (error as any).originalError = originalError;
    return error;
  }

  protected async extractText(selector: string): Promise<string | null> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const element = await this.page.$(selector);
    if (!element) {
      return null;
    }

    return await this.page.evaluate(el => el.textContent?.trim() || null, element);
  }

  protected async extractAttribute(selector: string, attribute: string): Promise<string | null> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const element = await this.page.$(selector);
    if (!element) {
      return null;
    }

    return await this.page.evaluate(
      (el, attr) => el.getAttribute(attr),
      element,
      attribute
    );
  }
} 