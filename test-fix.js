// Simple test script to verify our fixes
const { createProduct } = require('./src/services/databaseService');

async function testFixes() {
  console.log('Testing product creation fixes...');
  
  // Test product with null category_id
  const testProduct = {
    name: 'Test Product ' + Date.now(),
    category_id: null,
    selling_price: 29.99,
    cost_price: 15.00,
    stock_quantity: 50,
    barcode: '',
    sku: ''
  };
  
  try {
    console.log('Attempting to create product...');
    const result = await createProduct(testProduct);
    console.log('Product creation result:', result);
    
    if (result && result.id) {
      console.log('SUCCESS: Product created with ID:', result.id);
    } else {
      console.log('FAILED: Product not created');
    }
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

testFixes();