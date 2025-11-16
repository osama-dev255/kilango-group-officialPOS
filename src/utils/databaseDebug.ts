import { supabase } from '@/lib/supabaseClient';

// Function to get count of records in each table
export const getDatabaseStats = async () => {
  try {
    // Get count of sales
    const { count: salesCount, error: salesError } = await supabase
      .from('sales')
      .select('*', { count: 'exact', head: true });
    
    if (salesError) throw salesError;
    
    // Get count of purchase orders
    const { count: purchaseOrdersCount, error: purchaseOrdersError } = await supabase
      .from('purchase_orders')
      .select('*', { count: 'exact', head: true });
    
    if (purchaseOrdersError) throw purchaseOrdersError;
    
    // Get count of expenses
    const { count: expensesCount, error: expensesError } = await supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true });
    
    if (expensesError) throw expensesError;
    
    // Get count of returns
    const { count: returnsCount, error: returnsError } = await supabase
      .from('returns')
      .select('*', { count: 'exact', head: true });
    
    if (returnsError) throw returnsError;
    
    // Get count of products
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (productsError) throw productsError;
    
    console.log('=== Database Statistics ===');
    console.log('Sales:', salesCount);
    console.log('Purchase Orders:', purchaseOrdersCount);
    console.log('Expenses:', expensesCount);
    console.log('Returns:', returnsCount);
    console.log('Products:', productsCount);
    
    return {
      sales: salesCount || 0,
      purchaseOrders: purchaseOrdersCount || 0,
      expenses: expensesCount || 0,
      returns: returnsCount || 0,
      products: productsCount || 0
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};

// Function to get sample data from each table
export const getSampleData = async () => {
  try {
    // Get sample sales
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .limit(3);
    
    if (salesError) throw salesError;
    
    // Get sample purchase orders
    const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabase
      .from('purchase_orders')
      .select('*')
      .limit(3);
    
    if (purchaseOrdersError) throw purchaseOrdersError;
    
    // Get sample expenses
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .limit(3);
    
    if (expensesError) throw expensesError;
    
    // Get sample returns
    const { data: returnsData, error: returnsError } = await supabase
      .from('returns')
      .select('*')
      .limit(3);
    
    if (returnsError) throw returnsError;
    
    console.log('=== Sample Data ===');
    console.log('Sales Sample:', salesData);
    console.log('Purchase Orders Sample:', purchaseOrdersData);
    console.log('Expenses Sample:', expensesData);
    console.log('Returns Sample:', returnsData);
    
    return {
      sales: salesData || [],
      purchaseOrders: purchaseOrdersData || [],
      expenses: expensesData || [],
      returns: returnsData || []
    };
  } catch (error) {
    console.error('Error getting sample data:', error);
    return null;
  }
};

// Run the debug functions
export const runDatabaseDebug = async () => {
  console.log('Starting database debug...');
  await getDatabaseStats();
  await getSampleData();
  console.log('Database debug completed.');
};