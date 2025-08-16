import { Navigation } from "@/components/Navigation";
import { DashboardCard } from "@/components/DashboardCard";
import { 
  Calculator, 
  Receipt, 
  BarChart3, 
  Users 
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
      title: "Sales Cart",
      description: "Process new sales transactions and manage customer orders",
      icon: Calculator,
    },
    {
      id: "transactions",
      title: "Transaction History",
      description: "View and manage past sales transactions and receipts",
      icon: Receipt,
    },
    {
      id: "analytics",
      title: "Sales Analytics",
      description: "Analyze sales performance, trends, and customer insights",
      icon: BarChart3,
    },
    {
      id: "customers",
      title: "Customer Management",
      description: "Manage customer information and purchase history",
      icon: Users,
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {salesModules.map((module) => (
            <DashboardCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              onClick={() => onNavigate(module.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};