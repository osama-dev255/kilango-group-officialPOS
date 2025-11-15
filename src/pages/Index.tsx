import { useState, useEffect } from "react";
import { LoginForm } from "@/components/LoginForm";
import { ComprehensiveDashboard } from "@/pages/ComprehensiveDashboard";
import { SalesDashboard } from "@/pages/SalesDashboard";
import { SalesCart } from "@/pages/SalesCart";
import { SalesOrders } from "@/pages/SalesOrders";
import { TestSalesOrders } from "@/pages/TestSalesOrders";
import { ProductManagement } from "@/pages/ProductManagement";
import { CustomerManagement } from "@/pages/CustomerManagement";
import { TransactionHistory } from "@/pages/TransactionHistory";
import { SalesAnalytics } from "@/pages/SalesAnalytics";
import { SpendingAnalytics } from "@/pages/SpendingAnalytics";
import { EmployeeManagement } from "@/pages/EmployeeManagement";
import { SupplierManagement } from "@/pages/SupplierManagement";
import { PurchaseOrders } from "@/pages/PurchaseOrders";
import { PurchaseDashboard } from "@/pages/PurchaseDashboard";
import { PurchaseTerminal } from "@/pages/PurchaseTerminal";
import { PurchaseTransactionHistory } from "@/pages/PurchaseTransactionHistory";
import { PurchaseReports } from "@/pages/PurchaseReports";
import { ExpenseManagement } from "@/pages/ExpenseManagement";
import { ReturnsManagement } from "@/pages/ReturnsManagement";
import { DebtManagement } from "@/pages/DebtManagement";
import { CustomerSettlements } from "@/pages/CustomerSettlements";
import { SupplierSettlements } from "@/pages/SupplierSettlements";
import { DiscountManagement } from "@/pages/DiscountManagement";
import { InventoryAudit } from "@/pages/InventoryAudit";
import { AccessLogs } from "@/pages/AccessLogs";
import { FinanceDashboard } from "@/pages/FinanceDashboard";
import { FinancialReports } from "@/pages/FinancialReports";
import { IncomeStatement } from "@/pages/IncomeStatement";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { AutomatedDashboard } from "@/pages/AutomatedDashboard";
import { SplashScreen } from "@/components/SplashScreen";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUserRole } from "@/utils/salesPermissionUtils";
import { canAccessModule } from "@/utils/roleAccessControl";
import { useToast } from "@/hooks/use-toast";

type ViewState = "login" | "dashboard" | "sales" | "sales-cart" | "sales-orders" | "test-sales-orders" | "inventory" | "products" | "purchase" | "finance" | "customers" | "transactions" | "analytics" | "sales-analytics" | "spending-analytics" | "employees" | "suppliers" | "purchase-orders" | "purchase-terminal" | "purchase-transactions" | "purchase-reports" | "expenses" | "returns" | "debts" | "customer-settlements" | "supplier-settlements" | "discounts" | "audit" | "access-logs" | "comprehensive" | "reports" | "financial-reports" | "income-statement" | "statements-reports" | "settings" | "automated";

const Index = () => {
  const { user, login } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>(user ? "comprehensive" : "login");
  const [showSplash, setShowSplash] = useState(true);
  const { toast } = useToast();

  // Hide splash screen after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      // Try Supabase authentication first
      const result = await login(credentials.username, credentials.password);
      
      if (result.error) {
        // If Supabase auth fails due to email confirmation, show specific error
        if (result.error.message && result.error.message.includes('Email not confirmed')) {
          console.warn("Email not confirmed:", result.error.message);
          // In a real application, you would show this error to the user
          console.warn("Email not confirmed. Please check email and confirm before logging in.");
        }
        // No mock authentication fallback - just show error
        console.error("Authentication failed:", result.error);
      } else {
        // Supabase auth successful
        console.log("Supabase auth successful:", result);
        
        // Get user role and redirect based on role
        const userRole = await getCurrentUserRole();
        
        switch (userRole) {
          case 'admin':
            setCurrentView("comprehensive");
            break;
          case 'manager':
            setCurrentView("comprehensive");
            break;
          case 'cashier':
            setCurrentView("sales");
            break;
          case 'staff':
            setCurrentView("sales");
            break;
          default:
            // Default to comprehensive dashboard for unknown roles
            setCurrentView("comprehensive");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = () => {
    setCurrentView("login");
  };

  const handleNavigate = async (destination: string) => {
    // Check if user has access to the requested module
    const hasAccess = await canAccessModule(destination);
    
    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this module.",
        variant: "destructive",
      });
      return;
    }
    
    switch (destination) {
      case "sales":
        setCurrentView("sales");
        break;
      case "cart":
        setCurrentView("sales-cart");
        break;
      case "orders":
        setCurrentView("sales-orders");
        break;
      case "test-sales-orders":
        setCurrentView("test-sales-orders");
        break;
      case "inventory":
      case "products":
        setCurrentView("products");
        break;
      case "purchase":
        setCurrentView("purchase");
        break;
      case "finance":
        setCurrentView("finance");
        break;
      case "customers":
        setCurrentView("customers");
        break;
      case "transactions":
        console.log("Handling navigation to transactions - setting view to transactions");
        setCurrentView("transactions");
        break;
      case "analytics":
        setCurrentView("sales-analytics");
        break;
      case "employees":
        setCurrentView("employees");
        break;
      case "suppliers":
        setCurrentView("suppliers");
        break;
      case "purchase-orders":
        setCurrentView("purchase-orders");
        break;
      case "purchase-terminal":
        setCurrentView("purchase-terminal");
        break;
      case "purchase-transactions":
        setCurrentView("purchase-transactions");
        break;
      case "purchase-reports":
        setCurrentView("purchase-reports");
        break;
      case "expenses":
        setCurrentView("expenses");
        break;
      case "returns":
        setCurrentView("returns");
        break;
      case "debts":
        setCurrentView("debts");
        break;
      case "customer-settlements":
        setCurrentView("customer-settlements");
        break;
      case "supplier-settlements":
        setCurrentView("supplier-settlements");
        break;
      case "discounts":
        setCurrentView("discounts");
        break;
      case "audit":
        setCurrentView("audit");
        break;
      case "access-logs":
        setCurrentView("access-logs");
        break;
      case "comprehensive":
        setCurrentView("comprehensive");
        break;
      case "reports":
        // Show financial management dashboard instead of going directly to reports
        setCurrentView("finance");
        break;
      case "financial-reports":
        // Show financial reports page
        setCurrentView("financial-reports");
        break;
      case "statements-reports":
        // Show statements and reports page
        setCurrentView("statements-reports");
        break;
      case "income-statement":
        // Show income statement view
        setCurrentView("income-statement");
        break;
      case "settings":
        setCurrentView("settings");
        break;
      case "scanner":
        setCurrentView("sales-cart");
        break;
      case "automated":
        setCurrentView("automated");
        break;
      default:
        console.log("Unknown destination:", destination);
        console.log("Current view set to comprehensive as fallback");
        setCurrentView("comprehensive");
        break;
    }
  };

  const handleBack = () => {
    switch (currentView) {
      case "sales":
        setCurrentView("comprehensive");
        break;
      case "sales-cart":
        setCurrentView("sales");
        break;
      case "sales-orders":
        setCurrentView("sales");
        break;
      case "test-sales-orders":
        setCurrentView("comprehensive");
        break;
      case "products":
        setCurrentView("comprehensive");
        break;
      case "customers":
        setCurrentView("sales");
        break;
      case "transactions":
        setCurrentView("finance");
        break;
      case "sales-analytics":
        setCurrentView("comprehensive");
        break;
      case "spending-analytics":
        setCurrentView("comprehensive");
        break;
      case "employees":
        setCurrentView("comprehensive");
        break;
      case "suppliers":
        setCurrentView("comprehensive");
        break;
      case "purchase-orders":
        setCurrentView("purchase");
        break;
      case "purchase-terminal":
        setCurrentView("purchase");
        break;
      case "purchase-transactions":
        setCurrentView("purchase");
        break;
      case "purchase-reports":
        setCurrentView("purchase");
        break;
      case "expenses":
        setCurrentView("finance");
        break;
      case "returns":
        setCurrentView("comprehensive");
        break;
      case "debts":
        setCurrentView("finance");
        break;
      case "customer-settlements":
        setCurrentView("finance");
        break;
      case "supplier-settlements":
        setCurrentView("finance");
        break;
      case "discounts":
        setCurrentView("comprehensive");
        break;
      case "audit":
        setCurrentView("comprehensive");
        break;
      case "access-logs":
        setCurrentView("comprehensive");
        break;
      case "finance":
        setCurrentView("comprehensive");
        break;
      case "financial-reports":
        setCurrentView("finance");
        break;
      case "income-statement":
        setCurrentView("finance");
        break;
      case "statements-reports":
        setCurrentView("finance");
        break;
      case "settings":
        setCurrentView("comprehensive");
        break;
      case "automated":
        setCurrentView("comprehensive");
        break;
      default:
        setCurrentView("comprehensive");
        break;
    }
  };

  // Only show dashboards if user is authenticated
  if (currentView !== "login" && !user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (showSplash) {
    return <SplashScreen />;
  }

  if (currentView === "login" || !user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Render the appropriate view based on currentView state
  switch (currentView) {
    case "dashboard":
      return (
        <ComprehensiveDashboard
          username={user?.email || "User"}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      );
    case "sales":
      return (
        <SalesDashboard
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );
    case "sales-cart":
      return (
        <SalesCart
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "sales-orders":
      return (
        <SalesOrders
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "test-sales-orders":
      return (
        <TestSalesOrders
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "products":
      return (
        <ProductManagement
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "customers":
      return (
        <CustomerManagement
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "transactions":
      return (
        <TransactionHistory
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "sales-analytics":
      return (
        <SalesAnalytics
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "spending-analytics":
      return (
        <SpendingAnalytics
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "employees":
      return (
        <EmployeeManagement
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "suppliers":
      return (
        <SupplierManagement
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "purchase-orders":
      return (
        <PurchaseOrders
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "purchase":
      return (
        <PurchaseDashboard
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );
    case "purchase-terminal":
      return (
        <PurchaseTerminal
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "purchase-transactions":
      return (
        <PurchaseTransactionHistory
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "purchase-reports":
      return (
        <PurchaseReports
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "expenses":
      return (
        <ExpenseManagement
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "returns":
      return (
        <ReturnsManagement
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "debts":
      return (
        <DebtManagement
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "customer-settlements":
      return (
        <CustomerSettlements
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "supplier-settlements":
      return (
        <SupplierSettlements
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "discounts":
      return (
        <DiscountManagement
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "audit":
      return (
        <InventoryAudit
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "access-logs":
      return (
        <AccessLogs
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "comprehensive":
      return (
        <ComprehensiveDashboard
          username={user?.email || "User"}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      );
    case "finance":
      return (
        <FinanceDashboard
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );
    case "financial-reports":
      return (
        <FinancialReports
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "income-statement":
      return (
        <IncomeStatement
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "reports":
      return (
        <Reports
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "statements-reports":
      return (
        <Reports
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "settings":
      return (
        <Settings
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "automated":
      return (
        <AutomatedDashboard
          username={user?.email || "User"}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    default:
      return (
        <ComprehensiveDashboard
          username={user?.email || "User"}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      );
  }
};

export default Index;