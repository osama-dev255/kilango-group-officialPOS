import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Printer, 
  Download, 
  Calendar, 
  Filter,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrintUtils } from "@/utils/printUtils";

interface IncomeStatementProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

export const IncomeStatement = ({ username, onBack, onLogout }: IncomeStatementProps) => {
  const { toast } = useToast();
  const [period, setPeriod] = useState("January 2024");

  // Mock data for the income statement
  const incomeStatementData = {
    businessName: "POS Business",
    period: period,
    revenue: {
      totalSales: 125000,
      salesReturns: 5000,
      netSales: 120000
    },
    cogs: {
      openingStock: 25000,
      purchases: 85000,
      closingStock: 30000,
      costOfGoodsSold: 80000
    },
    grossProfit: 40000,
    operatingExpenses: {
      salaries: 15000,
      rent: 8000,
      utilities: 3000,
      transport: 2500,
      officeSupplies: 1500,
      depreciation: 2000,
      otherExpenses: 3000,
      totalOperatingExpenses: 35000
    },
    operatingProfit: 5000,
    otherIncome: 1000,
    otherLosses: 500,
    profitBeforeTax: 5500,
    incomeTax: 1100,
    netProfit: 4400
  };

  const handlePrint = () => {
    PrintUtils.printIncomeStatement(incomeStatementData);
    toast({
      title: "Printing",
      description: "Income statement is being printed...",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Exporting income statement as PDF...",
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Income statement has been exported successfully.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Income Statement" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <Card className="border border-gray-200 rounded-lg">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{incomeStatementData.businessName}</h1>
              <h2 className="text-xl font-semibold mb-2">INCOME STATEMENT</h2>
              <p className="text-muted-foreground">For the period ended {incomeStatementData.period}</p>
            </div>
            
            {/* Income Statement Table */}
            <div className="space-y-4">
              {/* Revenue Section */}
              <div>
                <div className="grid grid-cols-3 gap-4 py-2 border-b">
                  <div className="font-semibold">Account</div>
                  <div className="font-semibold text-right">Amount (TZS)</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="font-semibold">Revenue / Sales</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Total Sales</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.revenue.totalSales.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Less: Sales Returns & Allowances</div>
                  <div className="text-right">({incomeStatementData.revenue.salesReturns.toLocaleString()})</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-2 pl-4 font-semibold border-b">
                  <div>Net Sales</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.revenue.netSales.toLocaleString()}</div>
                </div>
              </div>
              
              {/* COGS Section */}
              <div>
                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="font-semibold">Cost of Goods Sold (COGS)</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Opening Stock</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.cogs.openingStock.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Add: Purchases</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.cogs.purchases.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Less: Closing Stock</div>
                  <div className="text-right">({incomeStatementData.cogs.closingStock.toLocaleString()})</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-2 pl-4 font-semibold border-b">
                  <div>Cost of Goods Sold</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.cogs.costOfGoodsSold.toLocaleString()}</div>
                </div>
              </div>
              
              {/* Gross Profit */}
              <div className="grid grid-cols-3 gap-4 py-2 font-semibold">
                <div>Gross Profit</div>
                <div></div>
                <div className="text-right">{incomeStatementData.grossProfit.toLocaleString()}</div>
              </div>
              
              {/* Operating Expenses Section */}
              <div>
                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="font-semibold">Operating Expenses:</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Salaries & Wages</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.operatingExpenses.salaries.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Rent Expense</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.operatingExpenses.rent.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Utilities (Electricity, Water, etc)</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.operatingExpenses.utilities.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Transport & Fuel</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.operatingExpenses.transport.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Office Supplies</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.operatingExpenses.officeSupplies.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Depreciation</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.operatingExpenses.depreciation.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-1 pl-4">
                  <div>Other Expenses</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.operatingExpenses.otherExpenses.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-2 pl-4 font-semibold border-b">
                  <div>Total Operating Expenses</div>
                  <div></div>
                  <div className="text-right">{incomeStatementData.operatingExpenses.totalOperatingExpenses.toLocaleString()}</div>
                </div>
              </div>
              
              {/* Operating Profit */}
              <div className="grid grid-cols-3 gap-4 py-2 font-semibold">
                <div>Operating Profit (EBIT)</div>
                <div></div>
                <div className="text-right">{incomeStatementData.operatingProfit.toLocaleString()}</div>
              </div>
              
              {/* Other Income/Losses */}
              <div className="grid grid-cols-3 gap-4 py-1">
                <div>Add: Other Income (e.g. interest)</div>
                <div></div>
                <div className="text-right">{incomeStatementData.otherIncome.toLocaleString()}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-1">
                <div>Less: Other Losses (if any)</div>
                <div className="text-right">({incomeStatementData.otherLosses.toLocaleString()})</div>
              </div>
              
              {/* Profit Before Tax */}
              <div className="grid grid-cols-3 gap-4 py-2 font-semibold">
                <div>Profit Before Tax</div>
                <div></div>
                <div className="text-right">{incomeStatementData.profitBeforeTax.toLocaleString()}</div>
              </div>
              
              {/* Income Tax */}
              <div className="grid grid-cols-3 gap-4 py-1">
                <div>Less: Income Tax</div>
                <div className="text-right">({incomeStatementData.incomeTax.toLocaleString()})</div>
              </div>
              
              {/* Net Profit */}
              <div className="grid grid-cols-3 gap-4 py-2 font-bold text-lg border-t-2 border-b-2">
                <div>Net Profit (Loss)</div>
                <div></div>
                <div className="text-right">{incomeStatementData.netProfit.toLocaleString()}</div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Prepared on: {new Date().toLocaleDateString()}</p>
              <p className="mt-1">Confidential - For Internal Use Only</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};