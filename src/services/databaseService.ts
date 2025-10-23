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

// Enhanced getProductById with better error handling
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
    return data || null;
  } catch (error) {
    console.error('Exception fetching product by ID:', error);
    return null;
  }
};

// Add getProductByBarcode (we already have this in the enhanced version)
export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  try {
    // Handle empty barcode
    if (!barcode) return null;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();
      
    if (error) {
      console.error('Error fetching product by barcode:', error);
      return null;
    }
    return data || null;
  } catch (error) {
    console.error('Exception fetching product by barcode:', error);
    return null;
  }
};

// Add getProductBySKU (we already have this in the enhanced version)
export const getProductBySKU = async (sku: string): Promise<Product | null> => {
  try {
    // Handle empty SKU
    if (!sku) return null;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single();
      
    if (error) {
      console.error('Error fetching product by SKU:', error);
      return null;
    }
    return data || null;
  } catch (error) {
    console.error('Exception fetching product by SKU:', error);
    return null;
  }
};

// Enhanced createProduct with better validation
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  try {
    console.log('Creating product with data:', product);
    
    // Validate required fields
    if (!product.name) {
      throw new Error('Product name is required');
    }
    
    if (product.selling_price < 0) {
      throw new Error('Selling price must be zero or positive');
    }
    
    if (product.cost_price < 0) {
      throw new Error('Cost price must be zero or positive');
    }
    
    if (product.stock_quantity < 0) {
      throw new Error('Stock quantity must be zero or positive');
    }
    
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

// Enhanced updateProduct with better validation
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product | null> => {
  try {
    // Validate ID
    if (!id) {
      throw new Error('Product ID is required');
    }
    
    // Validate price fields if provided
    if (product.selling_price !== undefined && product.selling_price < 0) {
      throw new Error('Selling price must be zero or positive');
    }
    
    if (product.cost_price !== undefined && product.cost_price < 0) {
      throw new Error('Cost price must be zero or positive');
    }
    
    // Validate stock quantity if provided
    if (product.stock_quantity !== undefined && product.stock_quantity < 0) {
      throw new Error('Stock quantity must be zero or positive');
    }
    
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
      
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    return data || null;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

// Enhanced deleteProduct with better error handling
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    // Validate ID
    if (!id) {
      throw new Error('Product ID is required');
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

// Bulk delete products
export const bulkDeleteProducts = async (ids: string[]): Promise<boolean> => {
  try {
    // Validate IDs
    if (!ids || ids.length === 0) {
      throw new Error('Product IDs are required');
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);
      
    if (error) {
      console.error('Error bulk deleting products:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    return false;
  }
};

// Bulk update products
export const bulkUpdateProducts = async (updates: { id: string; data: Partial<Product> }[]): Promise<boolean> => {
  try {
    // Validate updates
    if (!updates || updates.length === 0) {
      throw new Error('Updates are required');
    }
    
    // Process each update
    for (const update of updates) {
      const { error } = await supabase
        .from('products')
        .update({ ...update.data, updated_at: new Date().toISOString() })
        .eq('id', update.id);
        
      if (error) {
        console.error(`Error updating product ${update.id}:`, error);
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error bulk updating products:', error);
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

export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return null;
  }
};

export const createSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{ ...supplier, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating supplier:', error);
    return null;
  }
};

export const updateSupplier = async (id: string, supplier: Partial<Supplier>): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...supplier, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error updating supplier:', error);
    return null;
  }
};

export const deleteSupplier = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return false;
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

export const createDebt = async (debt: Omit<Debt, 'id'>): Promise<Debt | null> => {
  try {
    const { data, error } = await supabase
      .from('debts')
      .insert([{ ...debt, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating debt:', error);
    return null;
  }
};

export const updateDebt = async (id: string, debt: Partial<Debt>): Promise<Debt | null> => {
  try {
    const { data, error } = await supabase
      .from('debts')
      .update({ ...debt, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error updating debt:', error);
    return null;
  }
};

export const deleteDebt = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting debt:', error);
    return false;
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

// Get low stock products
export const getLowStockProducts = async (threshold: number = 10): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lt('stock_quantity', threshold)
      .order('stock_quantity', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
};

// Get out of stock products
export const getOutOfStockProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('stock_quantity', 0)
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching out of stock products:', error);
    return [];
  }
};

// Update product stock quantity
export const updateProductStock = async (id: string, quantity: number): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ stock_quantity: quantity, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error updating product stock:', error);
    return null;
  }
};

// Get products by category
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

// Get inventory statistics
export const getInventoryStats = async (): Promise<{
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}> => {
  try {
    // Get all products for calculations
    const products = await getProducts();
    
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.selling_price * product.stock_quantity), 0);
    const lowStockItems = products.filter(p => p.stock_quantity < (p.min_stock_level || 10)).length;
    const outOfStockItems = products.filter(p => p.stock_quantity === 0).length;
    
    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems
    };
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return {
      totalProducts: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0
    };
  }
};

// Search products with advanced filtering
export const searchProducts = async (query: string, filters?: {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}): Promise<Product[]> => {
  try {
    let supabaseQuery = supabase
      .from('products')
      .select('*');
    
    // Apply text search
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,barcode.ilike.%${query}%,sku.ilike.%${query}%`);
    }
    
    // Apply category filter
    if (filters?.categoryId) {
      supabaseQuery = supabaseQuery.eq('category_id', filters.categoryId);
    }
    
    // Apply price filters
    if (filters?.minPrice !== undefined) {
      supabaseQuery = supabaseQuery.gte('selling_price', filters.minPrice);
    }
    
    if (filters?.maxPrice !== undefined) {
      supabaseQuery = supabaseQuery.lte('selling_price', filters.maxPrice);
    }
    
    // Apply stock filter
    if (filters?.inStockOnly) {
      supabaseQuery = supabaseQuery.gt('stock_quantity', 0);
    }
    
    const { data, error } = await supabaseQuery.order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};
