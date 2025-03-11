import { Component, ComponentPrice, SearchOptions, StockInfo } from '../../types';

export abstract class BaseVendor {
  protected name: string;
  protected baseUrl: string;
  protected requestsPerSecond: number;
  private lastRequestTime: number = 0;

  constructor(name: string, baseUrl: string, requestsPerSecond: number = 1) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.requestsPerSecond = requestsPerSecond;
  }

  abstract search(query: string, options?: SearchOptions): Promise<Component[]>;
  abstract getPrice(partNumber: string): Promise<ComponentPrice>;
  abstract checkStock(partNumber: string): Promise<StockInfo>;
  abstract getDetails(partNumber: string): Promise<Component>;

  protected async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.throttleRequest();
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry if the error is marked as not retryable
        if (error.retryable === false) {
          throw error;
        }

        // Wait before retrying, with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Operation failed after maximum retries');
  }

  protected async throttleRequest(): Promise<void> {
    const now = Date.now();
    const minTimeBetweenRequests = 1000 / this.requestsPerSecond;
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < minTimeBetweenRequests) {
      await new Promise(resolve => 
        setTimeout(resolve, minTimeBetweenRequests - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
  }

  protected createError(message: string, type: 'PARSING' | 'NETWORK' | 'OTHER', retryable: boolean, originalError?: Error): Error {
    const error = new Error(message);
    (error as any).type = type;
    (error as any).retryable = retryable;
    (error as any).originalError = originalError;
    return error;
  }
} 