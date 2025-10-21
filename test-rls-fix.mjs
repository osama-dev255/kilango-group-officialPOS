// Simple test script to verify RLS fix
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in your .env file
const SUPABASE_URL = 'https://asnfodewuwxabbsdnjgi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbmZvZGV3dXd4YWJic2RuamdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzE0NzMsImV4cCI6MjA3NjYwNzQ3M30.Chu69zvIEWrVQiEo9YS1OyIDlsI7M3ILkBQzmEa8Fp8';

console.log('Testing Supabase connection and RLS policies...');
console.log('URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRLSFix() {
  console.log('\n=== Testing RLS Policies ===');
  
  // Test 1: Check if we can read products
  try {
    console.log('\n1. Testing product read access...');
    const { data: products, error: readError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.error('❌ Read test failed:', readError.message);
      return false;
    }
    
    console.log('✅ Read test passed - Found', products.length, 'products');
  } catch (error) {
    console.error('❌ Read test failed with exception:', error.message);
    return false;
  }
  
  // Test 2: Check if we can insert a product
  try {
    console.log('\n2. Testing product insert access...');
    const testProduct = {
      name: 'RLS Test Product - ' + Date.now(),
      selling_price: 19.99,
      cost_price: 9.99,
      stock_quantity: 5
    };
    
    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      return false;
    }
    
    console.log('✅ Insert test passed - Created product with ID:', insertedProduct.id);
    
    // Clean up - delete the test product
    try {
      await supabase
        .from('products')
        .delete()
        .eq('id', insertedProduct.id);
      console.log('✅ Cleaned up test product');
    } catch (cleanupError) {
      console.log('⚠️  Warning: Could not clean up test product:', cleanupError.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Insert test failed with exception:', error.message);
    return false;
  }
}

// Run the test
testRLSFix().then((success) => {
  console.log('\n=== Test Results ===');
  if (success) {
    console.log('🎉 All RLS tests passed! Product creation should now work.');
  } else {
    console.log('❌ RLS tests failed. Please apply the FIX_RLS_POLICIES_COMPLETE.sql script.');
    console.log('\nTo fix RLS policies:');
    console.log('1. Open your Supabase project dashboard');
    console.log('2. Go to the SQL Editor');
    console.log('3. Run the FIX_RLS_POLICIES_COMPLETE.sql script');
    console.log('4. Test again');
  }
});