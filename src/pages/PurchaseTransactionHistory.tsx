import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Receipt, Calendar, Filter, Download, Printer, FileSpreadsheet, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { ExportUtils } from "@/utils/exportUtils";
import { PrintUtils } from "@/utils/printUtils";
import { ExcelUtils } from "@/utils/excelUtils";
// Import Supabase database service
import { getPurchaseOrders, PurchaseOrder, getSuppliers, Supplier, getPurchaseOrderItems } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";

interface PurchaseTransaction {
  id: string;
  date: string;
  supplier: string;
  items: number;
  total: number;
  status: "draft" | "ordered" | "received" | "cancelled";
}

export const PurchaseTransactionHistory = ({ username, onBack, onLogout }: { username: string; onBack: () => void; onLogout: () => void }) => {
  const [transactions, setTransactions] = useState<PurchaseTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const { toast } = useToast();

  // Load suppliers for supplier name lookup
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const supplierData = await getSuppliers();
        setSuppliers(supplierData);
      } catch (error) {
        console.error("Error loading suppliers:", error);
      }
    };

    loadSuppliers();
  }, []);

  // Load purchase transactions from Supabase on component mount
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        console.log("Loading purchase orders data...");
        const purchaseOrdersData = await getPurchaseOrders();
        console.log("Purchase orders data loaded:", purchaseOrdersData.length, "records");
        
        // Get supplier names for display
        const supplierMap = new Map<string, string>();
        suppliers.forEach(supplier => {
          if (supplier.id) {
            supplierMap.set(supplier.id, supplier.name || 'Unknown Supplier');
          }
        });
        
        // For each purchase order, get the actual number of items
        const formattedTransactions = [];
        for (const po of purchaseOrdersData) {
          // Get supplier name or use default
          let supplierName = 'Unknown Supplier';
          if (po.supplier_id) {
            supplierName = supplierMap.get(po.supplier_id) || 'Unknown Supplier';
          }
          
          // Get actual number of items in this purchase order
          let itemCount = 0;
          try {
            if (po.id) {
              const poItems = await getPurchaseOrderItems(po.id);
              itemCount = poItems.length;
            }
          } catch (error) {
            console.error("Error loading purchase order items for PO", po.id, error);
            itemCount = 1; // Default fallback
          }
          
          formattedTransactions.push({
            id: po.id || '',
            date: po.order_date || new Date().toISOString(),
            supplier: supplierName,
            items: itemCount,
            total: po.total_amount || 0,
            status: (po.status as "draft" | "ordered" | "received" | "cancelled") || 'draft'
          });
        }
        
        console.log("Formatted purchase transactions:", formattedTransactions);
        setTransactions(formattedTransactions);
      } catch (error) {
        console.error("Error loading purchase transactions:", error);
        toast({
          title: "Error",
          description: "Failed to load purchase transactions: " + (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Only load transactions if suppliers are loaded
    if (suppliers.length > 0) {
      loadTransactions();
    } else {
      // Load transactions after suppliers are loaded
      const loadSuppliersAndTransactions = async () => {
        try {
          setLoading(true);
          const supplierData = await getSuppliers();
          setSuppliers(supplierData);
          
          const purchaseOrdersData = await getPurchaseOrders();
          console.log("Purchase orders data loaded:", purchaseOrdersData.length, "records");
          
          // Get supplier names for display
          const supplierMap = new Map<string, string>();
          supplierData.forEach(supplier => {
            if (supplier.id) {
              supplierMap.set(supplier.id, supplier.name || 'Unknown Supplier');
            }
          });
          
          // For each purchase order, get the actual number of items
          const formattedTransactions = [];
          for (const po of purchaseOrdersData) {
            // Get supplier name or use default
            let supplierName = 'Unknown Supplier';
            if (po.supplier_id) {
              supplierName = supplierMap.get(po.supplier_id) || 'Unknown Supplier';
            }
            
            // Get actual number of items in this purchase order
            let itemCount = 0;
            try {
              if (po.id) {
                const poItems = await getPurchaseOrderItems(po.id);
                itemCount = poItems.length;
              }
            } catch (error) {
              console.error("Error loading purchase order items for PO", po.id, error);
              itemCount = 1; // Default fallback
            }
            
            formattedTransactions.push({
              id: po.id || '',
              date: po.order_date || new Date().toISOString(),
              supplier: supplierName,
              items: itemCount,
              total: po.total_amount || 0,
              status: (po.status as "draft" | "ordered" | "received" | "cancelled") || 'draft'
            });
          }
          
          console.log("Formatted purchase transactions:", formattedTransactions);
          setTransactions(formattedTransactions);
        } catch (error) {
          console.error("Error loading data:", error);
          toast({
            title: "Error",
            description: "Failed to load data: " + (error as Error).message,
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      
      loadSuppliersAndTransactions();
    }
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      (transaction.id && transaction.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      transaction.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    // Date filter implementation
    const transactionDate = new Date(transaction.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let matchesDate = true;
    if (dateFilter === "today") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = transactionDate >= today && transactionDate < tomorrow;
    } else if (dateFilter === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = transactionDate >= weekAgo && transactionDate <= today;
    } else if (dateFilter === "month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = transactionDate >= monthAgo && transactionDate <= today;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Refresh transactions
  const refreshTransactions = async () => {
    try {
      setLoading(true);
      const purchaseOrdersData = await getPurchaseOrders();
      
      // Get supplier names for display
      const supplierMap = new Map<string, string>();
      suppliers.forEach(supplier => {
        if (supplier.id) {
          supplierMap.set(supplier.id, supplier.name || 'Unknown Supplier');
        }
      });
      
      // For each purchase order, get the actual number of items
      const formattedTransactions = [];
      for (const po of purchaseOrdersData) {
        // Get supplier name or use default
        let supplierName = 'Unknown Supplier';
        if (po.supplier_id) {
          supplierName = supplierMap.get(po.supplier_id) || 'Unknown Supplier';
        }
        
        // Get actual number of items in this purchase order
        let itemCount = 0;
        try {
          if (po.id) {
            const poItems = await getPurchaseOrderItems(po.id);
            itemCount = poItems.length;
          }
        } catch (error) {
          console.error("Error loading purchase order items for PO", po.id, error);
          itemCount = 1; // Default fallback
        }
        
        formattedTransactions.push({
          id: po.id || '',
          date: po.order_date || new Date().toISOString(),
          supplier: supplierName,
          items: itemCount,
          total: po.total_amount || 0,
          status: (po.status as "draft" | "ordered" | "received" | "cancelled") || 'draft'
        });
      }
      
      setTransactions(formattedTransactions);
      toast({
        title: "Success",
        description: "Purchase transactions refreshed successfully",
      });
    } catch (error) {
      console.error("Error refreshing purchase transactions:", error);
      toast({
        title: "Error",
        description: "Failed to refresh purchase transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Purchase Transaction History" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Purchase Transactions</h2>
          <p className="text-muted-foreground">View and manage purchase transactions</p>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by transaction ID or supplier..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={refreshTransactions} variant="outline">
                  Refresh
                </Button>
                
                <Button onClick={() => PrintUtils.printPurchaseReport(filteredTransactions)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
                
                <Button onClick={() => ExportUtils.exportToCSV(filteredTransactions, `purchase_transactions_${new Date().toISOString().split('T')[0]}`)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                
                <Button variant="outline" onClick={() => ExcelUtils.exportToExcel(filteredTransactions, `purchase_transactions_${new Date().toISOString().split('T')[0]}`)}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Purchase Transaction Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p>Loading purchase transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Receipt className="h-8 w-8 mb-2" />
                <p>No purchase transactions found</p>
                <p className="text-sm">Process a purchase to see transactions here</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={refreshTransactions}
                >
                  Refresh Data
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id ? transaction.id.substring(0, 8) : 'N/A'}</TableCell>
                        <TableCell>{transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{transaction.supplier}</TableCell>
                        <TableCell>{transaction.items}</TableCell>
                        <TableCell className="text-right">{formatCurrency(transaction.total)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.status === "received" ? "default" :
                              transaction.status === "ordered" ? "secondary" :
                              transaction.status === "draft" ? "outline" : "destructive"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};