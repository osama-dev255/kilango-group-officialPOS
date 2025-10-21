import { useState } from "react";
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
  const { toast } = useToast();

  // Mock product data
  const products = [
    { id: "1", name: "Wireless Headphones", price: 99.99, barcode: "123456789012" },
    { id: "2", name: "Coffee Maker", price: 79.99, barcode: "234567890123" },
    { id: "3", name: "Running Shoes", price: 129.99, barcode: "345678901234" },
    { id: "4", name: "Smartphone", price: 699.99, barcode: "456789012345" },
    { id: "5", name: "Laptop", price: 1299.99, barcode: "567890123456" },
    { id: "6", name: "Smartphone Case", price: 24.99, barcode: "456789012346" },
    { id: "7", name: "Water Bottle", price: 19.99, barcode: "567890123457" },
    { id: "8", name: "Desk Lamp", price: 39.99, barcode: "678901234567" },
    { id: "9", name: "Notebook Set", price: 14.99, barcode: "789012345678" },
    { id: "10", name: "Bluetooth Speaker", price: 59.99, barcode: "890123456789" },
  ];

  // Mock customer data
  const customers = [
    { id: "1", name: "John Smith", loyaltyPoints: 150 },
    { id: "2", name: "Sarah Johnson", loyaltyPoints: 320 },
    { id: "3", name: "Mike Williams", loyaltyPoints: 75 },
  ];

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const addToCart = (product: { id: string; name: string; price: number }) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
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

  const exportReceipt = () => {
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
    ExportUtils.exportReceipt(mockTransaction, `receipt_${mockTransaction.id}`);
  };

  const exportReceiptAsPDF = () => {
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
    ExportUtils.exportReceiptAsPDF(mockTransaction, `receipt_${mockTransaction.id}`);
  };

  // Handle items scanned from barcode scanner
  const handleItemsScanned = (scannedItems: any[]) => {
    // Convert scanned items to cart items
    const newCartItems = scannedItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));
    
    // Merge with existing cart items
    const updatedCart = [...cart];
    
    newCartItems.forEach(newItem => {
      const existingItemIndex = updatedCart.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + newItem.quantity
        };
      } else {
        // Add new item
        updatedCart.push(newItem);
      }
    });
    
    setCart(updatedCart);
    setIsScannerOpen(false);
    toast({
      title: "Items Added",
      description: `${scannedItems.length} item(s) added to cart`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Sales Terminal" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-4 sm:p-6">
        {/* Barcode Scanner Modal */}
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 bg-background">
            <BarcodeScanner 
              onItemsScanned={handleItemsScanned} 
              onCancel={() => setIsScannerOpen(false)} 
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Product Search Section */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                    Product Search
                  </CardTitle>
                  <Button 
                    size="sm" 
                    className="w-full sm:w-auto" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsScannerOpen(true);
                    }}
                  >
                    <Scan className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Scan Items</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-3 sm:mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or barcode..."
                    className="pl-10 py-5 sm:py-6 text-sm sm:text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {searchTerm && (
                  <div className="border rounded-md max-h-48 sm:max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="p-3 sm:p-4 text-center text-muted-foreground text-sm sm:text-base">
                        No products found
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredProducts.map((product) => (
                          <div 
                            key={product.id}
                            className="p-3 sm:p-4 hover:bg-muted cursor-pointer flex justify-between items-center"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart(product);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`Add ${product.name} to cart`}
                          >
                            <div>
                              <div className="font-medium text-sm sm:text-base">{product.name}</div>
                              <div className="text-xs sm:text-sm text-muted-foreground">{product.barcode}</div>
                            </div>
                            <div className="font-medium text-sm sm:text-base">{formatCurrency(product.price)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cart Section */}
            <Card>
              <CardHeader className="py-4 sm:py-6">
                <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    Shopping Cart
                  </div>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {cart.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm sm:text-base">{item.name}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(item.id, -1);
                            }}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm sm:text-base w-6 sm:w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(item.id, 1);
                            }}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary and Actions */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="py-4 sm:py-6">
                <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-sm sm:text-base">Customer:</span>
                  <div className="flex flex-col items-end gap-2">
                    {selectedCustomer ? (
                      <>
                        <span className="text-sm sm:text-base">
                          {selectedCustomer.name}
                          <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                            <Star className="h-3 w-3 inline mr-1" />
                            {selectedCustomer.loyaltyPoints} pts
                          </span>
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs sm:text-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsCustomerDialogOpen(true);
                          }}
                        >
                          Change
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs sm:text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsCustomerDialogOpen(true);
                        }}
                      >
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Select Customer
                      </Button>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="discount" className="text-sm sm:text-base">Discount:</Label>
                    <Select 
                      value={discountType} 
                      onValueChange={(value: "percentage" | "amount") => setDiscountType(value)}
                    >
                      <SelectTrigger className="w-20 sm:w-24">
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
                      className="w-16 sm:w-20 text-sm"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Discount:</span>
                    <span className="text-red-500">-{formatCurrency(discountAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Tax (8%):</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-base sm:text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(totalWithTax)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      processTransaction();
                    }} 
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
                    size="lg"
                    disabled={cart.length === 0}
                  >
                    Process Payment
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCart([]);
                    }} 
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
                    disabled={cart.length === 0}
                  >
                    Clear Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-10"
              />
            </div>
            
            <div className="border rounded-md max-h-60 overflow-y-auto">
              <div 
                className="p-3 hover:bg-muted cursor-pointer border-b"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedCustomer(null);
                  setIsCustomerDialogOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedCustomer(null);
                    setIsCustomerDialogOpen(false);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Select walk-in customer"
              >
                <div className="font-medium">Walk-in Customer</div>
              </div>
              
              {customers.map((customer) => (
                <div 
                  key={customer.id}
                  className="p-3 hover:bg-muted cursor-pointer border-b"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedCustomer(customer);
                    setIsCustomerDialogOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedCustomer(customer);
                      setIsCustomerDialogOpen(false);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select customer ${customer.name}`}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.loyaltyPoints} loyalty points
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="text-xl sm:text-2xl font-bold">{formatCurrency(totalWithTax)}</div>
              </div>
              
              <div className="space-y-2">
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
            </div>
            
            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <Label htmlFor="amountReceived">Amount Received</Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amountReceived"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                  />
                </div>
                {amountReceived && (
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
                      {change >= 0 ? formatCurrency(change) : formatCurrency(0)}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPaymentDialogOpen(false);
                }} 
                className="flex-1 min-w-[100px]"
              >
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  printReceipt();
                }} 
                className="flex-1 min-w-[100px]"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  exportReceipt();
                }} 
                className="flex-1 min-w-[100px]"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  completeTransaction();
                }}
                className="flex-1 min-w-[100px]"
              >
                Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};