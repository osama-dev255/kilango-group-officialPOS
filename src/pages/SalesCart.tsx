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
import { getProducts, getCustomers, updateProductStock, createCustomer, createSale, createSaleItem, createDebt, Product, Customer as DatabaseCustomer } from "@/services/databaseService";

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
  address?: string;
  email?: string;
  phone?: string;
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
  const [isTransactionCompleteDialogOpen, setIsTransactionCompleteDialogOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedTransaction, setCompletedTransaction] = useState<any>(null); // Store completed transaction for printing
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false); // State for adding new customer
  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: ""
  }); // State for new customer data
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
          loyaltyPoints: customer.loyalty_points || 0,
          address: customer.address || '',
          email: customer.email || '',
          phone: customer.phone || ''
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
    (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.includes(searchTerm)) ||
    (product.sku && product.sku.includes(searchTerm))
  );

  const addToCart = (product: Product) => {
    // Check if product is out of stock
    if (product.stock_quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock`,
        variant: "destructive",
      });
      return;
    }
    
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
        quantity: 0, // Changed to 0 as requested
      };
      setCart([...cart, newItem]);
    }
    
    setSearchTerm("");
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change);
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
  
  // Tax is displayed as 18% but doesn't affect calculation (for display purposes only)
  const tax = total * 0.18; // 18% tax for display
  const totalWithTax = total; // Tax doesn't affect the actual total
  
  const amountReceivedNum = parseFloat(amountReceived) || 0;
  const change = amountReceivedNum - total; // Change calculation based on actual total without tax

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

  const completeTransaction = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive",
      });
      return;
    }

    // Check if payment method is Debt and customer details are required
    if (paymentMethod === "debt" && !selectedCustomer) {
      toast({
        title: "Error",
        description: "Customer details are required for Debt transactions",
        variant: "destructive",
      });
      setIsCustomerDialogOpen(true); // Open customer selection dialog
      return;
    }

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
      ? AutomationService.calculateLoyaltyPoints(total) // Use total without tax for loyalty points
      : 0;

    try {
      // Create the sale record in the database
      const saleData = {
        customer_id: selectedCustomer?.id || null,
        user_id: null, // In a real app, this would be the current user ID
        invoice_number: `INV-${Date.now()}`,
        sale_date: new Date().toISOString(),
        subtotal: subtotal,
        discount_amount: discountAmount,
        tax_amount: tax, // Display only tax (18%)
        total_amount: totalWithTax, // Actual total without tax effect
        amount_paid: paymentMethod === "debt" ? 0 : (parseFloat(amountReceived) || totalWithTax),
        change_amount: paymentMethod === "debt" ? 0 : change,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "debt" ? "unpaid" : "paid",
        sale_status: "completed",
        notes: paymentMethod === "debt" ? "Debt transaction - payment pending" : ""
      };

      const createdSale = await createSale(saleData);
      
      if (!createdSale) {
        throw new Error("Failed to create sale record");
      }

      // Create sale items for each product in the cart
      const itemsWithQuantity = cart.filter(item => item.quantity > 0);
      for (const item of itemsWithQuantity) {
        const saleItemData = {
          sale_id: createdSale.id || '',
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          discount_amount: 0, // In a real app, this would be calculated
          tax_amount: item.price * item.quantity * 0.18, // Display only tax (18%)
          total_price: item.price * item.quantity
        };
        
        await createSaleItem(saleItemData);
      }

      // Create debt record for debt transactions
      if (paymentMethod === "debt" && selectedCustomer) {
        const debtData = {
          customer_id: selectedCustomer.id,
          debt_type: "customer",
          amount: totalWithTax,
          description: `Debt for sale ${createdSale.id || 'unknown'}`,
          status: "outstanding",
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        };

        const createdDebt = await createDebt(debtData);
        if (!createdDebt) {
          console.warn("Failed to create debt record for transaction");
        }
      }

      // Update stock quantities for each item in the cart
      for (const item of itemsWithQuantity) {
        // Find the original product to get current stock
        const product = products.find(p => p.id === item.id);
        if (product) {
          // Calculate new stock quantity
          const newStock = Math.max(0, product.stock_quantity - item.quantity);
          // Update stock in database
          await updateProductStock(item.id, newStock);
        }
      }
      
      // Reload products to get updated stock quantities
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);

      // Create transaction object for printing
      const transaction = {
        id: createdSale.id || Date.now().toString(),
        date: createdSale.sale_date || new Date().toISOString(),
        items: cart,
        subtotal: subtotal,
        tax: tax, // Display only tax (18%)
        discount: discountAmount,
        total: totalWithTax, // Actual total without tax effect
        paymentMethod: paymentMethod,
        amountReceived: paymentMethod === "debt" ? 0 : (parseFloat(amountReceived) || 0),
        change: paymentMethod === "debt" ? 0 : change,
        customer: selectedCustomer // Include customer information
      };

      // Store transaction for potential printing
      setCompletedTransaction(transaction);

      // Show transaction complete dialog instead of toast
      setIsPaymentDialogOpen(false);
      setIsTransactionCompleteDialogOpen(true);
      
      // Clear cart and reset form (but don't show toast yet)
      setCart([]);
      setSelectedCustomer(null);
      setDiscountValue("");
      setAmountReceived("");
      
      toast({
        title: "Success",
        description: `Transaction completed successfully${paymentMethod === "debt" ? " as Debt" : ""}`,
      });
    } catch (error) {
      console.error("Error completing transaction:", error);
      toast({
        title: "Error",
        description: "Failed to complete transaction: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Print receipt
  const printReceipt = () => {
    // In a real app, this would fetch the transaction details
    const mockTransaction = {
      id: Date.now().toString(),
      items: cart,
      subtotal: subtotal,
      tax: tax, // Display only tax (18%)
      discount: discountAmount,
      total: totalWithTax, // Actual total without tax effect
      paymentMethod: paymentMethod,
      amountReceived: parseFloat(amountReceived) || totalWithTax,
      change: change
    };
    PrintUtils.printReceipt(mockTransaction);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.first_name || !newCustomer.last_name) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const customerData = {
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        email: newCustomer.email || "",
        phone: newCustomer.phone || "",
        address: newCustomer.address || "",
        loyalty_points: 0,
        is_active: true
      };

      const createdCustomer = await createCustomer(customerData);
      
      if (createdCustomer) {
        // Format the created customer to match our Customer interface
        const formattedCustomer: Customer = {
          id: createdCustomer.id || '',
          name: `${createdCustomer.first_name} ${createdCustomer.last_name}`,
          loyaltyPoints: createdCustomer.loyalty_points || 0,
          address: createdCustomer.address || '',
          email: createdCustomer.email || '',
          phone: createdCustomer.phone || ''
        };
        
        // Add the new customer to the customers list
        setCustomers([...customers, formattedCustomer]);
        
        // Select the newly created customer
        setSelectedCustomer(formattedCustomer);
        
        // Close the dialog
        setIsCustomerDialogOpen(false);
        
        // Reset the new customer form
        setNewCustomer({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          address: ""
        });
        
        toast({
          title: "Success",
          description: "Customer added successfully",
        });
      } else {
        throw new Error("Failed to create customer");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    }
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
                                <div className="flex items-center mt-1">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                    Stock: {product.stock_quantity}
                                  </span>
                                  {product.stock_quantity === 0 && (
                                    <span className="text-xs bg-red-100 text-red-800 px-1 rounded ml-1">
                                      Out of Stock
                                    </span>
                                  )}
                                </div>
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
                      <div key={item.id} className={`flex items-center justify-between p-3 border rounded-lg ${item.quantity === 0 ? 'opacity-50' : ''}`}>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(item.price)} × {item.quantity}
                            {item.quantity === 0 && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Not counted</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = Math.max(0, parseInt(e.target.value) || 0);
                              // Check if the new quantity exceeds available stock
                              const product = products.find(p => p.id === item.id);
                              if (product && newQuantity > product.stock_quantity) {
                                toast({
                                  title: "Insufficient Stock",
                                  description: `Only ${product.stock_quantity} units available for ${product.name}`,
                                  variant: "destructive",
                                });
                                return;
                              }
                              setCart(cart.map(cartItem => 
                                cartItem.id === item.id 
                                  ? { ...cartItem, quantity: newQuantity } 
                                  : cartItem
                              ));
                            }}
                            className="w-16"
                          />
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
                        <span>Tax (18%):</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
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
                        Earn {AutomationService.calculateLoyaltyPoints(total)} points
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
                    placeholder={discountType === "percentage" ? "0%" : "Tsh0.00"}
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
                        <SelectItem value="debt">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Debt
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
                      <span>Tax (18%):</span>
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
        <Dialog open={isCustomerDialogOpen} onOpenChange={(open) => {
          setIsCustomerDialogOpen(open);
          if (!open) {
            // Reset new customer form when dialog is closed
            setIsAddingNewCustomer(false);
            setNewCustomer({
              first_name: "",
              last_name: "",
              email: "",
              phone: "",
              address: ""
            });
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isAddingNewCustomer ? "Add New Customer" : "Select Customer"}
              </DialogTitle>
            </DialogHeader>
            
            {isAddingNewCustomer ? (
              // New Customer Form
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({...newCustomer, first_name: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({...newCustomer, last_name: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    placeholder="Enter email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    placeholder="Enter address"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingNewCustomer(false);
                      setNewCustomer({
                        first_name: "",
                        last_name: "",
                        email: "",
                        phone: "",
                        address: ""
                      });
                    }}
                  >
                    Back
                  </Button>
                  <Button onClick={handleCreateCustomer}>
                    Add Customer
                  </Button>
                </div>
              </div>
            ) : (
              // Customer Selection List
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading customers...
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      className="w-full"
                      onClick={() => setIsAddingNewCustomer(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Customer
                    </Button>
                    
                    {customers.length === 0 ? (
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
                )}
              </div>
            )}
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

        {/* Transaction Complete Dialog */}
        <Dialog open={isTransactionCompleteDialogOpen} onOpenChange={setIsTransactionCompleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Complete</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-green-600 mb-2">Success!</div>
                <p className="text-muted-foreground">
                  Transaction processed successfully for {formatCurrency(totalWithTax)}
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => {
                  // Just close the dialog and reset
                  setIsTransactionCompleteDialogOpen(false);
                }}>
                  Quit Cart
                </Button>
                <Button onClick={() => {
                  // Print receipt and then close
                  if (completedTransaction) {
                    PrintUtils.printReceipt(completedTransaction);
                  }
                  setIsTransactionCompleteDialogOpen(false);
                  toast({
                    title: "Transaction Processed",
                    description: `Sale completed for ${formatCurrency(totalWithTax)}${selectedCustomer ? ` (${AutomationService.calculateLoyaltyPoints(total)} points earned)` : ''}`,
                  });
                }}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
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
