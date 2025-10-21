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
  Scan
} from "lucide-react";

interface SalesDashboardProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (module: string) => void;
}

export const SalesDashboard = ({ username, onBack, onLogout, onNavigate }: SalesDashboardProps) => {
  const salesModules = [
    {
      id: "cart",
      title: "Sales Terminal",
      description: "Process new sales transactions and manage customer orders",
      icon: Calculator,
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
  ];

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
      </main>
    </div>
  );
};