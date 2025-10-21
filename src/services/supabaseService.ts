import { supabase } from '@/lib/supabaseClient';

// Test connection to Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple health check - try to get the current time from Supabase
    const { data, error } = await supabase.rpc('now');
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
};

// Example function to fetch data from a table
export const fetchDataFromTable = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    throw error;
  }
};

// Example function to insert data into a table
export const insertDataIntoTable = async (tableName: string, data: any) => {
  try {
    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();
      
    if (error) {
      throw error;
    }
    
    return insertedData;
  } catch (error) {
    console.error(`Error inserting data into ${tableName}:`, error);
    throw error;
  }
};