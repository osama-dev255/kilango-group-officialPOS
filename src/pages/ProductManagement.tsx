import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Package, Scan, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { AutomationService } from "@/services/automationService";
import { ExportImportManager } from "@/components/ExportImportManager";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  barcode?: string;
  sku?: string;
  description?: string;
}

const categories = [
  "Electronics",
  "Clothing",
  "Food & Beverage",
  "Home & Garden",
  "Health & Beauty",
  "Sports & Outdoors",
  "Books & Media",
  "Toys & Games",
  "Other"
];

export const ProductManagement = ({ username, onBack, onLogout }: { username: string; onBack: () => void; onLogout: () => void }) => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Wireless Headphones",
      category: "Electronics",
      price: 99.99,
      cost: 45.00,
      stock: 25,
      barcode: "123456789012",
      sku: "WH-001",
      description: "High-quality wireless headphones with noise cancellation"
    },
    {
      id: "2",
      name: "Coffee Maker",
      category: "Home & Garden",
      price: 79.99,
      cost: 35.00,
      stock: 15,
      barcode: "234567890123",
      sku: "CM-002",
      description: "Automatic drip coffee maker with programmable timer"
    },
    {
      id: "3",
      name: "Running Shoes",
      category: "Sports & Outdoors",
      price: 129.99,
      cost: 65.00,
      stock: 30,
      barcode: "345678901234",
      sku: "RS-003",
      description: "Lightweight running shoes with extra cushioning"
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    category: categories[0],
    price: 0,
    cost: 0,
    stock: 0,
    barcode: "",
    sku: "",
    description: ""
  });
  const { toast } = useToast();

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    const product: Product = {
      ...newProduct,
      id: Date.now().toString()
    };

    setProducts([...products, product]);
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Product added successfully"
    });
  };

  // Handle product import
  const handleImportProducts = (importedProducts: any[]) => {
    const updatedProducts = [...products];
    
    importedProducts.forEach(importedProduct => {
      // Check if product already exists
      const existingIndex = updatedProducts.findIndex(p => p.barcode === importedProduct.barcode);
      
      if (existingIndex >= 0) {
        // Update existing product
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          ...importedProduct,
          price: Number(importedProduct.price) || updatedProducts[existingIndex].price,
          cost: Number(importedProduct.cost) || updatedProducts[existingIndex].cost,
          stock: Number(importedProduct.stock) || updatedProducts[existingIndex].stock
        };
      } else {
        // Add new product
        updatedProducts.push({
          ...importedProduct,
          id: Date.now().toString() + Math.random(),
          price: Number(importedProduct.price) || 0,
          cost: Number(importedProduct.cost) || 0,
          stock: Number(importedProduct.stock) || 0
        });
      }
    });
    
    setProducts(updatedProducts);
    
    toast({
      title: "Import Successful",
      description: `Successfully imported ${importedProducts.length} products`
    });
  };

  const handleUpdateProduct = () => {
    if (!editingProduct || !editingProduct.name || editingProduct.price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Product updated successfully"
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast({
      title: "Success",
      description: "Product deleted successfully"
    });
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      category: categories[0],
      price: 0,
      cost: 0,
      stock: 0,
      barcode: "",
      sku: "",
      description: ""
    });
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm)) ||
    (product.sku && product.sku.includes(searchTerm))
  );

  // Check for low stock items automatically
  const lowStockItems = AutomationService.checkLowStock(products);

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Product Management" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold">Products</h2>
            <p className="text-muted-foreground">Manage your product inventory</p>
          </div>
          
          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md">
              <AlertTriangle className="h-4 w-4" />
              <span>
                {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} low in stock
              </span>
            </div>
          )}
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={() => alert('Scanner would open here in a full implementation')}>
              <Scan className="h-4 w-4 mr-2" />
              Scan to Add
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={editingProduct ? editingProduct.name : newProduct.name}
                      onChange={(e) => 
                        editingProduct 
                          ? setEditingProduct({...editingProduct, name: e.target.value}) 
                          : setNewProduct({...newProduct, name: e.target.value})
                      }
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editingProduct ? editingProduct.category : newProduct.category}
                      onValueChange={(value) => 
                        editingProduct 
                          ? setEditingProduct({...editingProduct, category: value}) 
                          : setNewProduct({...newProduct, category: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Selling Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={editingProduct ? editingProduct.price : newProduct.price}
                        onChange={(e) => 
                          editingProduct 
                            ? setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0}) 
                            : setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})
                        }
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="cost">Cost Price</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={editingProduct ? editingProduct.cost : newProduct.cost}
                        onChange={(e) => 
                          editingProduct 
                            ? setEditingProduct({...editingProduct, cost: parseFloat(e.target.value) || 0}) 
                            : setNewProduct({...newProduct, cost: parseFloat(e.target.value) || 0})
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={editingProduct ? editingProduct.stock : newProduct.stock}
                        onChange={(e) => 
                          editingProduct 
                            ? setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0}) 
                            : setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})
                        }
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        value={editingProduct ? editingProduct.barcode || "" : newProduct.barcode || ""}
                        onChange={(e) => 
                          editingProduct 
                            ? setEditingProduct({...editingProduct, barcode: e.target.value}) 
                            : setNewProduct({...newProduct, barcode: e.target.value})
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={editingProduct ? editingProduct.sku || "" : newProduct.sku || ""}
                      onChange={(e) => 
                        editingProduct 
                          ? setEditingProduct({...editingProduct, sku: e.target.value}) 
                          : setNewProduct({...newProduct, sku: e.target.value})
                      }
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={editingProduct ? editingProduct.description || "" : newProduct.description || ""}
                      onChange={(e) => 
                        editingProduct 
                          ? setEditingProduct({...editingProduct, description: e.target.value}) 
                          : setNewProduct({...newProduct, description: e.target.value})
                      }
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingProduct ? handleUpdateProduct : handleAddProduct}>
                    {editingProduct ? "Update" : "Add"} Product
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
              <Package className="h-5 w-5" />
              Product Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "destructive" : "outline"}>
                          {product.stock} in stock
                        </Badge>
                      </TableCell>
                      <TableCell>{product.barcode || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
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
              data={products}
              dataType="products"
              onImport={handleImportProducts}
            />
          </div>
        </div>
      </main>
    </div>
  );
};