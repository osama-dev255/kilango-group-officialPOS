import { Navigation } from "@/components/Navigation";
import { DashboardCard } from "@/components/DashboardCard";
import { 
  ShoppingCart,
  Package,
  Users,
  Truck,
  Wallet,
  Receipt,
  BarChart3,
  User,
  Shield,
  RotateCcw,
  Percent,
  AlertTriangle,
  Settings,
  Scan,
  Bot
} from "lucide-react";

interface DashboardProps {
  username: string;
  onNavigate: (module: string) => void;
  onLogout: () => void;
}

export const ComprehensiveDashboard = ({ username, onNavigate, onLogout }: DashboardProps) => {
  const modules = [
    {
      id: "sales",
      title: "Sales Management",
      description: "Process sales, manage transactions, and handle customer orders",
      icon: ShoppingCart,
      color: "bg-white border border-gray-200"
    },
    {
      id: "inventory",
      title: "Inventory Management",
      description: "Manage products, stock levels, and inventory tracking",
      icon: Package,
      color: "bg-white border border-gray-200"
    },
    {
      id: "customers",
      title: "Customer Management",
      description: "Manage customer information and loyalty programs",
      icon: Users,
      color: "bg-white border border-gray-200"
    },
    {
      id: "suppliers",
      title: "Supplier Management",
      description: "Manage supplier information and vendor relationships",
      icon: Truck,
      color: "bg-white border border-gray-200"
    },
    {
      id: "purchase",
      title: "Purchase Orders",
      description: "Create, track, and manage purchase orders",
      icon: Receipt,
      color: "bg-white border border-gray-200"
    },
    {
      id: "expenses",
      title: "Expense Tracking",
      description: "Track and manage business expenses and cash flow",
      icon: Wallet,
      color: "bg-white border border-gray-200"
    },
    {
      id: "returns",
      title: "Returns & Damages",
      description: "Manage product returns and damaged inventory",
      icon: RotateCcw,
      color: "bg-white border border-gray-200"
    },
    {
      id: "debts",
      title: "Debt Management",
      description: "Manage customer and supplier debts",
      icon: Wallet,
      color: "bg-white border border-gray-200"
    },
    {
      id: "customer-settlements",
      title: "Customer Settlements",
      description: "Manage customer debt settlements and payments",
      icon: Users,
      color: "bg-white border border-gray-200"
    },
    {
      id: "supplier-settlements",
      title: "Supplier Settlements",
      description: "Manage supplier payments and settlements",
      icon: Truck,
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
      id: "audit",
      title: "Inventory Audit",
      description: "Track and manage inventory discrepancies",
      icon: AlertTriangle,
      color: "bg-white border border-gray-200"
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      description: "View financial reports and business analytics",
      icon: BarChart3,
      color: "bg-white border border-gray-200"
    },
    {
      id: "employees",
      title: "Employee Management",
      description: "Manage staff members and permissions",
      icon: User,
      color: "bg-white border border-gray-200"
    },
    {
      id: "access-logs",
      title: "Access Logs",
      description: "Monitor user activity and system access",
      icon: Shield,
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
      description: "Quickly add products using barcode scanner",
      icon: Scan,
      color: "bg-white border border-gray-200"
    },
    {
      id: "automated",
      title: "Automated Dashboard",
      description: "View automated business insights and recommendations",
      icon: Bot,
      color: "bg-white border border-gray-200"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Comprehensive POS Dashboard" 
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {username}!</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Select a module to manage your business operations
          </p>
        </div>
        
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
          {modules.map((module) => (
            <DashboardCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              onClick={() => {
                console.log("Module clicked:", module.id);
                onNavigate(module.id);
              }}
              className={module.color}
            />
          ))}
        </div>
      </main>
    </div>
  );
};