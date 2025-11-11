import { supabase } from '@/lib/supabaseClient';
import { User } from '@/services/databaseService';

/**
 * Check if the current user has permission to create sales
 * @returns Promise<boolean> - True if user can create sales, false otherwise
 */
export const canCreateSales = async (): Promise<boolean> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // If no user is logged in, they can't create sales
    if (!user) {
      return false;
    }
    
    // Get user details from the database
    const { data, error } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user details:', error);
      return false;
    }
    
    // Check if user is active and has the right role
    if (data && data.is_active && (data.role === 'salesman' || data.role === 'admin')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking sales permission:', error);
    return false;
  }
};

/**
 * Get the current user's role
 * @returns Promise<string | null> - User's role or null if not available
 */
export const getCurrentUserRole = async (): Promise<string | null> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // If no user is logged in, return null
    if (!user) {
      return null;
    }
    
    // Get user details from the database
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    return data?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};