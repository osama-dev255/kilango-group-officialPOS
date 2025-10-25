import { ExportUtils } from './exportUtils';

// Test data
const testData = [
  { name: 'Product 1', price: 10.99, quantity: 2, total: 21.98 },
  { name: 'Product 2', price: 5.49, quantity: 3, total: 16.47 },
  { name: 'Product 3', price: 15.00, quantity: 1, total: 15.00 }
];

const testTransaction = {
  id: 'TXN-12345',
  items: [
    { name: 'Product 1', price: 10.99, quantity: 2 },
    { name: 'Product 2', price: 5.49, quantity: 3 },
    { name: 'Product 3', price: 15.00, quantity: 1 }
  ],
  subtotal: 53.45,
  tax: 4.28,
  discount: 5.00,
  total: 52.73,
  paymentMethod: 'Credit Card',
  amountReceived: 60.00,
  change: 7.27,
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567'
  }
};

// Test the PDF export functionality
console.log('Testing PDF export...');
ExportUtils.exportToPDF(testData, 'test-export', 'Test Data Export');

// Test the receipt PDF export functionality
console.log('Testing receipt PDF export...');
ExportUtils.exportReceiptAsPDF(testTransaction, 'test-receipt');