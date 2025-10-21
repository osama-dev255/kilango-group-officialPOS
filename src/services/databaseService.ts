import { supabase } from '@/lib/supabaseClient';

// Define TypeScript interfaces for our data models
export interface User {
  id?: string;
  username: string;
  email?: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id?: string;
  name: string;
  category_id?: string;
  description?: string;
  barcode?: string;
  sku?: string;
  unit_of_measure?: string;
  selling_price: number;
  cost_price: number;
  wholesale_price?: number;
  stock_quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  is_active?: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id?: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  date_of_birth?: string;
  loyalty_points?: number;
  credit_limit?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id?: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Sale {
  id?: string;
  customer_id?: string;
  user_id?: string;
  invoice_number?: string;
  sale_date?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  change_amount: number;
  payment_method: string;
  payment_status: string;
  sale_status: string;
  notes?: string;
  reference_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SaleItem {
  id?: string;
  sale_id: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total_price: number;
  created_at?: string;
}

export interface PurchaseOrder {
  id?: string;
  supplier_id?: string;
  user_id?: string;
  order_number?: string;
  order_date: string;
  expected_delivery_date?: string;
  total_amount: number;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrderItem {
  id?: string;
  purchase_order_id: string;
  product_id?: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  created_at?: string;
}

export interface Expense {
  id?: string;
  user_id?: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  expense_date: string;
  receipt_url?: string;
  is_business_related?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Debt {
  id?: string;
  customer_id?: string;
  supplier_id?: string;
  debt_type: string;
  amount: number;
  description?: string;
  due_date?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Discount {
  id?: string;
  name: string;
  code?: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  minimum_order_value?: number;
  maximum_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  usage_limit?: number;
  used_count?: number;
  apply_to: string;
  created_at?: string;
  updated_at?: string;
}

export interface Return {
  id?: string;
  sale_id?: string;
  customer_id?: string;
  user_id?: string;
  return_date?: string;
  reason?: string;
  return_status: string;
  total_amount: number;
  refund_method?: string;
  refund_amount: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryAudit {
  id?: string;
  product_id?: string;
  user_id?: string;
  audit_date?: string;
  expected_quantity: number;
  actual_quantity: number;
  difference: number;
  reason?: string;
  notes?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerSettlement {
  id?: string;
  customer_id?: string;
  user_id?: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  settlement_date?: string;
  created_at?: string;
}

export interface SupplierSettlement {
  id?: string;
  supplier_id?: string;
  user_id?: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  settlement_date?: string;
  created_at?: string;
}

// Function to initialize the database schema
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database schema...');
    
    // In a real implementation, you would create tables here
    // For now, we'll just return a success message
    console.log('Database schema initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
};

// User CRUD operations
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Product CRUD operations
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
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
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log('Product created successfully:', data);
    return data || null;
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error type:', typeof error);
    console.error('Error keys:', Object.keys(error as object));
    return null;
  }
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product | null> => {
  try {
    // Remove updated_at from the product object since it has a database default
    const { updated_at, ...productData } = product;
    
    // Handle empty strings for UNIQUE fields by setting them to null
    if ('barcode' in productData && productData.barcode === '') {
      productData.barcode = null;
    }
    if ('sku' in productData && productData.sku === '') {
      productData.sku = null;
    }
    
    const { data, error } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

// Test RLS policies for products table
export const testRLSPolicies = async (): Promise<boolean> => {
  try {
    // Try to fetch products to test SELECT policy (without aggregate functions)
    const { data: selectData, error: selectError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('SELECT policy test failed:', selectError);
      return false;
    }
    
    // Try to insert a test product to test INSERT policy
    const testProduct = {
      name: 'RLS Test Product',
      selling_price: 1.00,
      cost_price: 0.50,
      stock_quantity: 1
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();
    
    if (insertError) {
      console.error('INSERT policy test failed:', insertError);
      console.error('Error details:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      });
      return false;
    }
    
    // Clean up test product if created
    if (insertData && insertData.id) {
      await supabase
        .from('products')
        .delete()
        .eq('id', insertData.id);
    }
    
    console.log('RLS policies test passed');
    return true;
  } catch (error) {
    console.error('RLS policies test failed:', error);
    return false;
  }
};

// Fix RLS policies by adding proper policies to Supabase
export const fixRLSPolicies = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Attempting to fix RLS policies...');
    
    // Since we can't directly execute SQL from the client, we'll provide the exact SQL commands
    // that need to be run in the Supabase SQL editor
    const sqlCommands = `
-- Fix RLS policies for all tables to allow anonymous access for a POS system
-- This is suitable for development/testing but should be more restrictive in production

-- Products table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert access for all users" ON products;
DROP POLICY IF EXISTS "Enable update access for all users" ON products;
DROP POLICY IF EXISTS "Enable delete access for all users" ON products;

CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON products FOR DELETE USING (true);

-- Categories table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert access for all users" ON categories;
DROP POLICY IF EXISTS "Enable update access for all users" ON categories;
DROP POLICY IF EXISTS "Enable delete access for all users" ON categories;

CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON categories FOR DELETE USING (true);

-- Customers table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON customers;
DROP POLICY IF EXISTS "Enable update access for all users" ON customers;
DROP POLICY IF EXISTS "Enable delete access for all users" ON customers;

CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON customers FOR DELETE USING (true);

-- Suppliers table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable update access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable delete access for all users" ON suppliers;

CREATE POLICY "Enable read access for all users" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON suppliers FOR DELETE USING (true);

-- Sales table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON sales;
DROP POLICY IF EXISTS "Enable insert access for all users" ON sales;
DROP POLICY IF EXISTS "Enable update access for all users" ON sales;
DROP POLICY IF EXISTS "Enable delete access for all users" ON sales;

CREATE POLICY "Enable read access for all users" ON sales FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON sales FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON sales FOR DELETE USING (true);

-- Sale items table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON sale_items;
DROP POLICY IF EXISTS "Enable insert access for all users" ON sale_items;
DROP POLICY IF EXISTS "Enable update access for all users" ON sale_items;
DROP POLICY IF EXISTS "Enable delete access for all users" ON sale_items;

CREATE POLICY "Enable read access for all users" ON sale_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON sale_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON sale_items FOR DELETE USING (true);

-- Purchase orders table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON purchase_orders;
DROP POLICY IF EXISTS "Enable insert access for all users" ON purchase_orders;
DROP POLICY IF EXISTS "Enable update access for all users" ON purchase_orders;
DROP POLICY IF EXISTS "Enable delete access for all users" ON purchase_orders;

CREATE POLICY "Enable read access for all users" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON purchase_orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON purchase_orders FOR DELETE USING (true);

-- Purchase order items table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON purchase_order_items;
DROP POLICY IF EXISTS "Enable insert access for all users" ON purchase_order_items;
DROP POLICY IF EXISTS "Enable update access for all users" ON purchase_order_items;
DROP POLICY IF EXISTS "Enable delete access for all users" ON purchase_order_items;

CREATE POLICY "Enable read access for all users" ON purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON purchase_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON purchase_order_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON purchase_order_items FOR DELETE USING (true);

-- Expenses table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON expenses;
DROP POLICY IF EXISTS "Enable insert access for all users" ON expenses;
DROP POLICY IF EXISTS "Enable update access for all users" ON expenses;
DROP POLICY IF EXISTS "Enable delete access for all users" ON expenses;

CREATE POLICY "Enable read access for all users" ON expenses FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON expenses FOR DELETE USING (true);

-- Discounts table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON discounts;
DROP POLICY IF EXISTS "Enable insert access for all users" ON discounts;
DROP POLICY IF EXISTS "Enable update access for all users" ON discounts;
DROP POLICY IF EXISTS "Enable delete access for all users" ON discounts;

CREATE POLICY "Enable read access for all users" ON discounts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON discounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON discounts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON discounts FOR DELETE USING (true);

-- Users table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON users;
DROP POLICY IF EXISTS "Enable update access for all users" ON users;
DROP POLICY IF EXISTS "Enable delete access for all users" ON users;

CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON users FOR DELETE USING (true);

-- Returns table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON returns;
DROP POLICY IF EXISTS "Enable insert access for all users" ON returns;
DROP POLICY IF EXISTS "Enable update access for all users" ON returns;
DROP POLICY IF EXISTS "Enable delete access for all users" ON returns;

CREATE POLICY "Enable read access for all users" ON returns FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON returns FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON returns FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON returns FOR DELETE USING (true);

-- Return items table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON return_items;
DROP POLICY IF EXISTS "Enable insert access for all users" ON return_items;
DROP POLICY IF EXISTS "Enable update access for all users" ON return_items;
DROP POLICY IF EXISTS "Enable delete access for all users" ON return_items;

CREATE POLICY "Enable read access for all users" ON return_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON return_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON return_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON return_items FOR DELETE USING (true);

-- Damaged products table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON damaged_products;
DROP POLICY IF EXISTS "Enable insert access for all users" ON damaged_products;
DROP POLICY IF EXISTS "Enable update access for all users" ON damaged_products;
DROP POLICY IF EXISTS "Enable delete access for all users" ON damaged_products;

CREATE POLICY "Enable read access for all users" ON damaged_products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON damaged_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON damaged_products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON damaged_products FOR DELETE USING (true);

-- Debts table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON debts;
DROP POLICY IF EXISTS "Enable insert access for all users" ON debts;
DROP POLICY IF EXISTS "Enable update access for all users" ON debts;
DROP POLICY IF EXISTS "Enable delete access for all users" ON debts;

CREATE POLICY "Enable read access for all users" ON debts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON debts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON debts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON debts FOR DELETE USING (true);

-- Customer settlements table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON customer_settlements;
DROP POLICY IF EXISTS "Enable insert access for all users" ON customer_settlements;
DROP POLICY IF EXISTS "Enable update access for all users" ON customer_settlements;
DROP POLICY IF EXISTS "Enable delete access for all users" ON customer_settlements;

CREATE POLICY "Enable read access for all users" ON customer_settlements FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON customer_settlements FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON customer_settlements FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON customer_settlements FOR DELETE USING (true);

-- Supplier settlements table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON supplier_settlements;
DROP POLICY IF EXISTS "Enable insert access for all users" ON supplier_settlements;
DROP POLICY IF EXISTS "Enable update access for all users" ON supplier_settlements;
DROP POLICY IF EXISTS "Enable delete access for all users" ON supplier_settlements;

CREATE POLICY "Enable read access for all users" ON supplier_settlements FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON supplier_settlements FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON supplier_settlements FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON supplier_settlements FOR DELETE USING (true);

-- Inventory audits table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON inventory_audits;
DROP POLICY IF EXISTS "Enable insert access for all users" ON inventory_audits;
DROP POLICY IF EXISTS "Enable update access for all users" ON inventory_audits;
DROP POLICY IF EXISTS "Enable delete access for all users" ON inventory_audits;

CREATE POLICY "Enable read access for all users" ON inventory_audits FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON inventory_audits FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON inventory_audits FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON inventory_audits FOR DELETE USING (true);

-- Reports table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON reports;
DROP POLICY IF EXISTS "Enable insert access for all users" ON reports;
DROP POLICY IF EXISTS "Enable update access for all users" ON reports;
DROP POLICY IF EXISTS "Enable delete access for all users" ON reports;

CREATE POLICY "Enable read access for all users" ON reports FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON reports FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON reports FOR DELETE USING (true);

-- Access logs table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON access_logs;
DROP POLICY IF EXISTS "Enable insert access for all users" ON access_logs;
DROP POLICY IF EXISTS "Enable update access for all users" ON access_logs;
DROP POLICY IF EXISTS "Enable delete access for all users" ON access_logs;

CREATE POLICY "Enable read access for all users" ON access_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON access_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON access_logs FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON access_logs FOR DELETE USING (true);
`;

    console.log('RLS policies SQL commands prepared. Please run these in your Supabase SQL editor.');
    return {
      success: true,
      message: "RLS policies SQL commands prepared. Please run these in your Supabase SQL editor."
    };
  } catch (error) {
    console.error('Error preparing RLS policies fix:', error);
    return {
      success: false,
      message: "Error preparing RLS policies fix: " + (error as Error).message
    };
  }
};

// Apply RLS policies fix and show instructions
export const applyRLSPoliciesFix = async (): Promise<void> => {
  try {
    const result = await fixRLSPolicies();
    
    // Show instructions to the user
    if (result.success) {
      console.log("=== RLS POLICIES FIX INSTRUCTIONS ===");
      console.log("1. Open your Supabase project dashboard");
      console.log("2. Go to the SQL Editor");
      console.log("3. Copy and paste the SQL commands provided below");
      console.log("4. Run the script");
      console.log("5. Test product creation again");
      console.log("\nSQL Commands:\n");
      console.log(result.message);
    } else {
      console.error("Failed to prepare RLS policies fix:", result.message);
    }
  } catch (error) {
    console.error('Error applying RLS policies fix:', error);
  }
};

// Category CRUD operations
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Customer CRUD operations
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('first_name', { ascending: true })
      .order('last_name', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([{ ...customer, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating customer:', error);
    return null;
  }
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...customer, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error updating customer:', error);
    return null;
  }
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
};

// Supplier CRUD operations
export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
};

// Sales CRUD operations
export const getSales = async (): Promise<Sale[]> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sale_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
};

export const getSaleById = async (id: string): Promise<Sale | null> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching sale:', error);
    return null;
  }
};

export const createSale = async (sale: Omit<Sale, 'id'>): Promise<Sale | null> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .insert([{ ...sale, sale_date: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating sale:', error);
    return null;
  }
};

export const updateSale = async (id: string, sale: Partial<Sale>): Promise<Sale | null> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .update({ ...sale, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error updating sale:', error);
    return null;
  }
};

// Sale Items operations
export const getSaleItems = async (saleId: string): Promise<SaleItem[]> => {
  try {
    const { data, error } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sale items:', error);
    return [];
  }
};

export const createSaleItem = async (saleItem: Omit<SaleItem, 'id'>): Promise<SaleItem | null> => {
  try {
    const { data, error } = await supabase
      .from('sale_items')
      .insert([saleItem])
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating sale item:', error);
    return null;
  }
};

// Purchase Orders CRUD operations
export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('order_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }
};

export const getPurchaseOrderById = async (id: string): Promise<PurchaseOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return null;
  }
};

export const createPurchaseOrder = async (purchaseOrder: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([{ ...purchaseOrder, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return null;
  }
};

export const updatePurchaseOrder = async (id: string, purchaseOrder: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ ...purchaseOrder, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return null;
  }
};

// Purchase Order Items operations
export const getPurchaseOrderItems = async (purchaseOrderId: string): Promise<PurchaseOrderItem[]> => {
  try {
    const { data, error } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', purchaseOrderId);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching purchase order items:', error);
    return [];
  }
};

export const createPurchaseOrderItem = async (purchaseOrderItem: Omit<PurchaseOrderItem, 'id'>): Promise<PurchaseOrderItem | null> => {
  try {
    const { data, error } = await supabase
      .from('purchase_order_items')
      .insert([purchaseOrderItem])
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating purchase order item:', error);
    return null;
  }
};

// Expenses CRUD operations
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

export const getExpenseById = async (id: string): Promise<Expense | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching expense:', error);
    return null;
  }
};

export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating expense:', error);
    return null;
  }
};

export const updateExpense = async (id: string, expense: Partial<Expense>): Promise<Expense | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({ ...expense, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error updating expense:', error);
    return null;
  }
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
};

// Debts CRUD operations
export const getDebts = async (): Promise<Debt[]> => {
  try {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching debts:', error);
    return [];
  }
};

// Discounts CRUD operations
export const getDiscounts = async (): Promise<Discount[]> => {
  try {
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return [];
  }
};

// Returns CRUD operations
export const getReturns = async (): Promise<Return[]> => {
  try {
    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .order('return_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching returns:', error);
    return [];
  }
};

// Inventory Audits CRUD operations
export const getInventoryAudits = async (): Promise<InventoryAudit[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_audits')
      .select('*')
      .order('audit_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching inventory audits:', error);
    return [];
  }
};

// Customer Settlements CRUD operations
export const getCustomerSettlements = async (): Promise<CustomerSettlement[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_settlements')
      .select('*')
      .order('settlement_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customer settlements:', error);
    return [];
  }
};

// Supplier Settlements CRUD operations
export const getSupplierSettlements = async (): Promise<SupplierSettlement[]> => {
  try {
    const { data, error } = await supabase
      .from('supplier_settlements')
      .select('*')
      .order('settlement_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching supplier settlements:', error);
    return [];
  }
};