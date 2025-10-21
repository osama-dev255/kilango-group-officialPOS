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
// Import Supabase database service
import { getProducts, createProduct, updateProduct, deleteProduct, Product } from "@/services/databaseService";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id" | "created_at" | "updated_at">>({
    name: "",
    category_id: "",
    selling_price: 0,
    cost_price: 0,
    stock_quantity: 0,
    barcode: "",
    sku: "",
    description: "",
    unit_of_measure: "piece",
    wholesale_price: 0,
    min_stock_level: 0,
    max_stock_level: 10000,
    is_active: true
  });
  const { toast } = useToast();

  // Load products from Supabase on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || newProduct.selling_price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const product = await createProduct(newProduct);
      if (product) {
        setProducts([...products, product]);
        resetForm();
        setIsDialogOpen(false);
        
        toast({
          title: "Success",
          description: "Product added successfully"
        });
      } else {
        throw new Error("Failed to create product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    }
  };

  // Handle product import
  const handleImportProducts = async (importedProducts: any[]) => {
    try {
      const results = [];
      
      for (const importedProduct of importedProducts) {
        // Check if product already exists by barcode
        const existingProduct = products.find(p => p.barcode === importedProduct.barcode);
        
        if (existingProduct && existingProduct.id) {
          // Update existing product
          const updatedProduct = await updateProduct(existingProduct.id, {
            ...existingProduct,
            ...importedProduct,
            selling_price: Number(importedProduct.selling_price) || existingProduct.selling_price,
            cost_price: Number(importedProduct.cost_price) || existingProduct.cost_price,
            stock_quantity: Number(importedProduct.stock_quantity) || existingProduct.stock_quantity
          });
          
          if (updatedProduct) {
            results.push(updatedProduct);
          }
        } else {
          // Add new product
          const newProductData = {
            ...importedProduct,
            selling_price: Number(importedProduct.selling_price) || 0,
            cost_price: Number(importedProduct.cost_price) || 0,
            stock_quantity: Number(importedProduct.stock_quantity) || 0
          };
          
          const createdProduct = await createProduct(newProductData);
          if (createdProduct) {
            results.push(createdProduct);
          }
        }
      }
      
      // Refresh products list
      await loadProducts();
      
      toast({
        title: "Import Successful",
        description: `Successfully imported/updated ${results.length} products`
      });
    } catch (error) {
      console.error("Error importing products:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import products",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editingProduct.name || editingProduct.selling_price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingProduct.id) {
        const updatedProduct = await updateProduct(editingProduct.id, editingProduct);
        if (updatedProduct) {
          setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
          resetForm();
          setIsDialogOpen(false);
          
          toast({
            title: "Success",
            description: "Product updated successfully"
          });
        } else {
          throw new Error("Failed to update product");
        }
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const success = await deleteProduct(id);
      if (success) {
        setProducts(products.filter(p => p.id !== id));
        toast({
          title: "Success",
          description: "Product deleted successfully"
        });
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      category_id: "",
      selling_price: 0,
      cost_price: 0,
      stock_quantity: 0,
      barcode: "",
      sku: "",
      description: "",
      unit_of_measure: "piece",
      wholesale_price: 0,
      min_stock_level: 0,
      max_stock_level: 10000,
      is_active: true
    });
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category_id && product.category_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.includes(searchTerm)) ||
    (product.sku && product.sku.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation title="Product Management" username={username} onBack={onBack} onLogout={onLogout} />
      
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Product Management</h1>
            <p className="text-muted-foreground">Manage your inventory and product catalog</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={editingProduct ? editingProduct.name : newProduct.name}
                        onChange={(e) => 
                          editingProduct 
                            ? setEditingProduct({...editingProduct, name: e.target.value})
                            : setNewProduct({...newProduct, name: e.target.value})
                        }
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={editingProduct ? (editingProduct.category_id || "") : (newProduct.category_id || "")}
                        onValueChange={(value) => 
                          editingProduct
                            ? setEditingProduct({...editingProduct, category_id: value})
                            : setNewProduct({...newProduct, category_id: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Selling Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingProduct ? editingProduct.selling_price : newProduct.selling_price}
                        onChange={(e) => 
                          editingProduct
                            ? setEditingProduct({...editingProduct, selling_price: parseFloat(e.target.value) || 0})
                            : setNewProduct({...newProduct, selling_price: parseFloat(e.target.value) || 0})
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Cost Price</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingProduct ? editingProduct.cost_price : newProduct.cost_price}
                        onChange={(e) => 
                          editingProduct
                            ? setEditingProduct({...editingProduct, cost_price: parseFloat(e.target.value) || 0})
                            : setNewProduct({...newProduct, cost_price: parseFloat(e.target.value) || 0})
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={editingProduct ? editingProduct.stock_quantity : newProduct.stock_quantity}
                        onChange={(e) => 
                          editingProduct
                            ? setEditingProduct({...editingProduct, stock_quantity: parseInt(e.target.value) || 0})
                            : setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value) || 0})
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        value={editingProduct ? (editingProduct.barcode || "") : (newProduct.barcode || "")}
                        onChange={(e) => 
                          editingProduct
                            ? setEditingProduct({...editingProduct, barcode: e.target.value})
                            : setNewProduct({...newProduct, barcode: e.target.value})
                        }
                        placeholder="Enter barcode"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={editingProduct ? (editingProduct.sku || "") : (newProduct.sku || "")}
                        onChange={(e) => 
                          editingProduct
                            ? setEditingProduct({...editingProduct, sku: e.target.value})
                            : setNewProduct({...newProduct, sku: e.target.value})
                        }
                        placeholder="Enter SKU"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={editingProduct ? (editingProduct.description || "") : (newProduct.description || "")}
                      onChange={(e) => 
                        editingProduct
                          ? setEditingProduct({...editingProduct, description: e.target.value})
                          : setNewProduct({...newProduct, description: e.target.value})
                      }
                      placeholder="Enter product description"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingProduct ? handleUpdateProduct : handleAddProduct}>
                    {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Active products in inventory</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(p => p.stock_quantity < 10).length}
              </div>
              <p className="text-xs text-muted-foreground">Items with less than 10 units</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
              <Scan className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(products.reduce((sum, product) => sum + (product.selling_price * product.stock_quantity), 0))}
              </div>
              <p className="text-xs text-muted-foreground">Based on selling prices</p>
            </CardContent>
          </Card>
        </div>

        {/* Export/Import Manager */}
        <Card>
          <CardHeader>
            <CardTitle>Import/Export Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ExportImportManager 
              data={products}
              onImport={handleImportProducts}
              dataType="products"
            />
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Package className="h-8 w-8 mb-2" />
                <p>No products found</p>
                <p className="text-sm">Add your first product to get started</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.barcode && `Barcode: ${product.barcode}`}
                              {product.sku && `SKU: ${product.sku}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category_id}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(product.selling_price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.cost_price)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={product.stock_quantity < 10 ? "destructive" : "default"}>
                            {product.stock_quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => product.id && handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};