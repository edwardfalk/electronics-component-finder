# API Documentation

## Types

### Component

```typescript
interface Component {
  id: string;
  name: string;
  manufacturer: string;
  partNumber: string;
  description: string;
  category: string;
  shops: Shop[];
  datasheetId?: string;
}

interface Shop {
  name: string;
  url: string;
  price: number;
  currency: string;
  stock: number;
  lastUpdated: string;
}
```

### Parts List

```typescript
interface PartsList {
  id: string;
  name: string;
  components: {
    component: Component;
    quantity: number;
  }[];
  createdAt: string;
  updatedAt: string;
}
```

### Datasheet

```typescript
interface Datasheet {
  id: string;
  componentName: string;
  manufacturer: string;
  partNumber: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
}
```

## Endpoints

### Components

#### Search Components
- **URL**: `/api/components`
- **Method**: `GET`
- **Query Parameters**:
  ```typescript
  {
    searchTerm: string;
    category?: string;
    shop?: string;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }
  ```
- **Response**: `Component[]`

#### Get Component
- **URL**: `/api/components/:id`
- **Method**: `GET`
- **Response**: `Component`

#### Get Categories
- **URL**: `/api/components/categories`
- **Method**: `GET`
- **Response**: `string[]`

#### Get Shops
- **URL**: `/api/components/shops`
- **Method**: `GET`
- **Response**: `string[]`

### Parts Lists

#### Get All Lists
- **URL**: `/api/parts-lists`
- **Method**: `GET`
- **Response**: `PartsList[]`

#### Get List
- **URL**: `/api/parts-lists/:id`
- **Method**: `GET`
- **Response**: `PartsList`

#### Create List
- **URL**: `/api/parts-lists`
- **Method**: `POST`
- **Body**:
  ```typescript
  {
    name: string;
  }
  ```
- **Response**: `PartsList`

#### Update List
- **URL**: `/api/parts-lists/:id`
- **Method**: `PUT`
- **Body**:
  ```typescript
  {
    name: string;
  }
  ```
- **Response**: `PartsList`

#### Delete List
- **URL**: `/api/parts-lists/:id`
- **Method**: `DELETE`
- **Response**: `void`

#### Add Component to List
- **URL**: `/api/components/:componentId/lists/:listId`
- **Method**: `POST`
- **Body**:
  ```typescript
  {
    quantity: number;
  }
  ```
- **Response**: `void`

#### Remove Component from List
- **URL**: `/api/components/:componentId/lists/:listId`
- **Method**: `DELETE`
- **Response**: `void`

### Datasheets

#### Search Datasheets
- **URL**: `/api/datasheets`
- **Method**: `GET`
- **Query Parameters**:
  ```typescript
  {
    searchTerm: string;
  }
  ```
- **Response**: `Datasheet[]`

#### Get Datasheet
- **URL**: `/api/datasheets/:id`
- **Method**: `GET`
- **Response**: `Datasheet`

#### Download Datasheet
- **URL**: `/api/datasheets/:id/download`
- **Method**: `GET`
- **Response**:
  ```typescript
  {
    url: string;
  }
  ```

#### Upload Datasheet
- **URL**: `/api/datasheets`
- **Method**: `POST`
- **Body**: `multipart/form-data`
  ```typescript
  {
    file: File;
    metadata: {
      componentName: string;
      manufacturer: string;
      partNumber: string;
    };
  }
  ```
- **Response**: `Datasheet`

## Error Handling

All endpoints may return an error response in the following format:

```typescript
interface ApiError {
  message: string;
  code: string;
  status: number;
}
```

Common error codes:
- `400` - Bad Request (invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error 