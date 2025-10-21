import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Receipt, Calendar, Filter, Download, Printer, FileSpreadsheet } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { ExportUtils } from "@/utils/exportUtils";
import { PrintUtils } from "@/utils/printUtils";
import { ExcelUtils } from "@/utils/excelUtils";

interface Transaction {
  id: string;
  date: string;
  customer: string;
  items: number;
  total: number;
  paymentMethod: string;
  status: "completed" | "refunded" | "pending";
}

export const TransactionHistory = ({ username, onBack, onLogout }: { username: string; onBack: () => void; onLogout: () => void }) => {
  // Mock transaction data
  const mockTransactions = [
    {
      id: "1",
      date: "2023-05-15T14:30:00Z",
      customer: "John Smith",
      items: [
        { id: "1", name: "Wireless Headphones", price: 99.99, quantity: 1 },
        { id: "2", name: "Phone Case", price: 24.99, quantity: 2 }
      ],
      total: 149.97,
      status: "completed",
      paymentMethod: "Credit Card"
    },
    {
      id: "2",
      date: "2023-05-15T11:15:00Z",
      customer: "Sarah Johnson",
      items: [
        { id: "3", name: "Coffee Maker", price: 79.99, quantity: 1 }
      ],
      total: 79.99,
      status: "completed",
      paymentMethod: "Cash"
    },
    {
      id: "3",
      date: "2023-05-14T16:45:00Z",
      customer: "Mike Williams",
      items: [
        { id: "4", name: "Running Shoes", price: 129.99, quantity: 1 },
        { id: "5", name: "Socks", price: 9.99, quantity: 3 }
      ],
      total: 159.96,
      status: "completed",
      paymentMethod: "Debit Card"
    }
  ];
  const [transactions] = useState<Transaction[]>([
    {
      id: "TXN-001",
      date: "2023-05-18 14:30",
      customer: "John Smith",
      items: 3,
      total: 159.97,
      paymentMethod: "Cash",
      status: "completed"
    },
    {
      id: "TXN-002",
      date: "2023-05-18 11:15",
      customer: "Sarah Johnson",
      items: 1,
      total: 699.99,
      paymentMethod: "Credit Card",
      status: "completed"
    },
    {
      id: "TXN-003",
      date: "2023-05-17 16:45",
      customer: "Walk-in Customer",
      items: 5,
      total: 249.95,
      paymentMethod: "Cash",
      status: "completed"
    },
    {
      id: "TXN-004",
      date: "2023-05-17 13:20",
      customer: "Mike Williams",
      items: 2,
      total: 229.98,
      paymentMethod: "Credit Card",
      status: "refunded"
    },
    {
      id: "TXN-005",
      date: "2023-05-16 10:05",
      customer: "John Smith",
      items: 1,
      total: 129.99,
      paymentMethod: "Cash",
      status: "completed"
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Transaction History" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Transactions</h2>
          <p className="text-muted-foreground">View and manage sales transactions</p>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by transaction ID or customer..."
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={() => PrintUtils.printSalesReport(filteredTransactions)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
                
                <Button onClick={() => ExportUtils.exportToCSV(filteredTransactions, `transactions_${new Date().toISOString().split('T')[0]}`)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                
                <Button variant="outline" onClick={() => ExcelUtils.exportToExcel(filteredTransactions, `transactions_${new Date().toISOString().split('T')[0]}`)}>
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
              <Receipt className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>{transaction.items}</TableCell>
                      <TableCell>{formatCurrency(transaction.total)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{transaction.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            transaction.status === "completed" ? "default" : 
                            transaction.status === "refunded" ? "destructive" : "outline"
                          }
                        >
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};