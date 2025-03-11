/**
 * Electronics Component Finder
 * Frontend JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enable debug mode
  const debugMode = true;
  const debugInfo = document.getElementById('debug-info');
  const debugContent = document.getElementById('debug-content');
  
  if (debugMode) {
    debugInfo.style.display = 'block';
    debugContent.innerHTML = '<p>Debug mode enabled</p>';
  }
  
  // Helper function to log debug messages
  function debug(message, data = null) {
    if (debugMode) {
      console.log(message, data || '');
      const timestamp = new Date().toLocaleTimeString();
      const dataStr = data ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : '';
      debugContent.innerHTML += `<p><strong>${timestamp}:</strong> ${message} ${dataStr ? '<pre>' + dataStr + '</pre>' : ''}</p>`;
    }
  }
  
  debug('Application initializing...');
  
  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const resultsContainer = document.getElementById('results-container');
  const categoryFilter = document.getElementById('category-filter');
  const shopFilter = document.getElementById('shop-filter');
  const stockFilter = document.getElementById('stock-filter');
  const partsListLink = document.getElementById('parts-list-link');
  const datasheetLink = document.getElementById('datasheets-link');
  const searchSection = document.getElementById('search-section');
  const partsListSection = document.getElementById('parts-list-section');
  const datasheetsSection = document.getElementById('datasheets-section');
  const lastUpdateTime = document.getElementById('last-update-time');
  
  debug('DOM elements initialized');
  
  // Templates
  const componentResultTemplate = document.getElementById('component-result-template');
  const shopListingTemplate = document.getElementById('shop-listing-template');
  
  // Debug check for templates
  if (!componentResultTemplate) {
    console.error('Component result template not found!');
    debug('ERROR: Component result template not found!');
  } else {
    debug('Component result template found');
  }
  
  if (!shopListingTemplate) {
    console.error('Shop listing template not found!');
    debug('ERROR: Shop listing template not found!');
  } else {
    debug('Shop listing template found');
  }
  
  // Navigation
  partsListLink.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveSection(partsListSection);
    setActiveNavLink(partsListLink);
  });
  
  datasheetLink.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveSection(datasheetsSection);
    setActiveNavLink(datasheetLink);
  });
  
  document.querySelector('nav a.active').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveSection(searchSection);
    setActiveNavLink(e.target);
  });
  
  // Search functionality
  searchButton.addEventListener('click', () => {
    performSearch();
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  // Filter change events
  categoryFilter.addEventListener('change', () => {
    if (searchInput.value.trim()) {
      performSearch();
    }
  });
  
  shopFilter.addEventListener('change', () => {
    if (searchInput.value.trim()) {
      performSearch();
    }
  });
  
  stockFilter.addEventListener('change', () => {
    if (searchInput.value.trim()) {
      performSearch();
    }
  });
  
  /**
   * Set the active section and hide others
   */
  function setActiveSection(section) {
    // Hide all sections
    searchSection.classList.remove('active-section');
    searchSection.classList.add('hidden-section');
    partsListSection.classList.remove('active-section');
    partsListSection.classList.add('hidden-section');
    datasheetsSection.classList.remove('active-section');
    datasheetsSection.classList.add('hidden-section');
    
    // Show the active section
    section.classList.remove('hidden-section');
    section.classList.add('active-section');
  }
  
  /**
   * Set the active navigation link
   */
  function setActiveNavLink(link) {
    // Remove active class from all links
    document.querySelectorAll('nav a').forEach(a => {
      a.classList.remove('active');
    });
    
    // Add active class to the clicked link
    link.classList.add('active');
  }
  
  /**
   * Perform a search for components
   */
  async function performSearch() {
    try {
      const searchTerm = searchInput.value.trim();
      if (!searchTerm) return;
      
      debug('Performing search for:', searchTerm);
      
      // Show loading state
      resultsContainer.innerHTML = '<p class="placeholder-message">Searching...</p>';
      
      // Get filter values
      const category = categoryFilter.value;
      const shop = shopFilter.value;
      const inStockOnly = stockFilter.value === 'in-stock';
      
      // Build query parameters
      const params = new URLSearchParams({
        q: searchTerm
      });
      
      if (category) params.append('category', category);
      if (shop) params.append('shop', shop);
      if (inStockOnly) params.append('inStock', 'true');
      
      // In a real implementation, this would call the backend API
      // For now, we'll simulate a response with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data for demonstration
      const mockResults = getMockSearchResults(searchTerm, category, shop, inStockOnly);
      debug('Search results:', mockResults);
      
      // Display results
      displaySearchResults(mockResults);
      
      // Update last checked time
      lastUpdateTime.textContent = new Date().toLocaleString();
    } catch (error) {
      console.error('Search error:', error);
      resultsContainer.innerHTML = `
        <p class="placeholder-message error-message">
          Error: ${error.message || 'Failed to search components'}
        </p>
      `;
    }
  }
  
  /**
   * Display search results in the UI
   */
  function displaySearchResults(results) {
    try {
      debug('Displaying results:', results);
      
      if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p class="placeholder-message">No components found matching your search criteria</p>';
        return;
      }
      
      // Clear previous results
      resultsContainer.innerHTML = '';
      
      // Create result cards for each component
      results.forEach((component, index) => {
        debug(`Processing component ${index + 1}/${results.length}: ${component.name}`);
        
        // Clone the template
        const resultCard = document.importNode(componentResultTemplate.content, true);
        debug(`Template cloned for ${component.name}`);
        
        // Fill in component details
        resultCard.querySelector('.component-name').textContent = component.name;
        resultCard.querySelector('.component-manufacturer').textContent = component.manufacturer;
        resultCard.querySelector('.component-description').textContent = component.description;
        
        // Add shop listings
        const shopListingsContainer = resultCard.querySelector('.shop-listings');
        debug(`Found shop listings container for ${component.name}`);
        
        component.shops.forEach((shop, shopIndex) => {
          debug(`Processing shop ${shopIndex + 1}/${component.shops.length}: ${shop.name}`);
          const shopListing = document.importNode(shopListingTemplate.content, true);
          
          shopListing.querySelector('.shop-name').textContent = shop.name;
          shopListing.querySelector('.last-updated').textContent = `Updated: ${shop.lastUpdated}`;
          shopListing.querySelector('.price').textContent = `${shop.price} ${shop.currency}`;
          
          const stockStatus = shopListing.querySelector('.stock-status');
          stockStatus.textContent = shop.stockStatus;
          if (shop.inStock) {
            stockStatus.classList.add('in-stock');
          } else {
            stockStatus.classList.add('out-of-stock');
          }
          
          const shopLink = shopListing.querySelector('.shop-link');
          shopLink.href = shop.url;
          shopLink.textContent = 'View in Shop';
          
          shopListingsContainer.appendChild(shopListing);
        });
        
        // Add event listeners for buttons
        resultCard.querySelector('.add-to-list-button').addEventListener('click', () => {
          alert(`Added ${component.name} to parts list (functionality coming soon)`);
        });
        
        resultCard.querySelector('.view-datasheet-button').addEventListener('click', () => {
          alert(`Datasheet for ${component.name} (functionality coming soon)`);
        });
        
        resultCard.querySelector('.find-alternatives-button').addEventListener('click', () => {
          // Generate AI link for alternatives
          const aiPrompt = `What are good alternatives to ${component.name} (${component.manufacturer}) with similar specifications?`;
          const encodedPrompt = encodeURIComponent(aiPrompt);
          const aiUrl = `https://claude.ai/chat?prompt=${encodedPrompt}`;
          window.open(aiUrl, '_blank');
        });
        
        // Add the card to the results container
        resultsContainer.appendChild(resultCard);
        debug(`Added ${component.name} card to results container`);
      });
    } catch (error) {
      console.error('Error displaying results:', error);
      resultsContainer.innerHTML = `<p class="placeholder-message">Error displaying results: ${error.message}</p>`;
    }
  }
  
  /**
   * Generate mock search results for demonstration
   * In a real implementation, this would come from the API
   */
  function getMockSearchResults(searchTerm, category, shop, inStockOnly) {
    // This is just for demonstration purposes
    const mockComponents = [
      {
        id: 1,
        name: 'LM317T',
        manufacturer: 'Texas Instruments',
        description: 'Adjustable voltage regulator, 1.2V to 37V output, 1.5A',
        category: 'ic',
        shops: [
          {
            name: 'Elfa Distrelec',
            price: 12.50,
            currency: 'SEK',
            inStock: true,
            stockStatus: 'In Stock (50+)',
            lastUpdated: '2025-03-01 12:30',
            url: 'https://www.elfa.se'
          },
          {
            name: 'Electrokit',
            price: 10.90,
            currency: 'SEK',
            inStock: true,
            stockStatus: 'In Stock (23)',
            lastUpdated: '2025-03-01 14:15',
            url: 'https://www.electrokit.com'
          },
          {
            name: 'Mouser',
            price: 9.75,
            currency: 'SEK',
            inStock: false,
            stockStatus: 'Out of Stock',
            lastUpdated: '2025-03-01 10:45',
            url: 'https://www.mouser.se'
          }
        ]
      },
      {
        id: 2,
        name: '2N2222A',
        manufacturer: 'ON Semiconductor',
        description: 'NPN general purpose transistor, 40V, 800mA',
        category: 'transistor',
        shops: [
          {
            name: 'Elfa Distrelec',
            price: 3.20,
            currency: 'SEK',
            inStock: true,
            stockStatus: 'In Stock (100+)',
            lastUpdated: '2025-03-01 12:30',
            url: 'https://www.elfa.se'
          },
          {
            name: 'Farnell',
            price: 2.95,
            currency: 'SEK',
            inStock: true,
            stockStatus: 'In Stock (500+)',
            lastUpdated: '2025-03-01 09:20',
            url: 'https://www.farnell.com'
          }
        ]
      },
      {
        id: 3,
        name: '10k Resistor',
        manufacturer: 'Yageo',
        description: '10k Ohm resistor, 1/4W, 5% tolerance, through-hole',
        category: 'resistor',
        shops: [
          {
            name: 'Electrokit',
            price: 0.90,
            currency: 'SEK',
            inStock: true,
            stockStatus: 'In Stock (1000+)',
            lastUpdated: '2025-03-01 14:15',
            url: 'https://www.electrokit.com'
          },
          {
            name: 'Kjell & Company',
            price: 1.50,
            currency: 'SEK',
            inStock: true,
            stockStatus: 'In Stock',
            lastUpdated: '2025-03-01 11:30',
            url: 'https://www.kjell.com'
          }
        ]
      }
    ];
    
    // Filter based on search term and filters
    return mockComponents.filter(component => {
      // Search term matching
      const matchesSearch = 
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filtering
      const matchesCategory = !category || component.category === category;
      
      // Shop filtering
      const matchesShop = !shop || component.shops.some(s => s.name.toLowerCase().includes(shop.toLowerCase()));
      
      // Stock filtering
      const matchesStock = !inStockOnly || component.shops.some(s => s.inStock);
      
      return matchesSearch && matchesCategory && matchesShop && matchesStock;
    });
  }
});
