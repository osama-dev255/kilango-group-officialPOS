import { createProduct } from '@/services/databaseService';

// Test different product creation scenarios
export const testProductCreation = async () => {
  console.log('Testing product creation scenarios...');
  
  // Test 1: Basic product with minimal required fields
  try {
    console.log('Test 1: Basic product creation');
    const basicProduct = {
      name: 'Test Product ' + Date.now(),
      selling_price: 29.99,
      cost_price: 15.00,
      stock_quantity: 50
    };
    
    const result1 = await createProduct(basicProduct);
    console.log('Result 1:', result1);
  } catch (error) {
    console.error('Test 1 failed:', error);
  }
  
  // Test 2: Product with category_id as null
  try {
    console.log('Test 2: Product with null category_id');
    const productWithNullCategory = {
      name: 'Test Product with Null Category ' + Date.now(),
      category_id: null,
      selling_price: 39.99,
      cost_price: 20.00,
      stock_quantity: 25
    };
    
    const result2 = await createProduct(productWithNullCategory);
    console.log('Result 2:', result2);
  } catch (error) {
    console.error('Test 2 failed:', error);
  }
  
  // Test 3: Product with empty string fields
  try {
    console.log('Test 3: Product with empty string fields');
    const productWithEmptyStrings = {
      name: 'Test Product with Empty Strings ' + Date.now(),
      selling_price: 49.99,
      cost_price: 25.00,
      stock_quantity: 10,
      barcode: '',
      sku: '',
      description: ''
    };
    
    const result3 = await createProduct(productWithEmptyStrings);
    console.log('Result 3:', result3);
  } catch (error) {
    console.error('Test 3 failed:', error);
  }
  
  console.log('Product creation tests completed');
};