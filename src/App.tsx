import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Dashboard } from "./pages/Dashboard";
import { SalesDashboard } from "./pages/SalesDashboard";
import { SalesCart } from "./pages/SalesCart";
import { useEffect } from "react";
// Import authentication context
import { AuthProvider } from "@/contexts/AuthContext";

// Import Supabase test function
import { testSupabaseConnection } from "@/services/supabaseService";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Test Supabase connection on app start
    testSupabaseConnection().then((isConnected) => {
      if (isConnected) {
        console.log("Successfully connected to Supabase!");
      } else {
        console.warn("Failed to connect to Supabase. Please check your credentials in the .env file.");
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard username="admin" onNavigate={() => {}} onLogout={() => {}} />} />
              <Route path="/sales" element={<SalesDashboard username="admin" onBack={() => {}} onLogout={() => {}} onNavigate={() => {}} />} />
              <Route path="/sales/cart" element={<SalesCart username="admin" onBack={() => {}} onLogout={() => {}} />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;