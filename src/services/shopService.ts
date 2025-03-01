import axios from 'axios';
import dotenv from 'dotenv';
import { getDatabase } from '../models/database';

dotenv.config();

// Types
interface ShopConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  searchEndpoint: string;
}

interface ComponentResult {
  name: string;
  description?: string;
  manufacturer?: string;
  category?: string;
  price?: number;
  currency?: string;
  inStock?: boolean;
  stockQuantity?: number;
  url?: string;
  imageUrl?: string;
}

// Shop configurations
const shops: Record<string, ShopConfig> = {
  elfa: {
    name: 'Elfa Distrelec',
    baseUrl: 'https://api.elfa.se',
    apiKey: process.env.ELFA_API_KEY,
    searchEndpoint: '/api/v1/search'
  },
  electrokit: {
    name: 'Electrokit',
    baseUrl: 'https://api.electrokit.com',
    apiKey: process.env.ELECTROKIT_API_KEY,
    searchEndpoint: '/api/search'
  },
  mouser: {
    name: 'Mouser',
    baseUrl: 'https://api.mouser.com',
    apiKey: process.env.MOUSER_API_KEY,
    searchEndpoint: '/api/v1/search'
  },
  farnell: {
    name: 'Farnell',
    baseUrl: 'https://api.element14.com',
    apiKey: process.env.FARNELL_API_KEY,
    searchEndpoint: '/api/v1/search'
  },
  rs: {
    name: 'RS Components',
    baseUrl: 'https://api.rs-online.com',
    apiKey: process.env.RS_COMPONENTS_API_KEY,
    searchEndpoint: '/api/v1/search'
  }
};

/**
 * Search for components across all configured shops
 * @param query Search query
 * @param category Optional category filter
 * @param shopFilter Optional shop filter
 * @param inStockOnly Only show in-stock items
 */
export async function searchComponents(
  query: string,
  category?: string,
  shopFilter?: string,
  inStockOnly: boolean = false
): Promise<ComponentResult[]> {
  // Filter shops if a specific shop is requested
  const shopsToSearch = shopFilter
    ? Object.values(shops).filter(shop => 
        shop.name.toLowerCase().includes(shopFilter.toLowerCase()))
    : Object.values(shops);
  
  if (shopsToSearch.length === 0) {
    throw new Error('No matching shops found');
  }
  
  // Check cache first
  const cachedResults = await getCachedResults(query, category, shopFilter, inStockOnly);
  if (cachedResults.length > 0) {
    console.log(`Using cached results for "${query}"`);
    return cachedResults;
  }
  
  // Search each shop in parallel
  const searchPromises = shopsToSearch.map(shop => searchShop(shop, query, category, inStockOnly));
  
  // Wait for all searches to complete
  const results = await Promise.allSettled(searchPromises);
  
  // Combine results
  const components: ComponentResult[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      components.push(...result.value);
    } else {
      console.error(`Error searching ${shopsToSearch[index].name}:`, result.reason);
    }
  });
  
  // Cache results
  await cacheResults(query, components, category, shopFilter, inStockOnly);
  
  return components;
}

/**
 * Search a specific shop for components
 * This is a placeholder implementation that would be replaced with actual API calls
 */
async function searchShop(
  shop: ShopConfig,
  query: string,
  category?: string,
  inStockOnly: boolean = false
): Promise<ComponentResult[]> {
  // This is where we would implement the actual API call to each shop
  // For now, we'll return mock data
  
  // In a real implementation, we would do something like:
  /*
  try {
    const response = await axios.get(`${shop.baseUrl}${shop.searchEndpoint}`, {
      params: {
        q: query,
        category: category,
        in_stock: inStockOnly ? 1 : 0
      },
      headers: shop.apiKey ? { 'Authorization': `Bearer ${shop.apiKey}` } : {}
    });
    
    return response.data.results.map(item => ({
      name: item.name,
      description: item.description,
      manufacturer: item.manufacturer,
      category: item.category,
      price: item.price,
      currency: item.currency,
      inStock: item.in_stock,
      stockQuantity: item.stock_quantity,
      url: item.url,
      imageUrl: item.image_url
    }));
  } catch (error) {
    console.error(`Error searching ${shop.name}:`, error);
    return [];
  }
  */
  
  // Mock implementation for demonstration
  return getMockResults(shop.name, query, category, inStockOnly);
}

/**
 * Get cached results from the database
 */
async function getCachedResults(
  query: string,
  category?: string,
  shopFilter?: string,
  inStockOnly: boolean = false
): Promise<ComponentResult[]> {
  // In a real implementation, we would check the database for cached results
  // For now, we'll return an empty array
  return [];
}

/**
 * Cache search results in the database
 */
async function cacheResults(
  query: string,
  results: ComponentResult[],
  category?: string,
  shopFilter?: string,
  inStockOnly: boolean = false
): Promise<void> {
  // In a real implementation, we would store the results in the database
  // For now, we'll just log that we would cache the results
  console.log(`Would cache ${results.length} results for "${query}"`);
}

/**
 * Generate mock results for demonstration
 */
function getMockResults(
  shopName: string,
  query: string,
  category?: string,
  inStockOnly: boolean = false
): ComponentResult[] {
  // This is just for demonstration purposes
  const mockComponents: ComponentResult[] = [];
  
  // Only return results if the query matches some predefined components
  if (query.toLowerCase().includes('resistor')) {
    mockComponents.push({
      name: '10k Resistor',
      description: '10k Ohm resistor, 1/4W, 5% tolerance, through-hole',
      manufacturer: 'Yageo',
      category: 'resistor',
      price: shopName.includes('Electrokit') ? 0.90 : 1.20,
      currency: 'SEK',
      inStock: true,
      stockQuantity: 1000,
      url: `https://www.${shopName.toLowerCase().replace(' ', '')}.com/product/10k-resistor`
    });
  }
  
  if (query.toLowerCase().includes('transistor') || query.toLowerCase().includes('2n2222')) {
    mockComponents.push({
      name: '2N2222A',
      description: 'NPN general purpose transistor, 40V, 800mA',
      manufacturer: 'ON Semiconductor',
      category: 'transistor',
      price: shopName.includes('Elfa') ? 3.20 : 2.95,
      currency: 'SEK',
      inStock: true,
      stockQuantity: 500,
      url: `https://www.${shopName.toLowerCase().replace(' ', '')}.com/product/2n2222a`
    });
  }
  
  if (query.toLowerCase().includes('regulator') || query.toLowerCase().includes('lm317')) {
    mockComponents.push({
      name: 'LM317T',
      description: 'Adjustable voltage regulator, 1.2V to 37V output, 1.5A',
      manufacturer: 'Texas Instruments',
      category: 'ic',
      price: shopName.includes('Mouser') ? 9.75 : (shopName.includes('Electrokit') ? 10.90 : 12.50),
      currency: 'SEK',
      inStock: !shopName.includes('Mouser'),
      stockQuantity: shopName.includes('Mouser') ? 0 : 50,
      url: `https://www.${shopName.toLowerCase().replace(' ', '')}.com/product/lm317t`
    });
  }
  
  // Apply category filter if provided
  if (category) {
    return mockComponents.filter(c => c.category === category);
  }
  
  // Apply in-stock filter if requested
  if (inStockOnly) {
    return mockComponents.filter(c => c.inStock);
  }
  
  return mockComponents;
}
