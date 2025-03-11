export interface Component {
  id: string
  name: string
  manufacturer: string
  partNumber: string
  description: string
  category: string
  shops: Shop[]
  datasheetId?: string
}

export interface Shop {
  name: string
  url: string
  price: number
  currency: string
  stock: number
  lastUpdated: string
}

export interface ComponentFilters {
  category?: string
  shop?: string
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
}

export interface PartsList {
  id: string
  name: string
  components: {
    component: Component
    quantity: number
  }[]
  createdAt: string
  updatedAt: string
}

export interface Datasheet {
  id: string
  componentName: string
  manufacturer: string
  partNumber: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  url: string
} 