import { getProducts, createProduct } from './services/databaseService';

async function testProductLoading() {
  console.log('Testing product loading...');
  
  try {
    // Test fetching products
    const products = await getProducts();
    console.log('Products loaded:', products.length);
    
    if (products.length === 0) {
      console.log('No products found, creating a test product...');
      
      // Create a test product
      const testProduct = {
        name: 'Test Product',
        selling_price: 19.99,
        cost_price: 10.00,
        stock_quantity: 100
      };
      
      const createdProduct = await createProduct(testProduct);
      console.log('Created product:', createdProduct);
      
      // Try fetching products again
      const productsAfterCreate = await getProducts();
      console.log('Products after create:', productsAfterCreate.length);
    } else {
      console.log('First product:', products[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testProductLoading();