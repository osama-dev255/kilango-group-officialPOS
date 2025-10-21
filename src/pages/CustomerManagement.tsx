import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { AutomationService } from "@/services/automationService";
import { ExportImportManager } from "@/components/ExportImportManager";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  totalSpent: number;
  lastPurchase?: string;
}

export const CustomerManagement = ({ username, onBack, onLogout }: { username: string; onBack: () => void; onLogout: () => void }) => {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      phone: "(555) 123-4567",
      address: "123 Main St, City, State 12345",
      loyaltyPoints: 150,
      totalSpent: 1250.75,
      lastPurchase: "2023-05-15"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "(555) 987-6543",
      loyaltyPoints: 320,
      totalSpent: 2100.50,
      lastPurchase: "2023-05-18"
    },
    {
      id: "3",
      name: "Mike Williams",
      phone: "(555) 456-7890",
      loyaltyPoints: 75,
      totalSpent: 420.25,
      lastPurchase: "2023-05-10"
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, "id" | "loyaltyPoints" | "totalSpent">>({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const { toast } = useToast();

  const handleAddCustomer = () => {
    if (!newCustomer.name) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return;
    }

    const customer: Customer = {
      ...newCustomer,
      id: Date.now().toString(),
      loyaltyPoints: 0,
      totalSpent: 0
    };

    setCustomers([...customers, customer]);
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Customer added successfully"
    });
  };

  // Handle customer import
  const handleImportCustomers = (importedCustomers: any[]) => {
    const updatedCustomers = [...customers];
    
    importedCustomers.forEach(importedCustomer => {
      // Check if customer already exists (by email)
      const existingIndex = updatedCustomers.findIndex(c => 
        c.email && importedCustomer.email && c.email === importedCustomer.email
      );
      
      if (existingIndex >= 0) {
        // Update existing customer
        updatedCustomers[existingIndex] = {
          ...updatedCustomers[existingIndex],
          ...importedCustomer,
          loyaltyPoints: Number(importedCustomer.loyaltyPoints) || updatedCustomers[existingIndex].loyaltyPoints,
          totalSpent: Number(importedCustomer.totalSpent) || updatedCustomers[existingIndex].totalSpent
        };
      } else {
        // Add new customer
        updatedCustomers.push({
          ...importedCustomer,
          id: Date.now().toString() + Math.random(),
          loyaltyPoints: Number(importedCustomer.loyaltyPoints) || 0,
          totalSpent: Number(importedCustomer.totalSpent) || 0
        });
      }
    });
    
    setCustomers(updatedCustomers);
    
    toast({
      title: "Import Successful",
      description: `Successfully imported ${importedCustomers.length} customers`
    });
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer || !editingCustomer.name) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return;
    }

    setCustomers(customers.map(c => c.id === editingCustomer.id ? editingCustomer : c));
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Customer updated successfully"
    });
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    toast({
      title: "Success",
      description: "Customer deleted successfully"
    });
  };

  const resetForm = () => {
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      address: ""
    });
    setEditingCustomer(null);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Apply automated customer segmentation
  const segmentedCustomers = AutomationService.segmentCustomers(customers);
  
  const filteredCustomers = segmentedCustomers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Customer Management" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold">Customers</h2>
            <p className="text-muted-foreground">Manage your customer database</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCustomer ? "Edit Customer" : "Add New Customer"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={editingCustomer ? editingCustomer.name : newCustomer.name}
                      onChange={(e) => 
                        editingCustomer 
                          ? setEditingCustomer({...editingCustomer, name: e.target.value}) 
                          : setNewCustomer({...newCustomer, name: e.target.value})
                      }
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editingCustomer ? editingCustomer.email || "" : newCustomer.email || ""}
                      onChange={(e) => 
                        editingCustomer 
                          ? setEditingCustomer({...editingCustomer, email: e.target.value}) 
                          : setNewCustomer({...newCustomer, email: e.target.value})
                      }
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editingCustomer ? editingCustomer.phone || "" : newCustomer.phone || ""}
                      onChange={(e) => 
                        editingCustomer 
                          ? setEditingCustomer({...editingCustomer, phone: e.target.value}) 
                          : setNewCustomer({...newCustomer, phone: e.target.value})
                      }
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={editingCustomer ? editingCustomer.address || "" : newCustomer.address || ""}
                      onChange={(e) => 
                        editingCustomer 
                          ? setEditingCustomer({...editingCustomer, address: e.target.value}) 
                          : setNewCustomer({...newCustomer, address: e.target.value})
                      }
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingCustomer ? handleUpdateCustomer : handleAddCustomer}>
                    {editingCustomer ? "Update" : "Add"} Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Database
                </CardTitle>
              </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Loyalty Points</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Purchase</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {customer.email && <div>{customer.email}</div>}
                          {customer.phone && <div>{customer.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{customer.loyaltyPoints} pts</Badge>
                          <Badge 
                            variant={customer.segment === 'Gold' ? 'default' : customer.segment === 'Silver' ? 'secondary' : 'outline'}
                          >
                            {customer.segment}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                      <TableCell>
                        {customer.lastPurchase || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
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
          </div>
          
          <div>
            <ExportImportManager 
              data={customers}
              dataType="customers"
              onImport={handleImportCustomers}
            />
          </div>
        </div>
      </main>
    </div>
  );
};