// Increase timeout for all tests to handle network requests
jest.setTimeout(60000);

// Mock console.error to keep test output clean but still log browser errors
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (args[0]?.includes('browser') || args[0]?.includes('Chrome')) {
    originalConsoleError(...args);
  }
};

// Mock console.log to reduce noise
console.log = jest.fn();

// Add custom matchers if needed
expect.extend({
  toBeValidComponent(received) {
    const pass = received &&
      typeof received === 'object' &&
      typeof received.partNumber === 'string' &&
      typeof received.name === 'string' &&
      typeof received.category === 'string' &&
      typeof received.specifications === 'object';

    return {
      pass,
      message: () =>
        `expected ${received} to be a valid component with required properties`
    };
  }
}); 