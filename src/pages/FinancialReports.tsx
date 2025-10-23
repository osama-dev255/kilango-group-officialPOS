// ... existing imports ...
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  PieChart, 
  TrendingUp, 
  Wallet, 
  FileText, 
  Calendar,
  Download,
  Filter,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrintUtils } from "@/utils/printUtils";

interface FinancialReportsProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
  onNavigate?: (destination: string) => void;
}

export const FinancialReports = ({ username, onBack, onLogout, onNavigate }: FinancialReportsProps) => {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Mock data for reports
  const mockIncomeData = {
    revenues: 125000,
    expenses: 85000,
    netProfit: 40000,
    period: "January 2024"
  };

  const mockBalanceData = {
    assets: 250000,
    liabilities: 100000,
    equity: 150000,
    period: "December 31, 2023"
  };

  const mockCashFlowData = {
    operating: 35000,
    investing: -15000,
    financing: 5000,
    netCash: 25000,
    period: "January 2024"
  };

  const handleViewReport = (reportType: string) => {
    // Navigate to specific report pages
    if (reportType === "Income Statement" && onNavigate) {
      onNavigate("income-statement");
      return;
    }
    
    setSelectedReport(reportType);
    toast({
      title: "Report Generated",
      description: `Your ${reportType} report has been generated successfully.`,
    });
  };

  const handlePrintReport = (reportType: string) => {
    // Create mock report data for printing
    let reportData: any = {};
    
    switch(reportType) {
      case "Income Statement":
        reportData = {
          title: "Income Statement",
          period: mockIncomeData.period,
          data: [
            { name: "Total Revenues", value: mockIncomeData.revenues },
            { name: "Total Expenses", value: mockIncomeData.expenses },
            { name: "Net Profit", value: mockIncomeData.netProfit }
          ]
        };
        break;
      case "Balance Sheet":
        reportData = {
          title: "Balance Sheet",
          period: mockBalanceData.period,
          data: [
            { name: "Total Assets", value: mockBalanceData.assets },
            { name: "Total Liabilities", value: mockBalanceData.liabilities },
            { name: "Total Equity", value: mockBalanceData.equity }
          ]
        };
        break;
      case "Cash Flow":
        reportData = {
          title: "Cash Flow Statement",
          period: mockCashFlowData.period,
          data: [
            { name: "Operating Activities", value: mockCashFlowData.operating },
            { name: "Investing Activities", value: mockCashFlowData.investing },
            { name: "Financing Activities", value: mockCashFlowData.financing },
            { name: "Net Cash Flow", value: mockCashFlowData.netCash }
          ]
        };
        break;
      default:
        reportData = {
          title: reportType,
          period: "Current Period",
          data: [
            { name: "Metric 1", value: 1000 },
            { name: "Metric 2", value: 2000 },
            { name: "Metric 3", value: 3000 }
          ]
        };
    }
    
    PrintUtils.printFinancialReport(reportData);
  };

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Export Started",
      description: `Exporting ${reportType} report as PDF...`,
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${reportType} report has been exported successfully.`,
      });
    }, 1500);
  };

  const reports = [
    {
      id: "income-statement",
      title: "Income Statement",
      description: "View your company's revenues, expenses, and profits over time",
      icon: BarChart,
      color: "bg-blue-50"
    },
    {
      id: "balance-sheet",
      title: "Balance Sheet",
      description: "See your company's assets, liabilities, and equity at a glance",
      icon: PieChart,
      color: "bg-green-50"
    },
    {
      id: "cash-flow",
      title: "Cash Flow",
      description: "Track the flow of cash in and out of your business",
      icon: TrendingUp,
      color: "bg-purple-50"
    },
    {
      id: "expense-report",
      title: "Expense Report",
      description: "Detailed breakdown of business expenses by category",
      icon: Wallet,
      color: "bg-yellow-50"
    },
    {
      id: "tax-summary",
      title: "Tax Summary",
      description: "Summary of tax obligations and payments",
      icon: FileText,
      color: "bg-red-50"
    },
    {
      id: "profitability",
      title: "Profitability Analysis",
      description: "Analyze which products or services are most profitable",
      icon: TrendingUp,
      color: "bg-indigo-50"
    }
  ];

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
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className={`${report.color} border border-gray-200 rounded-lg`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {report.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {report.description}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleViewReport(report.title)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handlePrintReport(report.title)}
                    >
                      <Download className="h-4 w-4" />
                      Print
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleExportReport(report.title)}
                    >
                      <FileText className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Custom Reports</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date Range
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            Create custom financial reports based on your specific needs
          </p>
          <Button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            Create Custom Report
          </Button>
        </div>
      </main>
    </div>
  );
};