import { VendorService } from './vendorService.js';
import { CacheService } from './cacheService.js';

export interface ComponentSearchFilters {
  inStock?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
  vendors?: string[];
}

export interface ComponentSearch {
  query: string;
  category?: string;
  filters?: ComponentSearchFilters;
}

export interface VendorResult {
  vendorId: string;
  price: number;
  currency: string;
  stock: number;
  deliveryTime: number;
  url: string;
}

export interface ComponentResult {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  category: string;
  specifications: Record<string, any>;
  vendors: VendorResult[];
  similarProducts?: string[];
}

export class ComponentSearch {
  constructor(
    private vendorService: VendorService,
    private cacheService: CacheService
  ) {}

  private async searchVendor(vendorId: string, search: ComponentSearch): Promise<ComponentResult[]> {
    // TODO: Implement vendor-specific search
    return [];
  }

  private mergeDuplicateComponents(results: ComponentResult[]): ComponentResult[] {
    // TODO: Implement component deduplication based on manufacturer part numbers
    return results;
  }

  private async findSimilarProducts(component: ComponentResult): Promise<string[]> {
    // TODO: Implement similar product search based on specifications
    return [];
  }

  private async getComponentsFromCache(search: ComponentSearch): Promise<ComponentResult[]> {
    const cachedComponents = await this.cacheService.getCachedComponents(search.query, search.category);
    
    // Filter out stale components that need refreshing
    const [fresh, stale] = cachedComponents.reduce<[ComponentResult[], string[]]>(
      ([fresh, stale], component) => {
        const vendorResults = component.vendors.filter(v => !this.cacheService.isStale(v.lastUpdated));
        if (vendorResults.length > 0) {
          fresh.push({ ...component, vendors: vendorResults });
        }
        if (vendorResults.length < component.vendors.length) {
          stale.push(component.id);
        }
        return [fresh, stale];
      },
      [[], []]
    );

    // Refresh stale components in the background
    if (stale.length > 0) {
      this.refreshStaleComponents(stale, search);
    }

    return fresh;
  }

  private async refreshStaleComponents(componentIds: string[], search: ComponentSearch): Promise<void> {
    // Refresh components in the background
    Promise.all(
      componentIds.map(async (id) => {
        const results = await this.searchVendor(id, search);
        await Promise.all(
          results.map(async (component) => {
            await this.cacheService.updateComponentCache(component);
            await Promise.all(
              component.vendors.map(vendor => 
                this.cacheService.updateVendorResultCache(component.id, vendor)
              )
            );
          })
        );
      })
    ).catch(error => {
      console.error('Error refreshing stale components:', error);
    });
  }

  public async search(search: ComponentSearch): Promise<ComponentResult[]> {
    // First try to get results from cache
    const cachedResults = await this.getComponentsFromCache(search);
    
    // If we have enough fresh results, return them
    if (cachedResults.length > 0) {
      return this.applyFilters(cachedResults, search.filters);
    }

    // Otherwise, perform a new search
    const vendors = search.filters?.vendors || [
      'elfa', 'electrokit', 'mouser', 'farnell', 
      'rs', 'digikey', 'tme', 'kjell'
    ];

    // Search all vendors in parallel
    const results = await Promise.all(
      vendors.map(vendor => this.searchVendor(vendor, search))
    );

    // Merge results and remove duplicates
    const flatResults = results.flat();
    const mergedResults = this.mergeDuplicateComponents(flatResults);

    // Cache the results
    await Promise.all(
      mergedResults.map(async (component) => {
        await this.cacheService.updateComponentCache(component);
        await Promise.all(
          component.vendors.map(vendor => 
            this.cacheService.updateVendorResultCache(component.id, vendor)
          )
        );
      })
    );

    // Apply filters and return
    return this.applyFilters(mergedResults, search.filters);
  }

  private applyFilters(results: ComponentResult[], filters?: ComponentSearchFilters): ComponentResult[] {
    if (!filters) return results;

    return results.filter(component => {
      const vendorResults = component.vendors.filter(vendor => {
        if (filters.inStock && vendor.stock <= 0) return false;
        if (filters.priceRange?.min && vendor.price < filters.priceRange.min) return false;
        if (filters.priceRange?.max && vendor.price > filters.priceRange.max) return false;
        return true;
      });
      component.vendors = vendorResults;
      return vendorResults.length > 0;
    });
  }
} 