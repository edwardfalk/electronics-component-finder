import { Browser, Page } from 'puppeteer';

export interface BrowserManagerOptions {
  timeout?: number;
  headless?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
}

export interface ElementHandle {
  click(): Promise<void>;
  getText(): Promise<string>;
  getAttribute(name: string): Promise<string | null>;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private options: BrowserManagerOptions;

  constructor(options: BrowserManagerOptions = {}) {
    this.options = {
      timeout: 30000,
      headless: true,
      viewport: { width: 1280, height: 720 },
      ...options
    };
  }

  async initialize(): Promise<void> {
    const puppeteer = await import('puppeteer');
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    if (this.options.viewport) {
      await this.page.setViewport(this.options.viewport);
    }
    
    if (this.options.userAgent) {
      await this.page.setUserAgent(this.options.userAgent);
    }
  }

  async navigate(url: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: this.options.timeout
    });
  }

  async waitForSelector(selector: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.waitForSelector(selector, {
      timeout: this.options.timeout
    });
  }

  async $(selector: string): Promise<ElementHandle | null> {
    if (!this.page) throw new Error('Browser not initialized');
    const element = await this.page.$(selector);
    if (!element) return null;
    
    return {
      click: () => element.click(),
      getText: () => element.evaluate(el => el.textContent || ''),
      getAttribute: (name: string) => element.evaluate((el, attr) => el.getAttribute(attr), name)
    };
  }

  async $$(selector: string): Promise<ElementHandle[]> {
    if (!this.page) throw new Error('Browser not initialized');
    const elements = await this.page.$$(selector);
    return elements.map(element => ({
      click: () => element.click(),
      getText: () => element.evaluate(el => el.textContent || ''),
      getAttribute: (name: string) => element.evaluate((el, attr) => el.getAttribute(attr), name)
    }));
  }

  async evaluateScript<T>(script: string): Promise<T> {
    if (!this.page) throw new Error('Browser not initialized');
    return this.page.evaluate(script) as Promise<T>;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
} 