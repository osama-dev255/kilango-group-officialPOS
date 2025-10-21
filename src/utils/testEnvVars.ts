// Test environment variables
export const testEnvVars = () => {
  console.log('Testing environment variables...');
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);
  
  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.error('ERROR: VITE_SUPABASE_URL is not set correctly');
    return false;
  }
  
  if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.error('ERROR: VITE_SUPABASE_ANON_KEY is not set correctly');
    return false;
  }
  
  console.log('Environment variables are set correctly');
  return true;
};