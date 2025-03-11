# API Documentation

## Overview

The Electronic Components Finder API provides endpoints for managing electronic components, vendors, prices, and shopping lists. This RESTful API uses JSON for request and response bodies.

## Base URL

```
Production: https://api.components-finder.com
Development: http://localhost:3000
```

## Authentication

API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Components

#### List Components
```http
GET /api/v1/components
```

Query Parameters:
- `page` (integer): Page number for pagination
- `limit` (integer): Items per page (default: 20)
- `category` (string): Filter by category
- `manufacturer` (string): Filter by manufacturer
- `search` (string): Search in name and description

Response:
```json
{
  "data": [
    {
      "id": 1,
      "part_number": "RC0805FR-07100KL",
      "name": "100kΩ Resistor",
      "description": "0805 SMD Resistor",
      "manufacturer": "YAGEO",
      "category": "resistor",
      "specifications": {
        "resistance": "100000",
        "tolerance": "1%",
        "power_rating": "0.125W",
        "package": "0805"
      }
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Component
```http
GET /api/v1/components/:id
```

Response:
```json
{
  "data": {
    "id": 1,
    "part_number": "RC0805FR-07100KL",
    "name": "100kΩ Resistor",
    "description": "0805 SMD Resistor",
    "manufacturer": "YAGEO",
    "category": "resistor",
    "specifications": {
      "resistance": "100000",
      "tolerance": "1%",
      "power_rating": "0.125W",
      "package": "0805"
    },
    "prices": [
      {
        "vendor_id": 1,
        "price": 0.10,
        "currency": "USD",
        "stock_quantity": 1000,
        "delivery_time_days": 3
      }
    ]
  }
}
```

#### Create Component
```http
POST /api/v1/components
```

Request Body:
```json
{
  "part_number": "RC0805FR-07100KL",
  "name": "100kΩ Resistor",
  "description": "0805 SMD Resistor",
  "manufacturer": "YAGEO",
  "category": "resistor",
  "specifications": {
    "resistance": "100000",
    "tolerance": "1%",
    "power_rating": "0.125W",
    "package": "0805"
  }
}
```

#### Update Component
```http
PUT /api/v1/components/:id
```

Request Body: Same as CREATE

#### Delete Component
```http
DELETE /api/v1/components/:id
```

### Vendors

#### List Vendors
```http
GET /api/v1/vendors
```

Query Parameters:
- `page` (integer): Page number
- `limit` (integer): Items per page
- `country` (string): Filter by country code

Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Farnell",
      "url": "https://farnell.com",
      "api_endpoint": "https://api.farnell.com/v1",
      "country_code": "GB",
      "shipping_to_sweden": true
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Vendor
```http
GET /api/v1/vendors/:id
```

#### Create Vendor
```http
POST /api/v1/vendors
```

Request Body:
```json
{
  "name": "Farnell",
  "url": "https://farnell.com",
  "api_endpoint": "https://api.farnell.com/v1",
  "country_code": "GB",
  "shipping_to_sweden": true
}
```

### Prices

#### Get Component Prices
```http
GET /api/v1/components/:id/prices
```

Response:
```json
{
  "data": [
    {
      "vendor_id": 1,
      "vendor_name": "Farnell",
      "price": 0.10,
      "currency": "USD",
      "stock_quantity": 1000,
      "delivery_time_days": 3,
      "last_updated": "2024-03-10T12:00:00Z"
    }
  ]
}
```

#### Update Price
```http
PUT /api/v1/components/:id/prices/:vendor_id
```

Request Body:
```json
{
  "price": 0.10,
  "currency": "USD",
  "stock_quantity": 1000,
  "delivery_time_days": 3
}
```

### Shopping Lists

#### List Shopping Lists
```http
GET /api/v1/shopping-lists
```

Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Project X Components",
      "description": "Components for Project X",
      "items_count": 5,
      "created_at": "2024-03-10T12:00:00Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Shopping List
```http
GET /api/v1/shopping-lists/:id
```

Response:
```json
{
  "data": {
    "id": 1,
    "name": "Project X Components",
    "description": "Components for Project X",
    "items": [
      {
        "component_id": 1,
        "part_number": "RC0805FR-07100KL",
        "name": "100kΩ Resistor",
        "quantity": 10,
        "best_price": {
          "vendor_id": 1,
          "vendor_name": "Farnell",
          "price": 0.10,
          "currency": "USD",
          "stock_quantity": 1000
        }
      }
    ]
  }
}
```

#### Create Shopping List
```http
POST /api/v1/shopping-lists
```

Request Body:
```json
{
  "name": "Project X Components",
  "description": "Components for Project X"
}
```

#### Add Item to Shopping List
```http
POST /api/v1/shopping-lists/:id/items
```

Request Body:
```json
{
  "component_id": 1,
  "quantity": 10
}
```

#### Update Shopping List Item
```http
PUT /api/v1/shopping-lists/:id/items/:item_id
```

Request Body:
```json
{
  "quantity": 15
}
```

#### Remove Item from Shopping List
```http
DELETE /api/v1/shopping-lists/:id/items/:item_id
```

### Search

#### Search Components
```http
GET /api/v1/search/components
```

Query Parameters:
- `q` (string): Search query
- `category` (string): Filter by category
- `manufacturer` (string): Filter by manufacturer
- `min_price` (number): Minimum price
- `max_price` (number): Maximum price
- `in_stock` (boolean): Only show in-stock items
- `page` (integer): Page number
- `limit` (integer): Items per page

Response:
```json
{
  "data": [
    {
      "id": 1,
      "part_number": "RC0805FR-07100KL",
      "name": "100kΩ Resistor",
      "manufacturer": "YAGEO",
      "category": "resistor",
      "best_price": {
        "vendor_id": 1,
        "vendor_name": "Farnell",
        "price": 0.10,
        "currency": "USD",
        "stock_quantity": 1000
      }
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

## Error Handling

The API uses standard HTTP status codes and returns error details in JSON format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

Common Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Server Error

## Rate Limiting

The API implements rate limiting:
- 1000 requests per hour per IP
- 100 requests per minute per IP

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1583859600
```

## Pagination

All list endpoints support pagination using:
- `page`: Page number (1-based)
- `limit`: Items per page (default: 20, max: 100)

Response includes metadata:
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "total_pages": 5
  }
}
```

## Filtering

Many endpoints support filtering using query parameters:
- Exact match: `?field=value`
- Multiple values: `?field=value1,value2`
- Range: `?field_min=value1&field_max=value2`
- Search: `?search=term`

## Sorting

Add `sort` parameter to sort results:
- Ascending: `?sort=field`
- Descending: `?sort=-field`
- Multiple fields: `?sort=field1,-field2`

## Caching

The API implements HTTP caching:
- ETag headers for resource versioning
- Cache-Control headers for cache duration
- 304 Not Modified responses when appropriate

## Versioning

The API is versioned in the URL path:
- Current version: `/api/v1/`
- Future versions: `/api/v2/`

## WebSocket API

Real-time updates are available via WebSocket:

```javascript
const ws = new WebSocket('wss://api.components-finder.com/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle updates
};
```

Events:
- `price_update`: Price changes
- `stock_update`: Stock level changes
- `component_update`: Component information updates 