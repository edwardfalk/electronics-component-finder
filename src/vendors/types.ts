export interface ComponentPrice {
  price: number;
  currency: string;
  breakPoints?: Array<{
    quantity: number;
    price: number;
  }>;
}

export interface ComponentSpecs {
  [key: string]: string | number | boolean;
}

export interface Component {
  id?: string;
  partNumber: string;
  name: string;
  description?: string;
  category: string;
  vendor?: string;
  price?: number;
  currency?: string;
  inStock?: boolean;
  url?: string;
  imageUrl?: string;
  datasheet?: string;
  manufacturer?: string;
  specifications?: Record<string, any>;
  lastUpdated?: string;
  createdAt?: string;
}

export interface StockInfo {
  inStock: boolean;
  quantity?: number;
  deliveryDays?: number;
}

export interface SearchOptions {
  limit?: number;
  category?: string;
  inStock?: boolean;
  vendor?: string;
}

export interface VendorError extends Error {
  type: 'API' | 'NETWORK' | 'PARSING' | 'RATE_LIMIT' | 'OTHER';
  retryable: boolean;
  vendorSpecific?: any;
}

export interface VendorIntegration {
  readonly name: string;
  readonly baseUrl: string;
  
  search(query: string, options?: SearchOptions): Promise<Component[]>;
  getPrice(partNumber: string): Promise<ComponentPrice>;
  checkStock(partNumber: string): Promise<StockInfo>;
  getDetails(partNumber: string): Promise<Component>;
} 