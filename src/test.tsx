import React, { useState } from 'react';
import { createProduct } from './services/databaseService';

const TestProductCreation = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testProductCreation = async () => {
    setLoading(true);
    setResult('Testing product creation...');
    
    try {
      const testProduct = {
        name: 'Test Product from React Component',
        selling_price: 39.99,
        cost_price: 20.00,
        stock_quantity: 25
      };

      console.log('Attempting to create product:', testProduct);
      setResult('Attempting to create product: ' + JSON.stringify(testProduct));
      
      const createdProduct = await createProduct(testProduct);
      
      if (createdProduct) {
        console.log('Product created successfully:', createdProduct);
        setResult('SUCCESS: Product created with ID: ' + createdProduct.id);
      } else {
        console.log('Product creation failed');
        setResult('FAILED: Product creation returned null');
      }
    } catch (error) {
      console.error('Error during product creation:', error);
      setResult('ERROR: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Product Creation</h1>
      <button onClick={testProductCreation} disabled={loading}>
        {loading ? 'Testing...' : 'Test Product Creation'}
      </button>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <pre>{result}</pre>
      </div>
    </div>
  );
};

export default TestProductCreation;