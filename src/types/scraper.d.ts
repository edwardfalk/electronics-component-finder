declare module 'electronic-components-finder' {
  export interface ProductData {
    name: string;
    sku: string;
    price: string;
    stock: string;
    url: string;
    specifications?: Record<string, string>;
    variations?: Array<{
      attributes: Record<string, string>;
      price: string;
      stock: string;
    }>;
  }

  export interface CategoryData {
    name: string;
    url: string;
    products?: ProductData[];
    subcategories?: CategoryData[];
  }

  export interface SearchResult {
    totalResults: number;
    products: ProductData[];
    pagination: {
      currentPage: number;
      totalPages: number;
    };
  }

  export interface ScraperOptions {
    baseUrl: string;
    timeout?: number;
    retryOptions?: {
      maxRetries: number;
      initialDelay: number;
      maxDelay: number;
    };
  }

  export interface BaseScraper {
    initialize(): Promise<void>;
    searchProducts(query: string): Promise<SearchResult>;
    getCategories(): Promise<CategoryData[]>;
    scrapeProductDetails(url: string): Promise<ProductData>;
    cleanup(): Promise<void>;
  }

  export class ElektrokitScraper implements BaseScraper {
    constructor(options?: ScraperOptions);
    initialize(): Promise<void>;
    searchProducts(query: string): Promise<SearchResult>;
    getCategories(): Promise<CategoryData[]>;
    scrapeProductDetails(url: string): Promise<ProductData>;
    cleanup(): Promise<void>;
  }
} 