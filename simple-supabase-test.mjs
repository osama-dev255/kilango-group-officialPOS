// Simple Node.js script to test Supabase connection
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in your .env file
const SUPABASE_URL = 'https://asnfodewuwxabbsdnjgi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbmZvZGV3dXd4YWJic2RuamdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzE0NzMsImV4cCI6MjA3NjYwNzQ3M30.Chu69zvIEWrVQiEo9YS1OyIDlsI7M3ILkBQzmEa8Fp8';

console.log('Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);
console.log('Key length:', SUPABASE_ANON_KEY.length);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test a simple query - fetch first 5 products
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Found', data.length, 'products');
      if (data.length > 0) {
        console.log('Sample product:', data[0]);
      }
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

// Test product creation
async function testProductCreation() {
  const testProduct = {
    name: 'Test Product from Node Script',
    selling_price: 29.99,
    cost_price: 15.00,
    stock_quantity: 50
  };

  console.log('Attempting to create product:', testProduct);

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([testProduct])
      .select();

    if (error) {
      console.error('Error creating product:', error.message);
      console.log('This indicates that RLS policies need to be fixed in Supabase.');
      console.log('Please run the FIX_RLS_POLICIES.sql script in your Supabase SQL editor.');
    } else {
      console.log('Product created successfully:', data);
      console.log('RLS policies are correctly configured!');
    }
  } catch (err) {
    console.error('Exception during product creation:', err);
  }
}

async function runTests() {
  console.log('=== Testing Supabase Connection ===');
  await testConnection();
  console.log('\n=== Testing Product Creation ===');
  await testProductCreation();
}

runTests();