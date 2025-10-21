import { supabase } from '@/lib/supabaseClient';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/databaseService';

// Test Supabase connection and basic operations
export const testSupabaseIntegration = async () => {
  try {
    console.log('Testing Supabase integration...');
    
    // Test connection
    const { data, error } = await supabase.rpc('now');
    if (error) {
      console.error('Supabase connection failed:', error);
      return { success: false, error };
    }
    console.log('Supabase connection successful:', data);
    
    // Test fetching products
    const products = await getProducts();
    console.log('Fetched products:', products.length);
    
    // Test creating a product
    const newProduct = {
      name: 'Test Product',
      selling_price: 19.99,
      cost_price: 10.00,
      stock_quantity: 100
    };
    
    const createdProduct = await createProduct(newProduct);
    console.log('Created product:', createdProduct);
    
    if (createdProduct && createdProduct.id) {
      // Test updating the product
      const updatedProduct = await updateProduct(createdProduct.id, {
        name: 'Updated Test Product',
        stock_quantity: 50
      });
      console.log('Updated product:', updatedProduct);
      
      // Test deleting the product
      const deleted = await deleteProduct(createdProduct.id);
      console.log('Deleted product:', deleted);
    }
    
    console.log('Supabase integration test completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Supabase integration test failed:', error);
    return { success: false, error };
  }
};

// Run the test if this file is executed directly
if (import.meta.env.DEV) {
  testSupabaseIntegration();
}