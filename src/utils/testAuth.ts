import { signUp, signIn, signOut, getCurrentUser } from '@/services/authService';

// Test authentication functions
export const testAuthentication = async () => {
  try {
    console.log('Testing authentication functions...');
    
    // Test getCurrentUser (should be null if not logged in)
    const currentUser = await getCurrentUser();
    console.log('Current user:', currentUser);
    
    console.log('Authentication test completed');
    return { success: true, currentUser };
  } catch (error) {
    console.error('Authentication test failed:', error);
    return { success: false, error };
  }
};

// Run the test if this file is executed directly
if (import.meta.env.DEV) {
  testAuthentication();
}