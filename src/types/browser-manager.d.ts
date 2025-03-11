declare module '@mcp-server/browser-manager' {
  export interface BrowserOptions {
    headless?: boolean;
    timeout?: number;
    viewport?: {
      width: number;
      height: number;
    };
    userAgent?: string;
  }

  export interface NavigationResult {
    title: string;
    url: string;
    metadata: {
      statusCode?: number;
      headers?: Record<string, string>;
      timing?: {
        navigationStart: number;
        loadEventEnd: number;
      };
    };
  }

  export interface WaitForSelectorOptions {
    visible?: boolean;
    hidden?: boolean;
    timeout?: number;
  }

  export class BrowserManager {
    constructor(options?: BrowserOptions);
    
    /**
     * Initialize the browser instance
     */
    initialize(): Promise<void>;

    /**
     * Navigate to a URL and wait for the page to load
     * @param url The URL to navigate to
     */
    navigate(url: string): Promise<NavigationResult>;

    /**
     * Wait for an element matching the selector to appear in page
     * @param selector CSS selector to wait for
     * @param options Wait options
     */
    waitForSelector(selector: string, options?: WaitForSelectorOptions): Promise<void>;

    /**
     * Execute JavaScript in the context of the page
     * @param script JavaScript code to execute
     * @returns Result of the script execution
     */
    evaluateScript<T>(script: string): Promise<T>;

    /**
     * Close the browser instance
     */
    close(): Promise<void>;

    /**
     * Clean up any remaining browser processes
     */
    cleanup(): Promise<void>;
  }
} 