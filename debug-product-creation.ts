import { createProduct } from './src/services/databaseService';

async function debugProductCreation() {
  console.log('Debugging product creation...');
  
  // Test product data
  const testProduct = {
    name: 'Debug Test Product',
    selling_price: 29.99,
    cost_price: 15.00,
    stock_quantity: 50
  };
  
  console.log('Attempting to create product with data:', testProduct);
  
  try {
    const result = await createProduct(testProduct);
    console.log('Product creation result:', result);
    
    if (result) {
      console.log('Product created successfully!');
    } else {
      console.log('Product creation failed - returned null');
    }
  } catch (error) {
    console.error('Error during product creation:', error);
  }
}

debugProductCreation();