import { BrowserManager } from '../managers/BrowserManager';

describe('Electronic Components Finder Frontend Tests', () => {
  let browser: BrowserManager;

  beforeAll(async () => {
    browser = new BrowserManager();
    await browser.initialize();
  });

  afterAll(async () => {
    await browser.cleanup();
  });

  test('Search for resistors', async () => {
    try {
      await browser.navigate('http://localhost:5177');
      await browser.waitForSelector('.MuiTextField-root input');
      await browser.evaluateScript(`
        document.querySelector('.MuiTextField-root input').value = 'resistor';
        document.querySelector('.MuiTextField-root input').dispatchEvent(new Event('input'));
        document.querySelector('button[type="submit"]').removeAttribute('disabled');
        document.querySelector('button[type="submit"]').click();
      `);
      await browser.waitForSelector('.MuiCard-root');
      const results = await browser.evaluateScript<Array<{ name: string }>>(`
        Array.from(document.querySelectorAll('.MuiCard-root')).map(card => ({
          name: card.querySelector('.MuiTypography-h6').textContent
        }))
      `);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name.toLowerCase().includes('resistor'))).toBe(true);
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  }, 60000);

  test('Filter by shop', async () => {
    try {
      await browser.navigate('http://localhost:5177');
      await browser.waitForSelector('.MuiTextField-root input');
      await browser.evaluateScript(`
        document.querySelector('.MuiTextField-root input').value = 'arduino';
        document.querySelector('.MuiTextField-root input').dispatchEvent(new Event('input'));
        Array.from(document.querySelectorAll('.MuiSelect-nativeInput')).find(input => 
          input.closest('.MuiFormControl-root').querySelector('label').textContent === 'Shop'
        ).value = 'electrokit';
        document.querySelector('button[type="submit"]').removeAttribute('disabled');
        document.querySelector('button[type="submit"]').click();
      `);
      await browser.waitForSelector('.MuiCard-root');
      const results = await browser.evaluateScript<Array<{ name: string; shop: string }>>(`
        Array.from(document.querySelectorAll('.MuiCard-root')).map(card => ({
          name: card.querySelector('.MuiTypography-h6').textContent,
          shop: Array.from(card.querySelectorAll('.MuiChip-root')).find(chip => 
            chip.textContent === 'electrokit'
          )?.textContent
        }))
      `);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.shop === 'electrokit')).toBe(true);
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  }, 60000);
}); 