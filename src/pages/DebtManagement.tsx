import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Users, Truck, Wallet, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";

interface Debt {
  id: string;
  partyId: string;
  partyName: string;
  partyType: "customer" | "supplier";
  amount: number;
  dueDate?: string;
  status: "outstanding" | "paid" | "overdue";
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const DebtManagement = ({ username, onBack, onLogout }: { username: string; onBack: () => void; onLogout: () => void }) => {
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: "1",
      partyId: "1",
      partyName: "John Smith",
      partyType: "customer",
      amount: 150.00,
      dueDate: "2023-06-15",
      status: "outstanding",
      description: "Outstanding balance from previous purchases",
      createdAt: "2023-05-15",
      updatedAt: "2023-05-15"
    },
    {
      id: "2",
      partyId: "2",
      partyName: "Global Home Goods",
      partyType: "supplier",
      amount: 500.00,
      dueDate: "2023-05-30",
      status: "overdue",
      description: "Payment for purchase order PO-002",
      createdAt: "2023-05-10",
      updatedAt: "2023-05-10"
    },
    {
      id: "3",
      partyId: "3",
      partyName: "Sarah Johnson",
      partyType: "customer",
      amount: 75.50,
      status: "outstanding",
      description: "Partial payment for recent transaction",
      createdAt: "2023-05-18",
      updatedAt: "2023-05-18"
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [partyTypeFilter, setPartyTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [newDebt, setNewDebt] = useState<Omit<Debt, "id" | "createdAt" | "updatedAt">>({
    partyId: "",
    partyName: "",
    partyType: "customer",
    amount: 0,
    status: "outstanding",
    description: ""
  });
  const { toast } = useToast();

  const handleAddDebt = () => {
    if (!newDebt.partyName || newDebt.amount <= 0) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    const debt: Debt = {
      ...newDebt,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setDebts([...debts, debt]);
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Debt record added successfully"
    });
  };

  const handleUpdateDebt = () => {
    if (!editingDebt || !editingDebt.partyName || editingDebt.amount <= 0) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    setDebts(debts.map(d => d.id === editingDebt.id ? {
      ...editingDebt,
      updatedAt: new Date().toISOString().split('T')[0]
    } : d));
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Debt record updated successfully"
    });
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
    toast({
      title: "Success",
      description: "Debt record deleted successfully"
    });
  };

  const resetForm = () => {
    setNewDebt({
      partyId: "",
      partyName: "",
      partyType: "customer",
      amount: 0,
      status: "outstanding",
      description: ""
    });
    setEditingDebt(null);
  };

  const openEditDialog = (debt: Debt) => {
    setEditingDebt(debt);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const totalOutstanding = debts
    .filter(d => d.status === "outstanding")
    .reduce((sum, debt) => sum + debt.amount, 0);
    
  const totalOverdue = debts
    .filter(d => d.status === "overdue")
    .reduce((sum, debt) => sum + debt.amount, 0);

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = 
      debt.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPartyType = partyTypeFilter === "all" || debt.partyType === partyTypeFilter;
    const matchesStatus = statusFilter === "all" || debt.status === statusFilter;
    
    return matchesSearch && matchesPartyType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Debt Management" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold">Debts</h2>
            <p className="text-muted-foreground">Manage customer and supplier debts</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search debts..."
                className="pl-8 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={partyTypeFilter} onValueChange={setPartyTypeFilter}>
              <SelectTrigger className="w-32">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Party Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parties</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="supplier">Suppliers</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="outstanding">Outstanding</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Debt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingDebt ? "Edit Debt" : "Add New Debt"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="partyType">Party Type *</Label>
                    <Select
                      value={editingDebt ? editingDebt.partyType : newDebt.partyType}
                      onValueChange={(value: "customer" | "supplier") => 
                        editingDebt 
                          ? setEditingDebt({...editingDebt, partyType: value}) 
                          : setNewDebt({...newDebt, partyType: value})
                      }
                    >
                      <SelectTrigger id="partyType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="partyName">Party Name *</Label>
                    <Input
                      id="partyName"
                      value={editingDebt ? editingDebt.partyName : newDebt.partyName}
                      onChange={(e) => 
                        editingDebt 
                          ? setEditingDebt({...editingDebt, partyName: e.target.value}) 
                          : setNewDebt({...newDebt, partyName: e.target.value})
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          className="pl-8"
                          value={editingDebt ? editingDebt.amount : newDebt.amount}
                          onChange={(e) => 
                            editingDebt 
                              ? setEditingDebt({...editingDebt, amount: parseFloat(e.target.value) || 0}) 
                              : setNewDebt({...newDebt, amount: parseFloat(e.target.value) || 0})
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={editingDebt ? editingDebt.dueDate || "" : ""}
                        onChange={(e) => 
                          editingDebt 
                            ? setEditingDebt({...editingDebt, dueDate: e.target.value || undefined}) 
                            : null
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editingDebt ? editingDebt.status : newDebt.status}
                      onValueChange={(value: "outstanding" | "paid" | "overdue") => 
                        editingDebt 
                          ? setEditingDebt({...editingDebt, status: value}) 
                          : setNewDebt({...newDebt, status: value})
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outstanding">Outstanding</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={editingDebt ? editingDebt.description : newDebt.description}
                      onChange={(e) => 
                        editingDebt 
                          ? setEditingDebt({...editingDebt, description: e.target.value}) 
                          : setNewDebt({...newDebt, description: e.target.value})
                      }
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingDebt ? handleUpdateDebt : handleAddDebt}>
                    {editingDebt ? "Update" : "Add"} Debt
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
              <p className="text-xs text-muted-foreground">Across all parties</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{formatCurrency(totalOverdue)}</div>
              <p className="text-xs text-muted-foreground">Requires immediate attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{debts.length}</div>
              <p className="text-xs text-muted-foreground">Active debt records</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Debt Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Party</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDebts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No debt records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDebts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell>
                        <div className="font-medium">{debt.partyName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={debt.partyType === "customer" ? "default" : "secondary"}>
                          {debt.partyType === "customer" ? (
                            <Users className="h-3 w-3 mr-1" />
                          ) : (
                            <Truck className="h-3 w-3 mr-1" />
                          )}
                          {debt.partyType}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{debt.description}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(debt.amount)}</TableCell>
                      <TableCell>{debt.dueDate || "N/A"}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            debt.status === "paid" ? "default" : 
                            debt.status === "outstanding" ? "secondary" : "destructive"
                          }
                        >
                          {debt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(debt)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteDebt(debt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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