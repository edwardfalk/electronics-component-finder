# Component Finder - Project Plan

## Project Overview

Component Finder is a web application designed to help electronics hobbyists and professionals find and compare electronic components across multiple online shops. The application will focus on:

1. Searching for components across multiple electronics retailers
2. Comparing prices and availability
3. Finding alternative components when items are out of stock
4. Optimizing shopping carts for the best combination of price and availability
5. Storing and accessing component datasheets

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Web Interface  │◄────┤  Backend API    │◄────┤  Shop APIs      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │                 │
                        │  Cache Database │
                        │                 │
                        └─────────────────┘
```

### Core Components

#### Backend API
- Node.js with Express
- Handles requests from the frontend
- Communicates with shop APIs
- Manages the cache database

#### Web Interface
- Simple HTML/CSS/JavaScript frontend
- Responsive design for desktop and mobile
- Interactive component search and comparison

#### Cache Database
- SQLite for simplicity and low resource usage
- Stores component data with timestamps
- Caches search results for 24 hours

#### Shop API Integration
- Connects to electronics retailer APIs
- Falls back to web scraping when APIs aren't available
- Normalizes data from different sources

## Features

### Phase 1: Core Functionality

1. **Component Search**
   - Search by part number, name, or description
   - Filter by component type, manufacturer, etc.
   - Display results from multiple shops

2. **Price Comparison**
   - Compare prices across different retailers
   - Show stock availability
   - Display shipping costs when available

3. **Caching System**
   - Store search results for 24 hours
   - Display timestamps for cached data
   - Background refresh for outdated data

### Phase 2: Enhanced Features

4. **Parts List Management**
   - Create and save lists of components
   - Add notes and quantities
   - Share lists (optional)

5. **Shopping Cart Optimization**
   - Find the best combination of shops for a parts list
   - Consider price, availability, and shipping costs
   - Generate optimized shopping strategies

6. **Datasheet Storage**
   - Store and serve component datasheets
   - Organize by manufacturer and part number
   - Provide datasheet viewer in the application

### Phase 3: AI Integration

7. **External AI Links**
   - Generate links to free AI services with pre-filled prompts
   - Get information about components and alternatives
   - No additional server processing required

8. **Alternative Component Suggestions**
   - Find similar components when items are out of stock
   - Compare specifications and compatibility
   - Rate alternatives by similarity

## Technical Implementation

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: SQLite
- **Language**: TypeScript

### Frontend Stack
- **HTML/CSS/JavaScript**
- **No heavy frameworks** to keep it lightweight
- **Responsive design** for all devices

### Deployment
- **Server**: Linode Nanode 1GB
- **OS**: Ubuntu LTS
- **Web Server**: Nginx as reverse proxy
- **Process Manager**: PM2

### Directory Structure
```
component-finder/
├── src/                      # Backend source code
│   ├── routes/               # API routes
│   ├── models/               # Database models
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic
│   └── index.ts              # Main application file
├── public/                   # Frontend assets
│   ├── js/                   # Frontend JavaScript
│   ├── css/                  # Stylesheets
│   ├── datasheets/           # Stored datasheets
│   └── index.html            # Main HTML page
├── .env                      # Environment variables (API keys, etc.)
├── .gitignore                # Git ignore file
├── package.json              # Node.js package configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## Shop Integration

### Swedish/European Shops to Include
- Elfa Distrelec
- Electrokit
- Kjell & Company
- Conrad Electronic
- Mouser Europe
- Farnell/Element14 (European division)
- RS Components (Nordic)

### Integration Methods
1. **Official APIs** (preferred)
   - Use official APIs when available
   - Register for API access where required
   - Store API keys securely

2. **Web Scraping** (fallback)
   - Use only when APIs are not available
   - Implement respectful scraping with delays
   - Follow robots.txt guidelines

## Caching Strategy

- **Cache Duration**: 24 hours by default
- **Cache Structure**:
  - Component data (specifications, prices, stock)
  - Search results (including alternatives)
  - Shop availability information
- **Timestamp Display**:
  - Clearly show when each price/stock data point was last updated
  - Visual indicators for fresh vs. older data
- **Non-Destructive Updates**:
  - Keep historical data when updating
  - Store multiple timestamps for price changes

## Datasheet Storage

- **Storage Method**: File system storage
- **Organization**: By manufacturer and part number
- **Acquisition**: Automatic download from manufacturer sites when available
- **User Interface**: PDF viewer integrated into the application

## Resource Considerations for Nanode 1GB

- **CPU Usage**: Lightweight backend with efficient caching
- **Memory Usage**: Minimal with SQLite and no heavy frameworks
- **Storage**: 25GB is sufficient for thousands of datasheets
- **Bandwidth**: Efficient with caching to minimize API calls

## Implementation Phases

### Phase 1: Basic Infrastructure (1-2 weeks)
- Set up Linode server
- Create basic application structure
- Implement database schema
- Build simple frontend

### Phase 2: Core Functionality (2-3 weeks)
- Integrate with 2-3 initial shop APIs
- Implement caching system
- Create basic search and comparison features

### Phase 3: Enhanced Features (3-4 weeks)
- Add parts list functionality
- Implement shopping cart optimization
- Add datasheet storage and viewing

### Phase 4: AI Integration and Refinement (2-3 weeks)
- Add external AI service links
- Implement alternative component suggestions
- Refine UI and performance

## Future Expansion Ideas

- User accounts for saving preferences and parts lists
- Price history tracking and alerts
- Community features for sharing parts lists and reviews
- Mobile app version
- Integration with PCB design software
