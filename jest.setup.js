// Increase timeout for all tests
jest.setTimeout(60000);

// Add custom matchers if needed
expect.extend({
  toBeValidComponent(received) {
    const isValid = 
      received &&
      typeof received === 'object' &&
      typeof received.partNumber === 'string' &&
      typeof received.name === 'string' &&
      typeof received.price === 'number' &&
      typeof received.currency === 'string';

    return {
      message: () =>
        `expected ${received} to be a valid component`,
      pass: isValid
    };
  }
}); 