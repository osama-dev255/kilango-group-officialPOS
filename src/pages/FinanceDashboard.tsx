import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardCard } from "@/components/DashboardCard";
import { 
  Wallet,
  TrendingUp,
  PieChart,
  FileText,
  BarChart3,
  Settings,
  Bot
} from "lucide-react";
import { getAccessibleModules } from "@/utils/roleAccessControl";

interface FinanceDashboardProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (module: string) => void;
}

export const FinanceDashboard = ({ username, onBack, onLogout, onNavigate }: FinanceDashboardProps) => {
  const [accessibleModules, setAccessibleModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const allFinanceModules = [
    {
      id: "expenses",
      title: "Expense Tracking",
      description: "Track and manage business expenses and cash flow",
      icon: Wallet,
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
      icon: TrendingUp,
      color: "bg-white border border-gray-200"
    },
    {
      id: "supplier-settlements",
      title: "Supplier Settlements",
      description: "Manage supplier payments and settlements",
      icon: PieChart,
      color: "bg-white border border-gray-200"
    },
    {
      id: "reports",
      title: "Financial Reports",
      description: "View detailed financial reports and statements",
      icon: FileText,
      color: "bg-white border border-gray-200"
    },
    {
      id: "financial-statements",
      title: "Financial Statements",
      description: "Access income statement, balance sheet, and cash flow statements",
      icon: FileText,
      color: "bg-white border border-gray-200"
    },
    {
      id: "analytics",
      title: "Financial Analytics",
      description: "Analyze financial performance and trends",
      icon: BarChart3,
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
      id: "automated",
      title: "Automated Dashboard",
      description: "View automated business insights and recommendations",
      icon: Bot,
      color: "bg-white border border-gray-200"
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
  const financeModules = allFinanceModules.filter(module => 
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
        title="Financial Management" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Financial Management</h2>
          <p className="text-muted-foreground">
            Manage expenses, debts, and financial reporting
          </p>
        </div>
        
        {financeModules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">You don't have access to any finance modules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financeModules.map((module) => (
              <DashboardCard
                key={module.id}
                title={module.title}
                description={module.description}
                icon={module.icon}
                onClick={() => {
                  // Special handling for reports module
                  if (module.id === "reports") {
                    console.log("Financial reports module clicked");
                    onNavigate("statements-reports");
                    return;
                  }
                  // Special handling for financial statements module
                  if (module.id === "financial-statements") {
                    console.log("Financial statements module clicked");
                    onNavigate("financial-reports");
                    return;
                  }
                  onNavigate(module.id);
                }}
                className={module.color}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};