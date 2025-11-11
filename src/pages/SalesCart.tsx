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
import WhatsAppUtils from "@/utils/whatsappUtils";
// Import Supabase database service
import { getProducts, getCustomers, updateProductStock, createCustomer, createSale, createSaleItem, createDebt, Product, Customer as DatabaseCustomer } from "@/services/databaseService";
import { canCreateSales } from "@/utils/salesPermissionUtils";

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

    // Check if user has permission to create sales
    const hasPermission = await canCreateSales();
    if (!hasPermission) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create sales. Only salesmen and admins can create sales.",
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
        user_id: null, // In In a real app, this would be the current user ID
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
      
      // DISABLED: Send WhatsApp notification to business numbers only for the first sale of the day
      // try {
      //   // Check if this is the first sale of the business day
      //   if (WhatsAppUtils.isFirstSaleOfDay()) {
      //     const message = WhatsAppUtils.generateSalesNotificationMessage(
      //       createdSale.id || Date.now().toString(),
      //       totalWithTax,
      //       paymentMethod,
      //       selectedCustomer?.name
      //     );
          
      //     // Send message to all business numbers
      //     WhatsAppUtils.sendWhatsAppMessageToBusiness(message);
      //   }
      // } catch (whatsappError) {
      //   console.warn("Failed to send WhatsApp notification:", whatsappError);
      //   // Don't block the transaction if WhatsApp fails
      // }
      
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
      
      <main className="container-responsive py-4 xs:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-4 xs:gap-6">
          {/* Left Column - Product Search and Cart */}
          <div className="xl:col-span-2 space-y-4 xs:space-y-6">
            {/* Product Search Section */}
            <Card className="card-padding">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-responsive-xl flex items-center gap-2">
                  <Search className="h-5 w-5 xs:h-6 xs:w-6" />
                  Product Search
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products by name, barcode, or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 py-5 text-responsive-base"
                    />
                  </div>
                  <Button 
                    onClick={() => setIsScannerOpen(true)} 
                    className="btn-touch px-3 xs:px-4"
                  >
                    <Scan className="h-4 w-4 xs:h-5 xs:w-5 mr-1 xs:mr-2" />
                    <span className="hidden xs:inline">Scan</span>
                  </Button>
                </div>
                
                {searchTerm && (
                  <div className="max-h-60 xs:max-h-80 overflow-y-auto border rounded-md p-2 bg-muted/50">
                    {filteredProducts.length > 0 ? (
                      <div className="space-y-1">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
                            onClick={() => addToCart(product)}
                          >
                            <div>
                              <p className="font-medium text-responsive-base">{product.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Stock: {product.stock_quantity}</span>
                                {product.barcode && (
                                  <span className="hidden xs:inline">| {product.barcode}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-responsive-base">
                                {formatCurrency(product.selling_price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">
                        No products found matching "{searchTerm}"
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cart Items Section */}
            <Card className="card-padding">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-responsive-xl flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 xs:h-6 xs:w-6" />
                  Shopping Cart
                  {cart.length > 0 && (
                    <Badge variant="secondary" className="text-xs xs:text-sm">
                      {cart.reduce((total, item) => total + item.quantity, 0)} items
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cart.length > 0 ? (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-responsive-base truncate">{item.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 xs:gap-3">
                          <div className="flex items-center gap-1 xs:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="h-8 w-8 xs:h-9 xs:w-9 p-0 btn-touch"
                            >
                              <Minus className="h-3 w-3 xs:h-4 xs:w-4" />
                            </Button>
                            <span className="w-8 xs:w-10 text-center font-medium text-responsive-base">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="h-8 w-8 xs:h-9 xs:w-9 p-0 btn-touch"
                            >
                              <Plus className="h-3 w-3 xs:h-4 xs:w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 xs:h-9 xs:w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 btn-touch"
                          >
                            <Trash2 className="h-4 w-4 xs:h-5 xs:w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 xs:py-12">
                    <ShoppingCart className="h-12 w-12 xs:h-16 xs:w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-responsive-base">
                      Your cart is empty. Add products to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary and Actions */}
          <div className="space-y-4 xs:space-y-6">
            {/* Customer Selection */}
            <Card className="card-padding">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-responsive-lg flex items-center gap-2">
                  <User className="h-5 w-5 xs:h-6 xs:w-6" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedCustomer ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-responsive-base">{selectedCustomer.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 xs:h-4 xs:w-4" />
                          <span>{selectedCustomer.loyaltyPoints} points</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCustomer(null)}
                        className="h-8 w-8 p-0 btn-touch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedCustomer.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <span className="hidden xs:inline">📞</span>
                        {selectedCustomer.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <Button 
                    onClick={() => setIsCustomerDialogOpen(true)} 
                    variant="outline" 
                    className="w-full btn-touch"
                  >
                    <User className="h-4 w-4 xs:h-5 xs:w-5 mr-2" />
                    Select Customer
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="card-padding">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-responsive-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="discount" className="text-muted-foreground">Discount</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={discountType} onValueChange={(value: "percentage" | "amount") => setDiscountType(value)}>
                          <SelectTrigger className="w-20 xs:w-24 h-8 xs:h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">%</SelectItem>
                            <SelectItem value="amount">TZS</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          id="discount"
                          type="number"
                          placeholder="0"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          className="w-20 xs:w-24 h-8 xs:h-9 text-right"
                        />
                      </div>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Discount</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    <p>Tax (18%): {formatCurrency(tax)} (for display purposes only)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="card-padding">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-responsive-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 xs:h-6 xs:w-6" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                  <Button
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("cash")}
                    className="h-16 xs:h-20 flex flex-col gap-1 btn-touch"
                  >
                    <Wallet className="h-5 w-5 xs:h-6 xs:w-6" />
                    <span className="text-xs xs:text-sm">Cash</span>
                  </Button>
                  <Button
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("card")}
                    className="h-16 xs:h-20 flex flex-col gap-1 btn-touch"
                  >
                    <CreditCard className="h-5 w-5 xs:h-6 xs:w-6" />
                    <span className="text-xs xs:text-sm">Card</span>
                  </Button>
                  <Button
                    variant={paymentMethod === "mobile" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("mobile")}
                    className="h-16 xs:h-20 flex flex-col gap-1 btn-touch col-span-2 xs:col-span-1"
                  >
                    <Download className="h-5 w-5 xs:h-6 xs:w-6" />
                    <span className="text-xs xs:text-sm">Mobile Money</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="sticky bottom-4 space-y-3">
              <Button
                onClick={processTransaction}
                disabled={cart.length === 0}
                className="w-full h-12 xs:h-14 text-responsive-lg btn-touch"
              >
                <Printer className="h-5 w-5 xs:h-6 xs:w-6 mr-2" />
                Process Transaction
              </Button>
              
              <Button
                variant="outline"
                onClick={onBack}
                className="w-full h-12 xs:h-14 text-responsive-base btn-touch"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-md xs:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-responsive-xl">Select Customer</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2 mb-4">
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
              {customers
                .filter(customer => 
                  customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (customer.phone && customer.phone.includes(searchTerm))
                )
                .map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setIsCustomerDialogOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3" />
                        <span>{customer.loyaltyPoints} points</span>
                        {customer.phone && (
                          <span>| {customer.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <Button 
              onClick={() => {
                setIsAddingNewCustomer(true);
                setIsCustomerDialogOpen(false);
              }} 
              variant="outline" 
              className="w-full"
            >
              <User className="h-4 w-4 mr-2" />
              Add New Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-responsive-xl">Process Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total">Total Amount</Label>
                <div className="text-2xl font-bold mt-1">{formatCurrency(total)}</div>
              </div>
              <div>
                <Label htmlFor="amountReceived">Amount Received</Label>
                <Input
                  id="amountReceived"
                  type="number"
                  placeholder="0.00"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="text-lg"
                />
              </div>
            </div>
            
            {amountReceivedNum > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span>Change</span>
                  <span className={`font-bold ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(change)}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={completeTransaction}
                disabled={amountReceivedNum < total || change < 0}
              >
                Complete Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Complete Dialog */}
      <Dialog open={isTransactionCompleteDialogOpen} onOpenChange={setIsTransactionCompleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-responsive-xl text-center">Transaction Complete!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-muted-foreground mb-2">Transaction ID: {transactionId}</p>
            <p className="text-2xl font-bold mb-4">{formatCurrency(total)}</p>
            <p className="text-muted-foreground">Payment Method: {paymentMethod}</p>
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
            }}
            onCancel={() => setIsScannerOpen(false)}
            autoAddToCart={true} // Enable auto-add for better sales experience
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
