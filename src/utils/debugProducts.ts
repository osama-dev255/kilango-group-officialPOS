import { getProducts } from '@/services/databaseService';

export const debugProductLoading = async () => {
  console.log('=== DEBUG PRODUCT LOADING ===');
  
  try {
    console.log('1. Attempting to load products...');
    const products = await getProducts();
    console.log('2. Products loaded successfully:', products.length);
    console.log('3. First product (if any):', products[0]);
    
    if (products.length === 0) {
      console.log('4. No products found in database');
    } else {
      console.log('4. Products found:', products.length);
    }
    
    return products;
  } catch (error) {
    console.error('ERROR loading products:', error);
    console.error('Error type:', typeof error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return [];
  }
};