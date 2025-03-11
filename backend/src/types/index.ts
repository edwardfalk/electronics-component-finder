import { Request, Response } from 'express';

export interface Component {
  id: string;
  name: string;
  description: string;
  category: string;
  shop: string;
  price: number;
  currency: string;
  inStock: boolean;
  url: string;
  imageUrl?: string;
  datasheet?: string;
  manufacturer?: string;
  manufacturerPartNumber?: string;
  lastUpdated: Date;
}

export interface ComponentFilters {
  category?: string;
  shop?: string;
  inStock?: boolean;
}

export interface PartsList {
  id: string;
  name: string;
  description?: string;
  components: Array<{
    componentId: string;
    quantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Datasheet {
  id: string;
  componentId: string;
  url: string;
  filename: string;
  uploadedAt: Date;
}

export interface ErrorResponse {
  error: string;
}

export type ApiResponse<T> = T | ErrorResponse;

export type AsyncRequestHandler<P = {}, ResBody = any, ReqBody = any, ReqQuery = any> = 
  (req: Request<P, ApiResponse<ResBody>, ReqBody, ReqQuery>, res: Response<ApiResponse<ResBody>>) => Promise<void>; 