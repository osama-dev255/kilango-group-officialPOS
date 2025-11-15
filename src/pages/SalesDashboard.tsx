import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardCard } from "@/components/DashboardCard";
import { 
  Calculator, 
  Receipt, 
  BarChart3, 
  Users,
  ShoppingCart,
  Package,
  Percent,
  Settings,
  Scan,
  FileText
} from "lucide-react";
import { getAccessibleModules } from "@/utils/roleAccessControl";

interface SalesDashboardProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (module: string) => void;
}

export const SalesDashboard = ({ username, onBack, onLogout, onNavigate }: SalesDashboardProps) => {
  const [accessibleModules, setAccessibleModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const allSalesModules = [
    {
      id: "cart",
      title: "Sales Terminal",
      description: "Process new sales transactions and manage customer orders",
      icon: Calculator,
      color: "bg-white border border-gray-200"
    },
    {
      id: "orders",
      title: "Sales Orders",
      description: "View and manage all sales orders and transactions",
      icon: FileText,
      color: "bg-white border border-gray-200"
    },
    {
      id: "transactions",
      title: "Transaction History",
      description: "View and manage past sales transactions and receipts",
      icon: Receipt,
      color: "bg-white border border-gray-200"
    },
    {
      id: "analytics",
      title: "Sales Analytics",
      description: "Analyze sales performance, trends, and customer insights",
      icon: BarChart3,
      color: "bg-white border border-gray-200"
    },
    {
      id: "customers",
      title: "Customer Management",
      description: "Manage customer information and purchase history",
      icon: Users,
      color: "bg-white border border-gray-200"
    },
    {
      id: "products",
      title: "Product Management",
      description: "Manage product inventory and pricing",
      icon: Package,
      color: "bg-white border border-gray-200"
    },
    {
      id: "discounts",
      title: "Discount Management",
      description: "Manage promotional discounts and offers",
      icon: Percent,
      color: "bg-white border border-gray-200"
    },
    {
      id: "settings",
      title: "System Settings",
      description: "Configure POS system preferences and options",
      icon: Settings,
      color: "bg-white border border-gray-200"
    },
    {
      id: "scanner",
      title: "Scan Items",
      description: "Quickly add products to cart using barcode scanner",
      icon: Scan,
      color: "bg-white border border-gray-200"
    },
    {
      id: "test-data",
      title: "Test Data View",
      description: "View raw data for debugging purposes",
      icon: FileText,
      color: "bg-yellow-50 border border-yellow-200"
    },
  ];

  // Load accessible modules on component mount
  useEffect(() => {
    const loadAccessibleModules = async () => {
      try {
        const modules = await getAccessibleModules();
        setAccessibleModules(modules);
      } catch (error) {
        console.error("Error loading accessible modules:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAccessibleModules();
  }, []);

  // Filter modules based on user's access rights
  const salesModules = allSalesModules.filter(module => 
    accessibleModules.includes(module.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Sales Dashboard" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Sales Management</h2>
          <p className="text-muted-foreground">
            Choose a sales module to manage your transactions and customer data
          </p>
        </div>
        
        {salesModules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">You don't have access to any sales modules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salesModules.map((module) => (
              <DashboardCard
                key={module.id}
                title={module.title}
                description={module.description}
                icon={module.icon}
                onClick={() => onNavigate(module.id)}
                className={module.color}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};