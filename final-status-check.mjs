// Final status check to verify everything is working
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in your .env file
const SUPABASE_URL = 'https://asnfodewuwxabbsdnjgi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbmZvZGV3dXd4YWJic2RuamdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzE0NzMsImV4cCI6MjA3NjYwNzQ3M30.Chu69zvIEWrVQiEo9YS1OyIDlsI7M3ILkBQzmEa8Fp8';

console.log('=== FINAL STATUS CHECK ===');
console.log('Supabase URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function finalCheck() {
  console.log('\n1. Testing basic connection...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful');
  } catch (error) {
    console.error('❌ Connection failed with exception:', error.message);
    return false;
  }
  
  console.log('\n2. Testing RLS policies...');
  try {
    // Test SELECT
    const { data: selectData, error: selectError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ SELECT policy failed:', selectError.message);
      return false;
    }
    
    console.log('✅ SELECT policy working');
    
    // Test INSERT
    const testProduct = {
      name: 'Final Status Check Product',
      selling_price: 9.99,
      cost_price: 5.99,
      stock_quantity: 10
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ INSERT policy failed:', insertError.message);
      return false;
    }
    
    console.log('✅ INSERT policy working');
    
    // Clean up
    if (insertData && insertData.id) {
      await supabase.from('products').delete().eq('id', insertData.id);
      console.log('✅ Cleaned up test product');
    }
    
    console.log('\n=== ALL CHECKS PASSED ===');
    console.log('🎉 Product creation should now work in your React application!');
    console.log('\nIf you still have issues in the React app, please:');
    console.log('1. Check the browser console for specific error messages');
    console.log('2. Verify the RLS policies have been applied in Supabase');
    console.log('3. Restart the development server');
    
    return true;
  } catch (error) {
    console.error('❌ RLS policy test failed:', error.message);
    return false;
  }
}

// Run the final check
finalCheck();