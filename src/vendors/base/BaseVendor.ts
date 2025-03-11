import { VendorIntegration, Component, ComponentPrice, StockInfo, SearchOptions, VendorError } from '../types';

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  async waitForToken(): Promise<void> {
    this.refillTokens();
    if (this.tokens <= 0) {
      const waitTime = (1 / this.refillRate) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.refillTokens();
    }
    this.tokens--;
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const newTokens = Math.floor(timePassed * this.refillRate);
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }
}

export abstract class BaseVendor implements VendorIntegration {
  protected rateLimiter: RateLimiter;
  protected retryDelays = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff

  constructor(
    public readonly name: string,
    public readonly baseUrl: string,
    maxRequestsPerSecond: number
  ) {
    this.rateLimiter = new RateLimiter(maxRequestsPerSecond, maxRequestsPerSecond);
  }

  abstract search(query: string, options?: SearchOptions): Promise<Component[]>;
  abstract getPrice(partNumber: string): Promise<ComponentPrice>;
  abstract checkStock(partNumber: string): Promise<StockInfo>;
  abstract getDetails(partNumber: string): Promise<Component>;

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.rateLimiter.waitForToken();
        return await operation();
      } catch (error) {
        if (attempt === retries || !(error as VendorError).retryable) {
          throw error;
        }
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelays[attempt])
        );
      }
    }
    throw new Error('Should not reach here');
  }

  protected createError(
    message: string,
    type: VendorError['type'],
    retryable = true,
    vendorSpecific?: any
  ): VendorError {
    const error = new Error(message) as VendorError;
    error.type = type;
    error.retryable = retryable;
    error.vendorSpecific = vendorSpecific;
    return error;
  }
} 