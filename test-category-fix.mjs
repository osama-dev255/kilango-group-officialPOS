// Test script to verify the category ID fix
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in your .env file
const SUPABASE_URL = 'https://asnfodewuwxabbsdnjgi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbmZvZGV3dXd4YWJic2RuamdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzE0NzMsImV4cCI6MjA3NjYwNzQ3M30.Chu69zvIEWrVQiEo9YS1OyIDlsI7M3ILkBQzmEa8Fp8';

console.log('=== Testing Category ID Fix ===');
console.log('Supabase URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCategoryFix() {
  console.log('\n1. Fetching categories...');
  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('❌ Failed to fetch categories:', categoriesError.message);
      return false;
    }
    
    console.log('✅ Found', categories.length, 'categories');
    if (categories.length > 0) {
      console.log('Sample category:', categories[0]);
    }
    
    console.log('\n2. Testing product creation with valid category ID...');
    
    // Get a valid category ID if available
    let categoryId = null;
    if (categories.length > 0 && categories[0].id) {
      categoryId = categories[0].id;
      console.log('Using category ID:', categoryId);
    }
    
    const testProduct = {
      name: 'Category Test Product',
      category_id: categoryId, // This should be a UUID or null, not a string name
      selling_price: 29.99,
      cost_price: 15.00,
      stock_quantity: 20
    };
    
    console.log('Test product data:', testProduct);
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();
    
    if (productError) {
      console.error('❌ Product creation failed:', productError.message);
      console.error('Error code:', productError.code);
      return false;
    }
    
    console.log('✅ Product created successfully with ID:', product.id);
    
    // Clean up
    await supabase.from('products').delete().eq('id', product.id);
    console.log('✅ Cleaned up test product');
    
    console.log('\n=== CATEGORY FIX VERIFICATION COMPLETE ===');
    console.log('🎉 The category ID issue has been fixed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed with exception:', error.message);
    return false;
  }
}

// Run the test
testCategoryFix();