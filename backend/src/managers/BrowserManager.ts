import puppeteer, { Browser, Page } from 'puppeteer';

export class BrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 }
    });
    this.page = await this.browser.newPage();
  }

  async navigate(url: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.goto(url);
  }

  async waitForSelector(selector: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.waitForSelector(selector);
  }

  async evaluateScript<T>(script: string): Promise<T> {
    if (!this.page) throw new Error('Browser not initialized');
    return await this.page.evaluate(script) as T;
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
} 