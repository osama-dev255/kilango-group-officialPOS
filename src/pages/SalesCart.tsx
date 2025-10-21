import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Minus, Trash2, ShoppingCart, Search, User, Percent, CreditCard, Wallet, Scan, Star, Printer, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { AutomationService } from "@/services/automationService";
import { PrintUtils } from "@/utils/printUtils";
import { ExportUtils } from "@/utils/exportUtils";
// Import Supabase database service
import { getProducts, getCustomers, Product, Customer as DatabaseCustomer } from "@/services/databaseService";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  loyaltyPoints: number;
}

// Update the temporary product interface to match the Product type
interface TempProduct {
  id: string;
  name: string;
  selling_price: number;
  barcode?: string;
  sku?: string;
  cost_price: number;
  stock_quantity: number;
}

interface SalesCartProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
  autoOpenScanner?: boolean;
}

export const SalesCart = ({ username, onBack, onLogout }: SalesCartProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load products and customers from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load products
        const productData = await getProducts();
        // Fix: Set products directly without mapping to a different structure
        setProducts(productData);
        
        // Load customers
        const customerData = await getCustomers();
        const formattedCustomers = customerData.map(customer => ({
          id: customer.id || '',
          name: `${customer.first_name} ${customer.last_name}`,
          loyaltyPoints: customer.loyalty_points || 0
        }));
        setCustomers(formattedCustomers);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load products and customers",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm)) ||
    (product.sku && product.sku.includes(searchTerm))
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: product.id || '',
        name: product.name,
        price: product.selling_price,
        quantity: 1,
      };
      setCart([...cart, newItem]);
    }
    
    setSearchTerm("");
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const discountAmount = discountType === "percentage" 
    ? subtotal * (parseFloat(discountValue) / 100 || 0)
    : parseFloat(discountValue) || 0;
    
  const total = subtotal - discountAmount;
  
  const tax = total * 0.08; // 8% tax
  const totalWithTax = total + tax;
  
  const amountReceivedNum = parseFloat(amountReceived) || 0;
  const change = amountReceivedNum - totalWithTax;

  const processTransaction = () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive",
      });
      return;
    }

    setIsPaymentDialogOpen(true);
  };

  const completeTransaction = () => {
    if (paymentMethod === "cash" && change < 0) {
      toast({
        title: "Error",
        description: "Insufficient payment amount",
        variant: "destructive",
      });
      return;
    }

    // Calculate loyalty points automatically
    const loyaltyPoints = selectedCustomer 
      ? AutomationService.calculateLoyaltyPoints(totalWithTax)
      : 0;

    // Create transaction object for printing
    const transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: cart,
      subtotal: subtotal,
      tax: tax,
      discount: discountAmount,
      total: totalWithTax,
      paymentMethod: paymentMethod,
      amountReceived: parseFloat(amountReceived) || 0,
      change: change
    };

    // Simulate processing transaction
    toast({
      title: "Transaction Processed",
      description: `Sale completed for $${totalWithTax.toFixed(2)}${loyaltyPoints > 0 ? ` (${loyaltyPoints} points earned)` : ''}`,
    });
    
    setCart([]);
    setSelectedCustomer(null);
    setDiscountValue("");
    setAmountReceived("");
    setIsPaymentDialogOpen(false);
  };

  // Print receipt
  const printReceipt = () => {
    // In a real app, this would fetch the transaction details
    const mockTransaction = {
      id: Date.now().toString(),
      items: cart,
      subtotal: subtotal,
      tax: tax,
      discount: discountAmount,
      total: totalWithTax,
      paymentMethod: paymentMethod,
      amountReceived: parseFloat(amountReceived) || totalWithTax,
      change: change
    };
    PrintUtils.printReceipt(mockTransaction);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Sales Terminal" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Sales Terminal</h1>
            <p className="text-muted-foreground">Process sales transactions and manage customer orders</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
              <Scan className="h-4 w-4 mr-2" />
              Scan Item
            </Button>
            <Button onClick={processTransaction}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Process Sale
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Search and Cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Search */}
            <Card>
              <CardHeader>
                <CardTitle>Product Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name, barcode, or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchTerm && (
                  <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Loading products...
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No products found
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredProducts.map((product) => (
                          <div 
                            key={product.id}
                            className="p-3 hover:bg-muted cursor-pointer flex justify-between items-center"
                            onClick={() => addToCart(product)}
                          >
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.barcode && `Barcode: ${product.barcode}`}
                                {product.sku && `SKU: ${product.sku}`}
                              </div>
                            </div>
                            <div className="font-medium">{formatCurrency(product.selling_price)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shopping Cart */}
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
                    <p>Your cart is empty</p>
                    <p className="text-sm">Add products using the search above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(item.price)} × {item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="font-medium ml-4">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%):</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(totalWithTax)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Customer and Transaction Info */}
          <div className="space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCustomer ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{selectedCustomer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedCustomer.loyaltyPoints} loyalty points
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomer(null)}
                      >
                        Change
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>
                        Earn {AutomationService.calculateLoyaltyPoints(totalWithTax)} points
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      className="w-full"
                      onClick={() => setIsCustomerDialogOpen(true)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Select Customer
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Loyalty points will be calculated automatically
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discount */}
            <Card>
              <CardHeader>
                <CardTitle>Discount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Select 
                    value={discountType} 
                    onValueChange={(value) => setDiscountType(value as "percentage" | "amount")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder={discountType === "percentage" ? "0%" : "$0.00"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Cash
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Credit Card
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%):</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(totalWithTax)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={processTransaction}
                    disabled={cart.length === 0}
                  >
                    Process Sale
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Customer Selection Dialog */}
        <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Customer</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading customers...
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No customers found
                </div>
              ) : (
                <div className="space-y-2">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 border rounded-lg hover:bg-muted cursor-pointer flex justify-between items-center"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsCustomerDialogOpen(false);
                      }}
                    >
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.loyaltyPoints} loyalty points
                        </div>
                      </div>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Amount</Label>
                  <div className="text-2xl font-bold">{formatCurrency(totalWithTax)}</div>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <div className="flex items-center gap-2">
                    {paymentMethod === "cash" ? (
                      <Wallet className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    <span className="capitalize">{paymentMethod}</span>
                  </div>
                </div>
              </div>
              
              {paymentMethod === "cash" && (
                <div>
                  <Label>Amount Received</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                  />
                  {amountReceived && (
                    <div className="mt-2 text-sm">
                      Change: <span className={change < 0 ? "text-red-500" : "text-green-500"}>
                        {formatCurrency(change)}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={completeTransaction}>
                  Complete Sale
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Barcode Scanner */}
        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Scan Barcode</DialogTitle>
            </DialogHeader>
            <BarcodeScanner 
              onItemsScanned={(items) => {
                // Convert scanned items to cart items
                const cartItems = items.map(item => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity
                }));
                setCart([...cart, ...cartItems]);
                setIsScannerOpen(false);
              }}
              onCancel={() => setIsScannerOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};