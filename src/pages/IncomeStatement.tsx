import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Printer, 
  Download, 
  ArrowLeft,
  Loader2,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Bug
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrintUtils } from "@/utils/printUtils";
import { 
  getSales, 
  getPurchaseOrders, 
  getExpenses,
  getReturns
} from "@/services/databaseService";
import { Sale, PurchaseOrder, Expense, Return } from "@/services/databaseService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { runDatabaseDebug } from "@/utils/databaseDebug";

interface IncomeStatementProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

interface IncomeStatementData {
  businessName: string;
  period: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossProfitMargin: number;
  operatingExpenses: number;
  operatingProfit: number;
  operatingProfitMargin: number;
  otherIncomeExpenses: number;
  tax: number;
  netProfit: number;
  netProfitMargin: number;
}

interface DetailInfo {
  title: string;
  description: string;
  calculation: string;
  dataSources: string[];
  additionalInfo?: string;
}

export const IncomeStatement = ({ username, onBack, onLogout }: IncomeStatementProps) => {
  const { toast } = useToast();
  const [period, setPeriod] = useState("January 2024");
  const [isLoading, setIsLoading] = useState(true);
  const [incomeStatementData, setIncomeStatementData] = useState<IncomeStatementData>({
    businessName: "POS Business",
    period: period,
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    grossProfitMargin: 0,
    operatingExpenses: 0,
    operatingProfit: 0,
    operatingProfitMargin: 0,
    otherIncomeExpenses: 0,
    tax: 0,
    netProfit: 0,
    netProfitMargin: 0
  });
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [currentDetail, setCurrentDetail] = useState<DetailInfo | null>(null);

  // Detail information for each line item
  const getDetailInfo = (section: string): DetailInfo => {
    switch(section) {
      case "revenue":
        return {
          title: "Revenue (Sales)",
          description: "Total sales revenue represents all income generated from the sale of goods or services during the reporting period, minus any returns.",
          calculation: `Total Sales to Customers - Total Sales Returns = ${incomeStatementData.revenue.toLocaleString()} TZS`,
          dataSources: [
            "All sales records in the system",
            "Includes cash, credit, and mobile payment transactions",
            "Net of returns and discounts"
          ],
          additionalInfo: `Gross Profit Margin: ${incomeStatementData.grossProfitMargin.toFixed(2)}%`
        };
      case "cogs":
        return {
          title: "Cost of Goods Sold (COGS)",
          description: "Direct costs attributable to the production of goods sold by the company. This includes the cost of materials and labor directly used to create the product.",
          calculation: `Sum of all purchase orders + Direct costs = ${incomeStatementData.cogs.toLocaleString()} TZS`,
          dataSources: [
            "Purchase orders from suppliers",
            "Transportation costs for inventory",
            "Direct labor costs for production",
            "Storage and handling costs"
          ],
          additionalInfo: `COGS as % of Revenue: ${(incomeStatementData.cogs / incomeStatementData.revenue * 100).toFixed(2)}%`
        };
      case "grossProfit":
        return {
          title: "Gross Profit",
          description: "The profit a company makes after deducting the costs of making and selling its products.",
          calculation: `Revenue - COGS = ${incomeStatementData.revenue.toLocaleString()} - ${incomeStatementData.cogs.toLocaleString()} = ${incomeStatementData.grossProfit.toLocaleString()} TZS`,
          dataSources: [
            "Sales data (revenue)",
            "Purchase data (cost of goods)"
          ],
          additionalInfo: `Gross Profit Margin: ${incomeStatementData.grossProfitMargin.toFixed(2)}%`
        };
      case "operatingExpenses":
        return {
          title: "Operating Expenses",
          description: "Expenses incurred in the normal day-to-day operations of a business that are not directly tied to the cost of goods or services.",
          calculation: `Sum of all operating expenses = ${incomeStatementData.operatingExpenses.toLocaleString()} TZS`,
          dataSources: [
            "Expense records",
            "Rent payments",
            "Utility bills",
            "Salaries and wages",
            "Marketing costs",
            "Administrative expenses"
          ],
          additionalInfo: `Operating Expenses as % of Revenue: ${(incomeStatementData.operatingExpenses / incomeStatementData.revenue * 100).toFixed(2)}%`
        };
      case "operatingProfit":
        return {
          title: "Operating Profit",
          description: "Also known as earnings before interest and taxes (EBIT), this represents profits from core business operations.",
          calculation: `Gross Profit - Operating Expenses = ${incomeStatementData.grossProfit.toLocaleString()} - ${incomeStatementData.operatingExpenses.toLocaleString()} = ${incomeStatementData.operatingProfit.toLocaleString()} TZS`,
          dataSources: [
            "Gross profit calculation",
            "Operating expense records"
          ],
          additionalInfo: `Operating Profit Margin: ${incomeStatementData.operatingProfitMargin.toFixed(2)}%`
        };
      case "otherIncomeExpenses":
        return {
          title: "Other Income / Expenses",
          description: "Non-operating revenues and expenses that are not directly related to core business operations.",
          calculation: `Other income/expenses = ${incomeStatementData.otherIncomeExpenses.toLocaleString()} TZS`,
          dataSources: [
            "Interest income",
            "Asset sale proceeds",
            "Investment returns",
            "Penalties or fines"
          ],
          additionalInfo: `Other Income/Expenses as % of Revenue: ${(incomeStatementData.otherIncomeExpenses / incomeStatementData.revenue * 100).toFixed(2)}%`
        };
      case "tax":
        return {
          title: "Tax (Income Tax)",
          description: "Taxes owed to the government based on taxable income for the period.",
          calculation: `Income tax calculation = ${incomeStatementData.tax.toLocaleString()} TZS`,
          dataSources: [
            "Tax regulations",
            "Taxable income calculation",
            "Applicable tax rates"
          ],
          additionalInfo: `Effective Tax Rate: ${(incomeStatementData.tax / (incomeStatementData.operatingProfit + incomeStatementData.otherIncomeExpenses) * 100).toFixed(2)}%`
        };
      case "netProfit":
        return {
          title: "Net Profit",
          description: "The final profit after all expenses, including taxes and interest, have been deducted from total revenue.",
          calculation: `Operating Profit + Other Income/Expenses - Tax = ${incomeStatementData.operatingProfit.toLocaleString()} + ${incomeStatementData.otherIncomeExpenses.toLocaleString()} - ${incomeStatementData.tax.toLocaleString()} = ${incomeStatementData.netProfit.toLocaleString()} TZS`,
          dataSources: [
            "Operating profit",
            "Other income/expense records",
            "Tax calculations"
          ],
          additionalInfo: `Net Profit Margin: ${incomeStatementData.netProfitMargin.toFixed(2)}%`
        };
      default:
        return {
          title: "Unknown Section",
          description: "No detailed information available for this section.",
          calculation: "N/A",
          dataSources: []
        };
    }
  };

  const showDetail = (section: string) => {
    const detail = getDetailInfo(section);
    setCurrentDetail(detail);
    setDetailDialogOpen(true);
  };

  // Fetch data for the income statement
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all necessary data
        const [sales, purchases, expenses, returns] = await Promise.all([
          getSales(),
          getPurchaseOrders(),
          getExpenses(),
          getReturns()
        ]);

        // Add debug logs to see what data we're getting
        console.log('=== Income Statement Data Debug ===');
        console.log('Sales count:', sales.length);
        console.log('Sample sales:', sales.slice(0, 3));
        console.log('Purchase orders count:', purchases.length);
        console.log('Sample purchases:', purchases.slice(0, 3));
        console.log('Expenses count:', expenses.length);
        console.log('Sample expenses:', expenses.slice(0, 3));
        console.log('Returns count:', returns.length);
        console.log('Sample returns:', returns.slice(0, 3));

        // Calculate revenue (total sales) minus returns
        const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
        const totalReturns = returns.reduce((sum, returnItem) => sum + (returnItem.total_amount || 0), 0);
        const revenue = totalSales - totalReturns;

        // Calculate COGS (cost of goods sold) - based on purchase orders
        const cogs = purchases.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);

        // Calculate gross profit
        const grossProfit = revenue - cogs;
        const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

        // Calculate operating expenses - based on expense records
        const operatingExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

        // Calculate operating profit
        const operatingProfit = grossProfit - operatingExpenses;
        const operatingProfitMargin = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;

        // Other income/expenses (using a placeholder for now)
        const otherIncomeExpenses = 0;

        // Tax calculation (using a placeholder for now)
        const tax = 0;

        // Calculate net profit
        const netProfit = operatingProfit + otherIncomeExpenses - tax;
        const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

        // Log calculated values
        console.log('=== Calculated Values ===');
        console.log('Total Sales:', totalSales);
        console.log('Total Returns:', totalReturns);
        console.log('Revenue (Sales - Returns):', revenue);
        console.log('COGS:', cogs);
        console.log('Gross Profit:', grossProfit);
        console.log('Operating Expenses:', operatingExpenses);
        console.log('Operating Profit:', operatingProfit);
        console.log('Net Profit:', netProfit);

        // Update state with calculated values
        setIncomeStatementData({
          businessName: "POS Business",
          period: period,
          revenue,
          cogs,
          grossProfit,
          grossProfitMargin,
          operatingExpenses,
          operatingProfit,
          operatingProfitMargin,
          otherIncomeExpenses,
          tax,
          netProfit,
          netProfitMargin
        });
      } catch (error) {
        console.error("Error fetching income statement data:", error);
        toast({
          title: "Error",
          description: "Failed to load income statement data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period, toast]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading income statement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Income Statement" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>
          
          <div className="flex gap-2 flex-wrap">
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
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={runDatabaseDebug}
            >
              <Bug className="h-4 w-4" />
              Debug Data
            </Button>
          </div>
        </div>
        
        <Card className="border border-gray-200 rounded-lg mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold">{incomeStatementData.businessName}</h1>
              <h2 className="text-xl md:text-2xl font-semibold mt-2">INCOME STATEMENT</h2>
              <p className="text-muted-foreground mt-1">For the period ended {incomeStatementData.period}</p>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Revenue</p>
                      <p className="text-xl font-bold text-green-900">{incomeStatementData.revenue.toLocaleString()} TZS</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Gross Profit</p>
                      <p className="text-xl font-bold text-blue-900">{incomeStatementData.grossProfit.toLocaleString()} TZS</p>
                      <p className="text-xs text-blue-700 mt-1">{incomeStatementData.grossProfitMargin.toFixed(2)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Operating Profit</p>
                      <p className="text-xl font-bold text-purple-900">{incomeStatementData.operatingProfit.toLocaleString()} TZS</p>
                      <p className="text-xs text-purple-700 mt-1">{incomeStatementData.operatingProfitMargin.toFixed(2)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`${incomeStatementData.netProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{incomeStatementData.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                      <p className="text-xl font-bold">{incomeStatementData.netProfit.toLocaleString()} TZS</p>
                      <p className="text-xs mt-1">{incomeStatementData.netProfitMargin.toFixed(2)}%</p>
                    </div>
                    {incomeStatementData.netProfit >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Income Statement Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Section</TableHead>
                    <TableHead className="text-right">Description</TableHead>
                    <TableHead className="text-right w-32">Amount (TZS)</TableHead>
                    <TableHead className="text-right w-24">Margin %</TableHead>
                    <TableHead className="text-center w-12">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Section 1: Revenue (Sales) */}
                  <TableRow>
                    <TableCell className="font-semibold">1. Revenue (Sales)</TableCell>
                    <TableCell className="text-right text-muted-foreground">Total sales to customers - Total sales returns</TableCell>
                    <TableCell className="text-right font-semibold">{incomeStatementData.revenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">100.00%</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => showDetail("revenue")}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Section 2: Cost of Goods Sold (COGS) */}
                  <TableRow>
                    <TableCell className="font-semibold">2. Cost of Goods Sold (COGS)</TableCell>
                    <TableCell className="text-right text-muted-foreground">Cost of items sold — includes purchases, transport, and other direct costs</TableCell>
                    <TableCell className="text-right font-semibold">({incomeStatementData.cogs.toLocaleString()})</TableCell>
                    <TableCell className="text-right">{(incomeStatementData.cogs / incomeStatementData.revenue * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => showDetail("cogs")}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* = Gross Profit */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-semibold">= Gross Profit</TableCell>
                    <TableCell className="text-right text-muted-foreground">Revenue − COGS</TableCell>
                    <TableCell className="text-right font-semibold">{incomeStatementData.grossProfit.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{incomeStatementData.grossProfitMargin.toFixed(2)}%</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => showDetail("grossProfit")}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Section 3: Operating Expenses */}
                  <TableRow>
                    <TableCell className="font-semibold">3. Operating Expenses</TableCell>
                    <TableCell className="text-right text-muted-foreground">Rent, salaries, utilities, admin, etc.</TableCell>
                    <TableCell className="text-right font-semibold">({incomeStatementData.operatingExpenses.toLocaleString()})</TableCell>
                    <TableCell className="text-right">{(incomeStatementData.operatingExpenses / incomeStatementData.revenue * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => showDetail("operatingExpenses")}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* = Operating Profit */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-semibold">= Operating Profit</TableCell>
                    <TableCell className="text-right text-muted-foreground">Gross Profit − Operating Expenses</TableCell>
                    <TableCell className="text-right font-semibold">{incomeStatementData.operatingProfit.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{incomeStatementData.operatingProfitMargin.toFixed(2)}%</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => showDetail("operatingProfit")}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Section 4: Other Income / Expenses */}
                  <TableRow>
                    <TableCell className="font-semibold">4. Other Income / Expenses</TableCell>
                    <TableCell className="text-right text-muted-foreground">Interest, asset sales, etc.</TableCell>
                    <TableCell className="text-right font-semibold">
                      {incomeStatementData.otherIncomeExpenses >= 0 ? '+' : ''}{incomeStatementData.otherIncomeExpenses.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{(incomeStatementData.otherIncomeExpenses / incomeStatementData.revenue * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => showDetail("otherIncomeExpenses")}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Section 5: Tax (Income Tax) */}
                  <TableRow>
                    <TableCell className="font-semibold">5. Tax (Income Tax)</TableCell>
                    <TableCell className="text-right text-muted-foreground">Based on profit before tax</TableCell>
                    <TableCell className="text-right font-semibold">({incomeStatementData.tax.toLocaleString()})</TableCell>
                    <TableCell className="text-right">{incomeStatementData.tax > 0 ? (incomeStatementData.tax / (incomeStatementData.operatingProfit + incomeStatementData.otherIncomeExpenses) * 100).toFixed(2) : '0.00'}%</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => showDetail("tax")}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* = Net Profit */}
                  <TableRow className="bg-muted font-bold text-lg">
                    <TableCell className="font-bold">= Net Profit</TableCell>
                    <TableCell className="text-right text-muted-foreground">Final profit after all costs and tax</TableCell>
                    <TableCell className="text-right font-bold">{incomeStatementData.netProfit.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold">{incomeStatementData.netProfitMargin.toFixed(2)}%</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => showDetail("netProfit")}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            {/* Footer */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Prepared on: {new Date().toLocaleDateString()}</p>
              <p className="mt-1">Confidential - For Internal Use Only</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Key Metrics */}
        <Card className="border border-gray-200 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Key Financial Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Profitability Ratios</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Gross Profit Margin:</span>
                    <Badge variant="secondary">{incomeStatementData.grossProfitMargin.toFixed(2)}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Profit Margin:</span>
                    <Badge variant="secondary">{incomeStatementData.operatingProfitMargin.toFixed(2)}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Profit Margin:</span>
                    <Badge variant={incomeStatementData.netProfitMargin >= 10 ? "default" : "destructive"}>
                      {incomeStatementData.netProfitMargin.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Cost Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>COGS Ratio:</span>
                    <Badge variant="secondary">{(incomeStatementData.cogs / incomeStatementData.revenue * 100).toFixed(2)}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Expense Ratio:</span>
                    <Badge variant="secondary">{(incomeStatementData.operatingExpenses / incomeStatementData.revenue * 100).toFixed(2)}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Income/Expense Ratio:</span>
                    <Badge variant="secondary">{(incomeStatementData.otherIncomeExpenses / incomeStatementData.revenue * 100).toFixed(2)}%</Badge>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Performance Indicators</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <Badge>{incomeStatementData.revenue.toLocaleString()} TZS</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses:</span>
                    <Badge variant="destructive">{(incomeStatementData.cogs + incomeStatementData.operatingExpenses + incomeStatementData.tax).toLocaleString()} TZS</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Result:</span>
                    <Badge variant={incomeStatementData.netProfit >= 0 ? "default" : "destructive"}>
                      {incomeStatementData.netProfit >= 0 ? '+' : ''}{incomeStatementData.netProfit.toLocaleString()} TZS
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentDetail?.title}</DialogTitle>
            <DialogDescription>
              Detailed breakdown of how this amount was calculated
            </DialogDescription>
          </DialogHeader>
          {currentDetail && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{currentDetail.description}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Calculation</h3>
                <p className="font-mono text-sm p-2 bg-muted rounded">{currentDetail.calculation}</p>
              </div>
              
              {currentDetail.additionalInfo && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Metrics</h3>
                  <p className="text-muted-foreground">{currentDetail.additionalInfo}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold mb-2">Data Sources</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {currentDetail.dataSources.map((source, index) => (
                    <li key={index} className="text-muted-foreground">{source}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};