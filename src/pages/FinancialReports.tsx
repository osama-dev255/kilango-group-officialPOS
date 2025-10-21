import { Navigation } from "@/components/Navigation";

interface FinancialReportsProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

export const FinancialReports = ({ username, onBack, onLogout }: FinancialReportsProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Financial Reports" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Financial Reports</h2>
          <p className="text-muted-foreground">
            Detailed financial statements and analytics
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Income Statement</h3>
            <p className="text-muted-foreground mb-4">
              View your company's revenues, expenses, and profits over time
            </p>
            <button className="text-primary hover:underline">
              View Report →
            </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Balance Sheet</h3>
            <p className="text-muted-foreground mb-4">
              See your company's assets, liabilities, and equity at a glance
            </p>
            <button className="text-primary hover:underline">
              View Report →
            </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Cash Flow</h3>
            <p className="text-muted-foreground mb-4">
              Track the flow of cash in and out of your business
            </p>
            <button className="text-primary hover:underline">
              View Report →
            </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Expense Report</h3>
            <p className="text-muted-foreground mb-4">
              Detailed breakdown of business expenses by category
            </p>
            <button className="text-primary hover:underline">
              View Report →
            </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Tax Summary</h3>
            <p className="text-muted-foreground mb-4">
              Summary of tax obligations and payments
            </p>
            <button className="text-primary hover:underline">
              View Report →
            </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Profitability Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Analyze which products or services are most profitable
            </p>
            <button className="text-primary hover:underline">
              View Report →
            </button>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Custom Reports</h3>
          <p className="text-muted-foreground mb-4">
            Create custom financial reports based on your specific needs
          </p>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            Create Custom Report
          </button>
        </div>
      </main>
    </div>
  );
};