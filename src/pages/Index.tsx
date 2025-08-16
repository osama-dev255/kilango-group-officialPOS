import { useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { Dashboard } from "@/pages/Dashboard";
import { SalesDashboard } from "@/pages/SalesDashboard";
import { SalesCart } from "@/pages/SalesCart";

type ViewState = "login" | "dashboard" | "sales" | "sales-cart" | "inventory" | "purchase" | "finance";

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>("login");
  const [user, setUser] = useState<{ username: string } | null>(null);

  const handleLogin = (credentials: { username: string; password: string }) => {
    // In a real app, you would validate credentials with Google Sheets
    setUser({ username: credentials.username });
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("login");
  };

  const handleNavigate = (destination: string) => {
    switch (destination) {
      case "sales":
        setCurrentView("sales");
        break;
      case "cart":
        setCurrentView("sales-cart");
        break;
      case "inventory":
      case "purchase":
      case "finance":
        // These will be implemented later
        setCurrentView(destination as ViewState);
        break;
      default:
        setCurrentView("dashboard");
    }
  };

  const handleBack = () => {
    switch (currentView) {
      case "sales":
        setCurrentView("dashboard");
        break;
      case "sales-cart":
        setCurrentView("sales");
        break;
      default:
        setCurrentView("dashboard");
    }
  };

  if (currentView === "login") {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  switch (currentView) {
    case "dashboard":
      return (
        <Dashboard
          username={user.username}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      );
    case "sales":
      return (
        <SalesDashboard
          username={user.username}
          onBack={handleBack}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );
    case "sales-cart":
      return (
        <SalesCart
          username={user.username}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Dashboard
            </h1>
            <p className="text-muted-foreground mb-4">This module is coming soon!</p>
            <button 
              onClick={handleBack}
              className="text-primary hover:underline"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      );
  }
};

export default Index;
