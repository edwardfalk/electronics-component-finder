export interface Component {
  partNumber: string;
  name: string;
  description?: string;
  category: string;
  manufacturer?: string;
  specifications: Record<string, string | number | boolean>;
  datasheet?: string;
  imageUrl?: string;
  url: string;
  price: number;
  currency: string;
  inStock: boolean;
}

export interface ComponentPrice {
  price: number;
  currency: string;
  quantity?: number;
  inStock?: boolean;
  stockQuantity?: number;
  deliveryDays?: number;
  breakPoints?: Array<{
    quantity: number;
    price: number;
  }>;
  lastUpdated?: Date;
}

export interface StockInfo {
  inStock: boolean;
  quantity?: number;
  deliveryDays?: number;
  lastChecked?: Date;
}

export interface SearchOptions {
  limit?: number;
  category?: string;
  manufacturer?: string;
  inStock?: boolean;
  maxPrice?: number;
  minPrice?: number;
  sortBy?: 'price' | 'name' | 'manufacturer' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface PartsList {
  id: string;
  name: string;
  description?: string;
  items: Array<{
    component: Component;
    quantity: number;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Datasheet {
  id: string;
  title: string;
  manufacturer: string;
  partNumbers: string[];
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  description?: string;
  language?: string;
  version?: string;
  metadata?: Record<string, string>;
}

export interface SearchParams {
  searchTerm: string
  category?: string
  shop?: string
  inStock?: string
}

export interface ApiError {
  message: string
  code: string
  status: number
} 