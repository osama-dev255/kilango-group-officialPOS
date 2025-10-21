// Test script that mimics exactly what the React application does
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in your .env file
const SUPABASE_URL = 'https://asnfodewuwxabbsdnjgi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbmZvZGV3dXd4YWJic2RuamdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzE0NzMsImV4cCI6MjA3NjYwNzQ3M30.Chu69zvIEWrVQiEo9YS1OyIDlsI7M3ILkBQzmEa8Fp8';

console.log('Testing product creation exactly like React application...');
console.log('URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// This mimics the createProduct function from databaseService.ts
async function createProduct(product) {
  try {
    console.log('Creating product with data:', product);
    
    // Remove created_at and updated_at from the product object since they have database defaults
    const { created_at, updated_at, ...productData } = product;
    
    // Handle empty strings for UNIQUE fields by setting them to null
    if (productData.barcode === '') {
      productData.barcode = null;
    }
    if (productData.sku === '') {
      productData.sku = null;
    }
    
    console.log('Sending product data to Supabase:', productData);
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error creating product:', error);
      throw error;
    }
    
    console.log('Product created successfully:', data);
    return data || null;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

// Test with the exact same data structure as ProductManagement.tsx
async function testReactStyleCreation() {
  console.log('\n=== Testing React-style Product Creation ===');
  
  // This is the exact structure from ProductManagement.tsx
  const newProduct = {
    name: "Test Product from React Test",
    category_id: null,
    selling_price: 49.99,
    cost_price: 25.00,
    stock_quantity: 15,
    barcode: "",
    sku: "",
    description: "",
    unit_of_measure: "piece",
    wholesale_price: 0,
    min_stock_level: 0,
    max_stock_level: 10000,
    is_active: true
  };
  
  console.log('Testing with React-style product data:', newProduct);
  
  try {
    const result = await createProduct(newProduct);
    if (result) {
      console.log('✅ Product created successfully with ID:', result.id);
      
      // Clean up
      await supabase.from('products').delete().eq('id', result.id);
      console.log('✅ Cleaned up test product');
      
      return true;
    } else {
      console.log('❌ Product creation returned null');
      return false;
    }
  } catch (error) {
    console.error('❌ Product creation failed:', error.message);
    return false;
  }
}

// Run the test
testReactStyleCreation().then((success) => {
  console.log('\n=== Test Results ===');
  if (success) {
    console.log('🎉 React-style product creation works!');
  } else {
    console.log('❌ React-style product creation failed.');
  }
});