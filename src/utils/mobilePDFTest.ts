import { ExportUtils } from './exportUtils';

/**
 * Mobile PDF Test Utility
 * This utility tests the PDF export functionality specifically for mobile browsers
 */
export class MobilePDFTest {
  // Test data
  static getTestData() {
    return [
      { name: 'Product 1', price: 10.99, quantity: 2, total: 21.98 },
      { name: 'Product 2', price: 5.49, quantity: 3, total: 16.47 },
      { name: 'Product 3', price: 15.00, quantity: 1, total: 15.00 },
      { name: 'Product 4', price: 8.75, quantity: 2, total: 17.50 },
      { name: 'Product 5', price: 12.25, quantity: 1, total: 12.25 }
    ];
  }

  // Test transaction data
  static getTestTransaction() {
    return {
      id: 'TXN-12345',
      items: [
        { name: 'Wireless Headphones', price: 89.99, quantity: 1 },
        { name: 'Phone Charger', price: 19.99, quantity: 2 },
        { name: 'Screen Protector', price: 9.99, quantity: 1 }
      ],
      subtotal: 119.97,
      tax: 9.60,
      discount: 10.00,
      total: 119.57,
      paymentMethod: 'Credit Card',
      amountReceived: 120.00,
      change: 0.43,
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Anytown, USA'
      }
    };
  }

  // Test PDF export functionality
  static testPDFExport() {
    console.log('Testing PDF export functionality...');
    
    try {
      const testData = this.getTestData();
      ExportUtils.exportToPDF(testData, 'mobile-test-export', 'Mobile Test Data Export');
      console.log('PDF export test completed successfully');
    } catch (error) {
      console.error('Error during PDF export test:', error);
    }
  }

  // Test receipt PDF export functionality
  static testReceiptExport() {
    console.log('Testing receipt PDF export functionality...');
    
    try {
      const testTransaction = this.getTestTransaction();
      ExportUtils.exportReceiptAsPDF(testTransaction, 'mobile-test-receipt');
      console.log('Receipt PDF export test completed successfully');
    } catch (error) {
      console.error('Error during receipt PDF export test:', error);
    }
  }

  // Simulate mobile environment and test
  static testInMobileEnvironment() {
    console.log('Testing in mobile environment simulation...');
    
    // Override the user agent to simulate mobile
    const originalUserAgent = navigator.userAgent;
    
    // Create a mock navigator object for testing
    const mockNavigator = {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    };
    
    // Temporarily override the userAgent getter
    Object.defineProperty(navigator, 'userAgent', {
      value: mockNavigator.userAgent,
      configurable: true
    });
    
    // Run tests
    this.testPDFExport();
    this.testReceiptExport();
    
    // Restore original user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
    
    console.log('Mobile environment test completed');
  }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Add to global scope for testing
  (window as any).MobilePDFTest = MobilePDFTest;
  
  console.log('Mobile PDF Test Utility loaded. Available methods:');
  console.log('- MobilePDFTest.testPDFExport()');
  console.log('- MobilePDFTest.testReceiptExport()');
  console.log('- MobilePDFTest.testInMobileEnvironment()');
}