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
import { Search, Plus, Edit, Trash2, ShoppingCart, Truck, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  status: "draft" | "ordered" | "received" | "cancelled";
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export const PurchaseOrders = ({ username, onBack, onLogout }: { username: string; onBack: () => void; onLogout: () => void }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: "1",
      poNumber: "PO-001",
      supplierId: "1",
      supplierName: "Tech Distributors Inc.",
      orderDate: "2023-05-10",
      expectedDelivery: "2023-05-20",
      status: "received",
      items: [
        {
          id: "1-1",
          productId: "1",
          productName: "Wireless Headphones",
          quantity: 20,
          unitPrice: 45.00,
          total: 900.00
        },
        {
          id: "1-2",
          productId: "2",
          productName: "Smartphone",
          quantity: 10,
          unitPrice: 300.00,
          total: 3000.00
        }
      ],
      subtotal: 3900.00,
      tax: 312.00,
      total: 4212.00
    },
    {
      id: "2",
      poNumber: "PO-002",
      supplierId: "2",
      supplierName: "Global Home Goods",
      orderDate: "2023-05-15",
      expectedDelivery: "2023-05-25",
      status: "ordered",
      items: [
        {
          id: "2-1",
          productId: "3",
          productName: "Coffee Maker",
          quantity: 15,
          unitPrice: 35.00,
          total: 525.00
        }
      ],
      subtotal: 525.00,
      tax: 42.00,
      total: 567.00
    },
    {
      id: "3",
      poNumber: "PO-003",
      supplierId: "1",
      supplierName: "Tech Distributors Inc.",
      orderDate: "2023-05-18",
      expectedDelivery: "2023-05-28",
      status: "draft",
      items: [
        {
          id: "3-1",
          productId: "4",
          productName: "Laptop",
          quantity: 5,
          unitPrice: 600.00,
          total: 3000.00
        }
      ],
      subtotal: 3000.00,
      tax: 240.00,
      total: 3240.00
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [newPO, setNewPO] = useState<Omit<PurchaseOrder, "id" | "poNumber" | "items" | "subtotal" | "tax" | "total">>({
    supplierId: "",
    supplierName: "",
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "draft"
  });
  const { toast } = useToast();

  const suppliers = [
    { id: "1", name: "Tech Distributors Inc." },
    { id: "2", name: "Global Home Goods" },
    { id: "3", name: "Fashion Wholesale Co." }
  ];

  const products = [
    { id: "1", name: "Wireless Headphones", price: 45.00 },
    { id: "2", name: "Smartphone", price: 300.00 },
    { id: "3", name: "Coffee Maker", price: 35.00 },
    { id: "4", name: "Laptop", price: 600.00 },
    { id: "5", name: "Running Shoes", price: 65.00 }
  ];

  const handleAddPO = () => {
    if (!newPO.supplierId || !newPO.supplierName) {
      toast({
        title: "Error",
        description: "Please select a supplier",
        variant: "destructive"
      });
      return;
    }

    const poNumber = `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    
    const purchaseOrder: PurchaseOrder = {
      ...newPO,
      id: Date.now().toString(),
      poNumber,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0
    };

    setPurchaseOrders([...purchaseOrders, purchaseOrder]);
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Purchase order created successfully"
    });
  };

  const handleUpdatePO = () => {
    if (!editingPO || !editingPO.supplierId || !editingPO.supplierName) {
      toast({
        title: "Error",
        description: "Please select a supplier",
        variant: "destructive"
      });
      return;
    }

    setPurchaseOrders(purchaseOrders.map(po => po.id === editingPO.id ? editingPO : po));
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Purchase order updated successfully"
    });
  };

  const handleDeletePO = (id: string) => {
    setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
    toast({
      title: "Success",
      description: "Purchase order deleted successfully"
    });
  };

  const resetForm = () => {
    setNewPO({
      supplierId: "",
      supplierName: "",
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "draft"
    });
    setEditingPO(null);
  };

  const openEditDialog = (po: PurchaseOrder) => {
    setEditingPO(po);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      if (editingPO) {
        setEditingPO({
          ...editingPO,
          supplierId,
          supplierName: supplier.name
        });
      } else {
        setNewPO({
          ...newPO,
          supplierId,
          supplierName: supplier.name
        });
      }
    }
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Purchase Orders" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold">Purchase Orders</h2>
            <p className="text-muted-foreground">Manage supplier orders and inventory replenishment</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search purchase orders..."
                className="pl-8 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
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
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  New PO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingPO ? "Edit Purchase Order" : "Create Purchase Order"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Select
                      value={editingPO ? editingPO.supplierId : newPO.supplierId}
                      onValueChange={handleSupplierChange}
                    >
                      <SelectTrigger id="supplier">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="orderDate">Order Date</Label>
                      <Input
                        id="orderDate"
                        type="date"
                        value={editingPO ? editingPO.orderDate : newPO.orderDate}
                        onChange={(e) => 
                          editingPO 
                            ? setEditingPO({...editingPO, orderDate: e.target.value}) 
                            : setNewPO({...newPO, orderDate: e.target.value})
                        }
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                      <Input
                        id="expectedDelivery"
                        type="date"
                        value={editingPO ? editingPO.expectedDelivery : newPO.expectedDelivery}
                        onChange={(e) => 
                          editingPO 
                            ? setEditingPO({...editingPO, expectedDelivery: e.target.value}) 
                            : setNewPO({...newPO, expectedDelivery: e.target.value})
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editingPO ? editingPO.status : newPO.status}
                      onValueChange={(value: "draft" | "ordered" | "received" | "cancelled") => 
                        editingPO 
                          ? setEditingPO({...editingPO, status: value}) 
                          : setNewPO({...newPO, status: value})
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingPO ? handleUpdatePO : handleAddPO}>
                    {editingPO ? "Update" : "Create"} PO
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPOs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No purchase orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>{po.supplierName}</TableCell>
                      <TableCell>{po.orderDate}</TableCell>
                      <TableCell>{po.expectedDelivery}</TableCell>
                      <TableCell>{po.items.length}</TableCell>
                      <TableCell>${po.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            po.status === "draft" ? "secondary" :
                            po.status === "ordered" ? "default" :
                            po.status === "received" ? "success" : "destructive"
                          }
                        >
                          {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(po)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeletePO(po.id)}
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